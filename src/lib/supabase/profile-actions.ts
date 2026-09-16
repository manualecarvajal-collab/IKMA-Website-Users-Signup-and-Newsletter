"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cancelCustomerSubscriptions, resumeCustomerSubscriptions } from "@/lib/stripe/subscriptions"
import { prepararEliminacion, registrarEliminacionDeUsuario } from "@/lib/supabase/deleted-users"
import { validatePassword } from "@/lib/password"
import { puedeCambiarPlan } from "@/lib/membership"

type ActionState = { error?: string; success?: string } | undefined

export async function updateProfileName(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const nombre = (formData.get("nombre_completo") as string)?.trim()
  if (!nombre) return { error: "Name is required" }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error: perfilError } = await supabase
    .from("perfiles")
    .update({ nombre_completo: nombre, updated_at: new Date().toISOString() })
    .eq("id", user.id)
  if (perfilError) return { error: perfilError.message }

  // Keep emails in sync — they read the name from auth user_metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: { nombre_completo: nombre },
  })
  if (authError) return { error: authError.message }

  revalidatePath("/perfil")
  return { success: "ok" }
}

export async function updateProfileEmail(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const email = (formData.get("email") as string)?.trim()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ email })
  if (error) return { error: error.message }

  revalidatePath("/perfil")
  return { success: "ok" }
}

export async function updateProfilePassword(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const currentPassword = formData.get("current_password") as string
  const password = formData.get("password") as string
  const error = validatePassword(password)
  if (error) return { error }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Users with a password must prove they know it before changing it.
  const hasPassword = user.identities?.some((i) => i.provider === "email")
  if (hasPassword) {
    if (!currentPassword) return { error: "Enter your current password." }
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email ?? "",
      password: currentPassword,
    })
    if (verifyError) return { error: "Current password is incorrect." }
  }

  const { error: authError } = await supabase.auth.updateUser({ password })
  if (authError) return { error: authError.message }

  revalidatePath("/perfil")
  return { success: "ok" }
}

async function stripeCustomerIdDeUsuario(userId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single()
  return perfil?.stripe_customer_id ?? null
}

export async function updateMembershipInfo(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const tipoMiembro = Number(formData.get("tipo_miembro"))
  const region = (formData.get("region") as string) ?? ""
  const pais = (formData.get("pais") as string)?.trim()

  if (![1, 2, 3, 4].includes(tipoMiembro)) return { error: "Invalid member type" }
  if (!["A", "B"].includes(region)) return { error: "Invalid region" }
  if (!pais) return { error: "Country of residence is required" }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const admin = await createAdminClient()

  const { data: actual } = await admin
    .from("solicitudes_membresia")
    .select("estado, tipo_miembro, region")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!actual) return { error: "no_application" }

  // Cambiar de categoría o región después de pagar alteraría lo que se cobró sin
  // tocar Stripe, así que a partir de ahí solo se puede corregir el país.
  const cambiaPlan = actual.tipo_miembro !== tipoMiembro || actual.region !== region
  if (cambiaPlan && !puedeCambiarPlan(actual.estado)) {
    console.warn("[updateMembershipInfo] cambio de plan bloqueado:", user.id, actual.estado)
    return { error: "plan_locked" }
  }

  const cambios = cambiaPlan ? { tipo_miembro: tipoMiembro, region, pais } : { pais }

  const { error } = await admin
    .from("solicitudes_membresia")
    .update(cambios)
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)

  if (error) return { error: "Could not update your membership information. Please try again." }

  revalidatePath("/perfil")
  return { success: "ok" }
}

// Cancelling stops the renewal, not the access: the member paid for the current
// period, so they keep it. When the period ends Stripe fires
// customer.subscription.deleted and the webhook flips suscripcion_activa off.
export async function cancelMembership(_prevState: ActionState, _formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const customerId = await stripeCustomerIdDeUsuario(user.id)
  if (!customerId) return { error: "no_subscription" }

  const result = await cancelCustomerSubscriptions(customerId, { atPeriodEnd: true })
  if (result.failed.length && !result.cancelled.length) return { error: "stripe_error" }
  if (!result.cancelled.length) return { error: "no_subscription" }
  if (result.failed.length) {
    // Partial failure: some subscriptions were scheduled and others were not.
    console.error("[cancelMembership] fallos parciales:", result.failed)
    return { error: "stripe_error" }
  }

  revalidatePath("/perfil")
  return { success: "cancelled" }
}

export async function resumeMembership(_prevState: ActionState, _formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const customerId = await stripeCustomerIdDeUsuario(user.id)
  if (!customerId) return { error: "no_subscription" }

  const result = await resumeCustomerSubscriptions(customerId)
  if (result.failed.length && !result.cancelled.length) return { error: "stripe_error" }
  if (!result.cancelled.length) return { error: "no_subscription" }

  revalidatePath("/perfil")
  return { success: "resumed" }
}

// The member's own decision to leave always goes through, even when Stripe is
// unreachable: blocking the deletion would trap them in an account they asked
// to remove. Anything we could not clean up is recorded in the snapshot, shown
// to the admin as a notification and retried daily by the pending-cancellations
// cron, so nothing is silently forgotten.
export async function deleteAccount(): Promise<{ ok: boolean; error?: "delete"; billingPending?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "delete" }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, stripe_customer_id")
    .eq("id", user.id)
    .single()
  if (perfil?.rol === "administrador") return { ok: false, error: "delete" }

  const admin = await createAdminClient()

  // Snapshot first: after the delete there is nothing left to read.
  const preparacion = await prepararEliminacion(admin, user.id)

  // Stop billing before the rows disappear; a failure here no longer blocks.
  const billing = await cancelCustomerSubscriptions(perfil?.stripe_customer_id ?? null)
  if (billing.failed.length) {
    console.error("[deleteAccount] Stripe no canceló; queda pendiente para el cron:", billing.failed)
  }

  // Deleting the auth user cascades perfiles, solicitudes and recordatorios.
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    console.error("[deleteAccount] no se pudo eliminar el usuario:", error.message)
    return { ok: false, error: "delete" }
  }

  const suscripcionCancelada = billing.failed.length === 0
  await registrarEliminacionDeUsuario(admin, {
    preparacion,
    motivo: "usuario",
    suscripcionCancelada,
    detalle: suscripcionCancelada
      ? null
      : `Stripe did not confirm the cancellation: ${billing.failed.map((f) => `${f.id} (${f.error})`).join("; ")}`,
  })

  // The member is gone, so this log entry is written with the admin client and
  // no usuario_id (that row no longer exists to reference).
  await admin.from("actividad_admin").insert({
    usuario_id: null,
    usuario_nombre: preparacion.nombreCompleto || preparacion.email || "Deleted account",
    tipo: "usuario_autoeliminado",
    descripcion: `User "${preparacion.nombreCompleto || preparacion.email || user.id}" deleted their own account`,
    ref_tabla: "usuarios_eliminados",
    ref_id: user.id,
  })

  // Session clearing + navigation is handled on the browser side by the
  // caller, so the navbar re-reads the cleared session and drops logged-in UI.
  return { ok: true, billingPending: !suscripcionCancelada }
}
