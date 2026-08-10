// Slim, side-effect-free module used by the Stripe webhook.
// Kept intentionally light (no "use server", no next/cache) so the webhook
// route cold-starts fast. Errors are logged — never thrown to the caller.

import { createAdminClient } from "@/lib/supabase/server"
import { buildPaymentConfirmedHtml } from "@/lib/email-template"

export async function enviarCorreoPagoConfirmado(userId: string, solicitudId: string) {
  try {
    const supabase = await createAdminClient()

    const { data: solicitud } = await supabase
      .from("solicitudes_membresia")
      .select("language")
      .eq("id", solicitudId)
      .single()

    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    const email = user?.email
    if (!email) return

    const lang = solicitud?.language === "es" ? "es" : "en"
    const nombre = (user?.user_metadata?.nombre_completo as string) || email.split("@")[0] || ""

    const { data: configRows } = await supabase.from("app_config").select("key, value")
    const config: Record<string, string> = {}
    for (const row of configRows ?? []) config[row.key] = row.value

    if (!process.env.RESEND_API_KEY) return

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${config.email_from_name || "IKMA"} <${config.email_from_email || "onboarding@resend.dev"}>`,
        to: email,
        subject: lang === "es" ? "Pago recibido — IKMA" : "Payment received — IKMA",
        html: buildPaymentConfirmedHtml({ nombre, lang }),
      }),
    })

    if (!res.ok) {
      console.error("[payment-email] resend error:", res.status, await res.text())
    }
  } catch (err) {
    console.error("[payment-email] error sending confirmation email:", err)
  }
}