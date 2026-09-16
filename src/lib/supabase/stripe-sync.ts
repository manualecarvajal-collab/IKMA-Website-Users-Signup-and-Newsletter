import { createAdminClient } from "@/lib/supabase/server"
import { hasAprobacionPagada } from "@/lib/membership"
import { resumenDeAcceso } from "@/lib/stripe/access"

// Database side of the Stripe webhook: resolving which member an event belongs
// to, applying the access decision, and keeping the processed-event marker.
//
// Everything here is idempotent and safe to re-run: Stripe delivers events more
// than once, and the webhook retries happen after a 500.

type AdminClient = Awaited<ReturnType<typeof createAdminClient>>

/**
 * `getUserById` lanza (no devuelve error) si el id no es un UUID, y el `user_id`
 * llega desde la metadata de Stripe: cualquiera puede escribir ahí desde el
 * dashboard. Un valor inválido debe caer al respaldo por customer, no reventar
 * el webhook y dejar el evento reintentándose para siempre.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type MiembroResuelto = {
  userId: string
  email: string | null
  nombre: string
  lang: "en" | "es"
}

/**
 * Finds the member behind a billing event.
 *
 * New checkouts carry `user_id` in the subscription/session metadata. The three
 * subscriptions created before that existed only have the customer id, so the
 * profile lookup stays as the fallback.
 */
export async function resolverMiembro(
  admin: AdminClient,
  opts: { userId?: string | null; customerId?: string | null }
): Promise<MiembroResuelto | null> {
  let userId = opts.userId ?? null

  if (userId && !UUID.test(userId)) {
    console.warn("[stripe-sync] metadata user_id no es un UUID, se ignora:", userId)
    userId = null
  }

  if (!userId && opts.customerId) {
    const { data } = await admin
      .from("perfiles")
      .select("id")
      .eq("stripe_customer_id", opts.customerId)
      .maybeSingle()
    userId = data?.id ?? null
  }
  if (!userId) return null

  const [{ data: authData }, { data: solicitud }] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin
      .from("solicitudes_membresia")
      .select("language")
      .eq("usuario_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const user = authData?.user
  if (!user) return null

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  return {
    userId,
    email: user.email ?? null,
    nombre:
      (meta.nombre_completo as string) ||
      (meta.full_name as string) ||
      user.email?.split("@")[0] ||
      "",
    lang: solicitud?.language === "es" ? "es" : "en",
  }
}

/**
 * Access = an approved paid membership AND billing that is up to date.
 *
 * Returns whether the flag actually changed, so the caller can log only real
 * transitions instead of every renewal.
 */
export async function aplicarAcceso(
  admin: AdminClient,
  userId: string,
  cobroAlDia: boolean,
  motivo: string
): Promise<{ acceso: boolean; cambio: boolean }> {
  const { data: aprobadas } = await admin
    .from("solicitudes_membresia")
    .select("tipo_miembro, estado")
    .eq("usuario_id", userId)
    .eq("estado", "aprobada")

  const acceso = hasAprobacionPagada(aprobadas ?? [])

  const { data: perfil } = await admin
    .from("perfiles")
    .select("suscripcion_activa, nombre_completo")
    .eq("id", userId)
    .maybeSingle()

  // Sin aprobación del admin no hay nada que dar ni que quitar: un solicitante
  // que acaba de pagar sigue esperando su revisión manual.
  if (!acceso) return { acceso: false, cambio: false }
  if (perfil?.suscripcion_activa === cobroAlDia) return { acceso: cobroAlDia, cambio: false }

  const nuevoAcceso = cobroAlDia
  const { error } = await admin
    .from("perfiles")
    .update({ suscripcion_activa: nuevoAcceso, updated_at: new Date().toISOString() })
    .eq("id", userId)
  if (error) {
    console.error("[stripe-sync] no se pudo actualizar el acceso:", error.message)
    return { acceso: nuevoAcceso, cambio: false }
  }

  await admin.from("actividad_admin").insert({
    usuario_id: userId,
    usuario_nombre: perfil?.nombre_completo || "Member",
    tipo: nuevoAcceso ? "suscripcion_acceso_restaurado" : "suscripcion_acceso_revocado",
    descripcion: resumenDeAcceso(nuevoAcceso, motivo),
    ref_tabla: "perfiles",
    ref_id: userId,
  })

  return { acceso: nuevoAcceso, cambio: true }
}

/** Marks an event as processed. Written last, so failures still get retried. */
export async function marcarEventoProcesado(
  admin: AdminClient,
  event: { id: string; type: string; livemode: boolean },
  resumen: string
): Promise<void> {
  const { error } = await admin.from("stripe_events").insert({
    event_id: event.id,
    type: event.type,
    livemode: event.livemode,
    resumen,
  })
  // 23505 = already recorded (a redelivery raced us): harmless.
  if (error && error.code !== "23505") {
    console.error("[stripe-sync] no se pudo registrar el evento:", error.message)
  }
}

/**
 * Has this event already been applied? Returns false when the marker table is
 * missing, so a pending migration degrades to "process again" instead of
 * dropping events on the floor.
 */
export async function eventoYaProcesado(admin: AdminClient, eventId: string): Promise<boolean> {
  const { data, error } = await admin
    .from("stripe_events")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle()
  if (error) {
    if (error.code !== "PGRST205") console.error("[stripe-sync] evento:", error.message)
    return false
  }
  return !!data
}
