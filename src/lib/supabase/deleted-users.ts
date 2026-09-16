import { createAdminClient } from "@/lib/supabase/server"
import { cancelCustomerSubscriptions } from "@/lib/stripe/subscriptions"
import { pendientesDeCancelar, type MotivoEliminacion, type SnapshotEliminado } from "@/lib/deleted-accounts"

// Server-side database access for deleted-account snapshots.
//
// Every write here is best-effort: the audit trail must never be the reason an
// account deletion fails. Reads tolerate the table not being migrated yet and
// return an empty list instead of breaking the admin panel.
//
// The snapshot is read BEFORE the account disappears (see prepararEliminacion)
// and written AFTER it is really gone, so a failed deletion never leaves a row
// claiming a user left when they did not.

type AdminClient = Awaited<ReturnType<typeof createAdminClient>>

const TABLA = "usuarios_eliminados"
const CAMPOS =
  "id, usuario_id, email, nombre_completo, rol, motivo, eliminado_por_nombre, tipo_miembro, region, estado_solicitud, stripe_customer_id, suscripcion_cancelada, detalle, visto_at, usuario_created_at, deleted_at"

function warn(contexto: string, error: { message: string } | null) {
  if (error) console.error(`[deleted-users] ${contexto}:`, error.message)
}

/** Everything we can still learn about the account, gathered before deleting it. */
export type PreparacionEliminacion = {
  usuarioId: string
  email: string | null
  nombreCompleto: string | null
  rol: string | null
  stripeCustomerId: string | null
  tipoMiembro: number | null
  region: string | null
  estadoSolicitud: string | null
  usuarioCreatedAt: string | null
}

export async function prepararEliminacion(admin: AdminClient, usuarioId: string): Promise<PreparacionEliminacion> {
  const [perfil, solicitud, authUser] = await Promise.all([
    admin.from("perfiles").select("rol, nombre_completo, stripe_customer_id").eq("id", usuarioId).maybeSingle(),
    admin
      .from("solicitudes_membresia")
      .select("tipo_miembro, region, estado")
      .eq("usuario_id", usuarioId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.auth.admin.getUserById(usuarioId),
  ])

  const user = authUser.data?.user
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>

  return {
    usuarioId,
    email: user?.email ?? null,
    nombreCompleto:
      perfil.data?.nombre_completo ??
      (meta.nombre_completo as string) ??
      (meta.full_name as string) ??
      (meta.name as string) ??
      null,
    rol: perfil.data?.rol ?? null,
    stripeCustomerId: perfil.data?.stripe_customer_id ?? null,
    tipoMiembro: solicitud.data?.tipo_miembro ?? null,
    region: solicitud.data?.region ?? null,
    estadoSolicitud: solicitud.data?.estado ?? null,
    usuarioCreatedAt: user?.created_at ?? null,
  }
}

/** Persists the snapshot once the account is actually gone. Never throws. */
export async function registrarEliminacionDeUsuario(
  admin: AdminClient,
  params: {
    preparacion: PreparacionEliminacion
    motivo: MotivoEliminacion
    eliminadoPor?: string | null
    eliminadoPorNombre?: string | null
    suscripcionCancelada: boolean
    detalle?: string | null
  }
): Promise<void> {
  const p = params.preparacion
  const { error } = await admin.from(TABLA).insert({
    usuario_id: p.usuarioId,
    email: p.email,
    nombre_completo: p.nombreCompleto,
    rol: p.rol,
    motivo: params.motivo,
    eliminado_por: params.eliminadoPor ?? null,
    eliminado_por_nombre: params.eliminadoPorNombre ?? null,
    tipo_miembro: p.tipoMiembro,
    region: p.region,
    estado_solicitud: p.estadoSolicitud,
    stripe_customer_id: p.stripeCustomerId,
    suscripcion_cancelada: params.suscripcionCancelada,
    detalle: params.detalle ?? null,
    usuario_created_at: p.usuarioCreatedAt,
  })
  warn("no se pudo registrar la eliminación", error)
}

/** Newest first. Returns [] while the migration is still pending. */
export async function getUsuariosEliminados(limit = 500): Promise<SnapshotEliminado[]> {
  const admin = await createAdminClient()
  const { data, error } = await admin
    .from(TABLA)
    .select(CAMPOS)
    .order("deleted_at", { ascending: false })
    .limit(limit)
  warn("lectura no disponible", error)
  return (data ?? []) as SnapshotEliminado[]
}

/**
 * Deletions the admin panel has not acknowledged yet, plus the real total so
 * the dashboard can say "and N more" without loading every row.
 */
export async function getEliminacionesNoVistas(
  limit = 20
): Promise<{ rows: SnapshotEliminado[]; total: number }> {
  const admin = await createAdminClient()
  const { data, error, count } = await admin
    .from(TABLA)
    .select(CAMPOS, { count: "exact" })
    .is("visto_at", null)
    .order("deleted_at", { ascending: false })
    .limit(limit)
  warn("lectura de no vistos no disponible", error)
  const rows = (data ?? []) as SnapshotEliminado[]
  return { rows, total: count ?? rows.length }
}

/** Acknowledges every pending deletion notification. */
export async function marcarEliminacionesVistas(): Promise<number> {
  const admin = await createAdminClient()
  const { data, error } = await admin
    .from(TABLA)
    .update({ visto_at: new Date().toISOString() })
    .is("visto_at", null)
    .select("id")
  warn("no se pudieron marcar como vistas", error)
  return data?.length ?? 0
}

/**
 * Retries the Stripe cancellations that failed during a deletion.
 *
 * This is what makes "a user can always delete their account" safe: the
 * deletion never blocks, and any subscription we could not stop is retried
 * daily until it is, with the outcome written back to the snapshot.
 */
export async function reintentarCancelacionesPendientes(): Promise<{
  revisadas: number
  canceladas: number
  fallidas: number
}> {
  const admin = await createAdminClient()
  const pendientes = pendientesDeCancelar(await getUsuariosEliminados(1000))
  let canceladas = 0
  let fallidas = 0

  for (const snapshot of pendientes) {
    const result = await cancelCustomerSubscriptions(snapshot.stripe_customer_id)
    const ok = result.failed.length === 0

    const { error } = await admin
      .from(TABLA)
      .update({
        suscripcion_cancelada: ok,
        detalle: ok
          ? `Subscription cancelled on retry (${result.cancelled.join(", ")})`
          : `Stripe still refusing: ${result.failed.map((f) => `${f.id} (${f.error})`).join("; ")}`,
      })
      .eq("id", snapshot.id)
    warn(`no se pudo actualizar el snapshot ${snapshot.id}`, error)

    if (ok) canceladas++
    else fallidas++
  }

  return { revisadas: pendientes.length, canceladas, fallidas }
}
