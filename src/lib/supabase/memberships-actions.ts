"use server"

import { revalidatePath } from "next/cache"
import { checkAdmin, registrarActividad } from "@/lib/supabase/admin-helpers"
import { createAdminClient } from "@/lib/supabase/server"
import { cancelCustomerSubscriptions } from "@/lib/stripe/subscriptions"
import { hasVigenteAcceso } from "@/lib/membership"
import { sendMembershipDecisionEmail } from "@/lib/supabase/email-actions"

type AdminClient = Awaited<ReturnType<typeof createAdminClient>>

// Access is derived from the applications themselves (see hasVigenteAcceso),
// not from the last decision taken: a paying member with an approved
// application who also has a rejected duplicate keeps their access.
async function tieneAccesoVigente(admin: AdminClient, usuarioId: string): Promise<boolean> {
  const { data } = await admin
    .from("solicitudes_membresia")
    .select("tipo_miembro, estado")
    .eq("usuario_id", usuarioId)
    .in("estado", ["aprobada", "pagada"])

  return hasVigenteAcceso(data ?? [])
}

/**
 * Revokes access AND stops billing for a member whose last remaining
 * entitlement was just taken away. Returns true when something was revoked.
 *
 * Doing both together is the point: revoking access without cancelling the
 * subscription leaves a rejected applicant paying every period for nothing.
 */
async function revocarAccesoYCobro(admin: AdminClient, usuarioId: string): Promise<boolean> {
  if (await tieneAccesoVigente(admin, usuarioId)) return false

  const { data: perfil } = await admin
    .from("perfiles")
    .select("stripe_customer_id")
    .eq("id", usuarioId)
    .single()

  const { error } = await admin
    .from("perfiles")
    .update({
      suscripcion_activa: false,
      membresia_gratis: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", usuarioId)
  if (error) console.error("[memberships-actions] revoke error:", error.message)

  const billing = await cancelCustomerSubscriptions(perfil?.stripe_customer_id ?? null)
  if (billing.failed.length) {
    // Log loudly: the member lost access but Stripe is still charging them.
    console.error(
      `[memberships-actions] ATENCION: acceso revocado a ${usuarioId} pero Stripe no cancelo:`,
      billing.failed
    )
  }
  return true
}

async function enviarCorreoDecision(admin: AdminClient, usuarioId: string, language: string | null, decision: "aprobada" | "rechazada") {
  try {
    const { data: { user } } = await admin.auth.admin.getUserById(usuarioId)
    const email = user?.email
    if (!email) return
    const nombre = (user?.user_metadata?.nombre_completo as string) || email.split("@")[0] || ""
    await sendMembershipDecisionEmail({
      email,
      nombre,
      lang: language === "es" ? "es" : "en",
      decision,
    })
  } catch (err) {
    console.error(`[memberships-actions] decision email (${decision}) error:`, err)
  }
}

export async function approveMembership(id: string): Promise<void> {
  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()
  const { data: solicitud } = await admin
    .from("solicitudes_membresia")
    .select("usuario_id, tipo_miembro, language")
    .eq("id", id)
    .single()
  await admin.from("solicitudes_membresia").update({ estado: "aprobada" }).eq("id", id)
  if (solicitud?.usuario_id) {
    if (solicitud.tipo_miembro === 3) {
      // Student: activates the free plan, NOT the paid subscription
      await admin.from("perfiles").update({ membresia_gratis: true }).eq("id", solicitud.usuario_id)
    } else {
      await admin.from("perfiles").update({ suscripcion_activa: true }).eq("id", solicitud.usuario_id)
    }
    await enviarCorreoDecision(admin, solicitud.usuario_id, solicitud.language, "aprobada")
  }
  await registrarActividad(supabase, "membresia_aprobada", `Membership ${id.slice(0, 8)} approved`, "solicitudes_membresia", id)
  revalidatePath("/admin/members")
}

export async function rejectMembership(id: string): Promise<void> {
  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()
  const { data: solicitud } = await admin
    .from("solicitudes_membresia")
    .select("usuario_id, tipo_miembro, language")
    .eq("id", id)
    .single()
  await admin.from("solicitudes_membresia").update({ estado: "rechazada" }).eq("id", id)
  // Revoking access also stops the money: a rejected applicant must not keep
  // paying. The helper checks the remaining applications first, so rejecting a
  // duplicate row never cancels the subscription of an approved member.
  if (solicitud?.usuario_id) {
    await revocarAccesoYCobro(admin, solicitud.usuario_id)
    await enviarCorreoDecision(admin, solicitud.usuario_id, solicitud.language, "rechazada")
  }
  await registrarActividad(supabase, "membresia_rechazada", `Membership ${id.slice(0, 8)} rejected`, "solicitudes_membresia", id)
  revalidatePath("/admin/members")
}

export async function deleteMembership(id: string): Promise<void> {
  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()

  // Read before deleting: only an application that actually granted access can
  // take it away (and with it the Stripe subscription). Removing a junk or
  // incomplete row must leave an approved member untouched.
  const { data: solicitud } = await admin
    .from("solicitudes_membresia")
    .select("usuario_id, estado")
    .eq("id", id)
    .single()

  await admin.from("solicitudes_membresia").delete().eq("id", id)

  if (solicitud?.usuario_id && ["aprobada", "pagada"].includes(solicitud.estado ?? "")) {
    await revocarAccesoYCobro(admin, solicitud.usuario_id)
  }

  await registrarActividad(supabase, "membresia_eliminada", `Membership ${id.slice(0, 8)} deleted`, "solicitudes_membresia", id)
  revalidatePath("/admin/members")
}
