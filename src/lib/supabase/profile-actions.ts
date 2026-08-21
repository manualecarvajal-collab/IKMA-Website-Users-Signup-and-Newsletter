"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getStripe } from "@/lib/stripe/server"
import { validatePassword } from "@/lib/password"

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

async function cancelarSuscripcionesActivas(stripeCustomerId: string | null) {
  if (!stripeCustomerId) return
  const stripe = getStripe()
  if (!stripe) return

  try {
    const { data } = await stripe.subscriptions.list({ customer: stripeCustomerId, status: "active", limit: 10 })
    await Promise.all(data.map((sub) => stripe.subscriptions.cancel(sub.id)))
  } catch (err) {
    // Never block account deletion on a Stripe hiccup; the webhook keeps
    // suscripcion_activa in sync for whatever survives.
    console.error("[cancelarSuscripcionesActivas] error:", err)
  }
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
  const { error } = await admin
    .from("solicitudes_membresia")
    .update({ tipo_miembro: tipoMiembro, region, pais })
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)

  if (error) return { error: "Could not update your membership information. Please try again." }

  revalidatePath("/perfil")
  return { success: "ok" }
}

export async function cancelMembership() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single()

  // Immediate cancellation: webhook customer.subscription.deleted flips
  // suscripcion_activa to false, revoking member access right away.
  await cancelarSuscripcionesActivas(perfil?.stripe_customer_id ?? null)

  revalidatePath("/perfil")
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, stripe_customer_id")
    .eq("id", user.id)
    .single()
  if (perfil?.rol === "administrador") return

  // Stop billing before the user row disappears.
  await cancelarSuscripcionesActivas(perfil?.stripe_customer_id ?? null)

  // Deleting the auth user cascades perfiles, solicitudes and recordatorios.
  const admin = await createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return

  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
