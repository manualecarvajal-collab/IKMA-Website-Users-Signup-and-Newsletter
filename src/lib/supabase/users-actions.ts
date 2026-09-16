"use server"

import { revalidatePath } from "next/cache"
import { checkAdmin, registrarActividad } from "@/lib/supabase/admin-helpers"
import { createAdminClient } from "@/lib/supabase/server"
import { cancelCustomerSubscriptions } from "@/lib/stripe/subscriptions"
import {
  getUsuariosEliminados,
  marcarEliminacionesVistas,
  prepararEliminacion,
  registrarEliminacionDeUsuario,
} from "@/lib/supabase/deleted-users"
import {
  ESTADO_ELIMINADO,
  estadoPrevio,
  motivoLabel,
  nombreEliminado,
  type UserDeletionInfo,
} from "@/lib/deleted-accounts"

export async function getAllUsers() {
  await checkAdmin()
  const admin = await createAdminClient()

  const { data: perfiles } = await admin
    .from("perfiles")
    .select("id, nombre_completo, rol, suscripcion_activa")
  const perfilesMap = new Map((perfiles ?? []).map(p => [p.id, p]))

  // Source of truth: solicitudes_membresia. Keep the latest application per user.
  const { data: solicitudes } = await admin
    .from("solicitudes_membresia")
    .select("usuario_id, tipo_miembro, estado")
    .order("created_at", { ascending: true })
  const membresiaMap = new Map<string, { tipo_miembro: number | null; estado: string | null }>()
  for (const s of solicitudes ?? []) {
    membresiaMap.set(s.usuario_id, { tipo_miembro: s.tipo_miembro, estado: s.estado })
  }

  const { data: authData } = await admin.auth.admin.listUsers()
  const authUsers = authData?.users ?? []

  const vivos = authUsers.map(u => {
    const perfil = perfilesMap.get(u.id)
    // No application on record and no active subscription → the registration
    // is incomplete (student is the only free membership, and students always
    // leave an application behind after submitting).
    const membresia = membresiaMap.get(u.id)
    const sinPago = !perfil || !perfil.suscripcion_activa
    const meta = u.user_metadata as Record<string, unknown> | undefined
    return {
      id: u.id,
      // Google OAuth stores the name as full_name/name, not nombre_completo.
      // Last resort: derive a placeholder from the email local part.
      nombre_completo:
        perfil?.nombre_completo ||
        (meta?.nombre_completo as string) ||
        (meta?.full_name as string) ||
        (meta?.name as string) ||
        u.email?.split("@")[0] ||
        "",
      email: u.email || "No email",
      membresia: membresia ?? (sinPago ? { tipo_miembro: null, estado: "incompleta" } : null),
      rol: perfil?.rol || "lector",
      created_at: u.created_at,
      // Cuenta viva: sin datos de eliminación.
      eliminado: null as UserDeletionInfo | null,
    }
  })

  // Deleted accounts no longer exist in auth.users, so they only appear here
  // through the snapshot. That is the whole point: the admin must be able to see
  // WHO left (by their own decision or through the panel) after they are gone.
  const eliminados = (await getUsuariosEliminados()).map(s => ({
    id: s.usuario_id,
    nombre_completo: nombreEliminado(s),
    email: s.email || "No email",
    membresia: {
      tipo_miembro: s.tipo_miembro,
      estado: ESTADO_ELIMINADO,
    },
    rol: s.rol || "lector",
    created_at: s.usuario_created_at ?? s.deleted_at,
    eliminado: {
      motivo: motivoLabel(s),
      cuando: s.deleted_at,
      estadoPrevio: estadoPrevio(s),
      suscripcionCancelada: s.suscripcion_cancelada,
      detalle: s.detalle,
    } as UserDeletionInfo,
  }))

  return [...vivos, ...eliminados].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

/** Acknowledges the deleted-account notifications shown on the dashboard. */
export async function marcarNotificacionesVistas(): Promise<void> {
  await checkAdmin()
  const marcadas = await marcarEliminacionesVistas()
  console.log(`[admin] notificaciones de eliminación marcadas como vistas: ${marcadas}`)
  revalidatePath("/admin")
  revalidatePath("/admin/suscriptores")
  revalidatePath("/admin/members")
}

export async function updateUserName(userId: string, nombre: string): Promise<{ success?: boolean; error?: string }> {
  const nombreLimpio = nombre.trim()
  if (!nombreLimpio) return { error: "Name is required" }

  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()

  const { data: target } = await admin
    .from("perfiles")
    .select("rol, nombre_completo")
    .eq("id", userId)
    .single()
  if (target?.rol === "administrador") return { error: "Cannot rename an admin user" }

  const nombreViejo = target?.nombre_completo || "User"
  await admin.from("perfiles").update({ nombre_completo: nombreLimpio }).eq("id", userId)
  // Keep emails in sync — they read the name from auth user_metadata
  await admin.auth.admin.updateUserById(userId, { user_metadata: { nombre_completo: nombreLimpio } })

  await registrarActividad(supabase, "usuario_editado", `Renamed user "${nombreViejo}" → "${nombreLimpio}"`, "perfiles", userId)

  revalidatePath("/admin/suscriptores")
  revalidatePath("/admin/members")
  return { success: true }
}

export async function deleteUser(userId: string): Promise<void> {
  const { supabase, user: adminUser } = await checkAdmin()
  const admin = await createAdminClient()

  const { data: target } = await admin
    .from("perfiles")
    .select("rol, nombre_completo, stripe_customer_id")
    .eq("id", userId)
    .single()
  if (target?.rol === "administrador") {
    throw new Error("Cannot delete an admin user")
  }

  // Snapshot before the rows disappear: afterwards there is nothing to read.
  const preparacion = await prepararEliminacion(admin, userId)

  // Stop billing first. Once the profile is gone nothing links the Stripe
  // customer to a member, so an uncancelled subscription would keep charging
  // with no one able to notice. A failure is recorded in the snapshot and
  // retried by the pending-cancellations cron rather than blocking the admin.
  const billing = await cancelCustomerSubscriptions(target?.stripe_customer_id ?? null)
  const suscripcionCancelada = billing.failed.length === 0
  if (!suscripcionCancelada) {
    console.error("[deleteUser] Stripe no canceló; queda pendiente para el cron:", billing.failed)
  }

  const nombreUser = target?.nombre_completo || preparacion.email || "User"
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  if (deleteError) {
    console.error("[deleteUser] no se pudo eliminar el usuario:", deleteError.message)
    throw new Error("Could not delete the user")
  }
  await supabase.from("perfiles").delete().eq("id", userId)

  await registrarEliminacionDeUsuario(admin, {
    preparacion,
    motivo: "admin",
    eliminadoPor: adminUser.id,
    eliminadoPorNombre: (adminUser.user_metadata?.nombre_completo as string) || adminUser.email || null,
    suscripcionCancelada,
    detalle: suscripcionCancelada
      ? null
      : `Stripe did not confirm the cancellation: ${billing.failed.map((f) => `${f.id} (${f.error})`).join("; ")}`,
  })

  await registrarActividad(supabase, "usuario_eliminado", `Deleted user "${nombreUser}" (${userId})"`, "perfiles", userId)

  revalidatePath("/admin/suscriptores")
  revalidatePath("/admin/members")
  revalidatePath("/admin")
}
