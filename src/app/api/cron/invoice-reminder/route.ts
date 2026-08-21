import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe/server"
import { createAdminClient } from "@/lib/supabase/server"
import { buildInvoiceReminderHtml } from "@/lib/email-template"
import { sendResendEmail } from "@/lib/resend"

// Vercel Cron — daily. Emails each member once, 7 days before their next
// automatic charge (deduplicated by recordatorios_cobro unique constraint).
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 503 })
  }

  const supabase = await createAdminClient()
  const now = Date.now()
  const windowEnd = now + 7 * 24 * 60 * 60 * 1000

  const subs: { sub: import("stripe").Stripe.Subscription; periodEndSec: number }[] = []
  for await (const sub of stripe.subscriptions.list({ status: "active", limit: 100 })) {
    // current_period_end lives on the subscription items (Stripe 2026 API)
    const periodEndSec = Math.max(...sub.items.data.map((i) => i.current_period_end ?? 0), 0)
    if (periodEndSec * 1000 >= now && periodEndSec * 1000 <= windowEnd) subs.push({ sub, periodEndSec })
  }

  let enviados = 0
  let errores = 0

  for (const { sub, periodEndSec } of subs) {
    try {
      const customerId = sub.customer as string
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("id, nombre_completo")
        .eq("stripe_customer_id", customerId)
        .single()
      if (!perfil) continue

      // Skip if this charge was already notified (unique constraint).
      const { error: insertError } = await supabase.from("recordatorios_cobro").insert({
        usuario_id: perfil.id,
        subscription_id: sub.id,
        period_end: new Date(periodEndSec * 1000).toISOString(),
      })
      if (insertError) continue

      const { data: { user } } = await supabase.auth.admin.getUserById(perfil.id)
      const email = user?.email
      if (!email) continue

      const { data: solicitud } = await supabase
        .from("solicitudes_membresia")
        .select("language")
        .eq("usuario_id", perfil.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      const lang = solicitud?.language === "es" ? "es" : "en"

      const precio = sub.items.data[0]?.price
      const monto = precio
        ? new Intl.NumberFormat(lang === "es" ? "es" : "en", {
            style: "currency",
            currency: precio.currency.toUpperCase(),
          }).format((precio.unit_amount ?? 0) / 100)
        : ""
      const fecha = new Date(periodEndSec * 1000).toLocaleDateString(
        lang === "es" ? "es-VE" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      )
      const nombre = perfil.nombre_completo || (user?.user_metadata?.nombre_completo as string) || ""

      const { data: configRows } = await supabase.from("app_config").select("key, value")
      const config: Record<string, string> = {}
      for (const row of configRows ?? []) config[row.key] = row.value

      if (!process.env.RESEND_API_KEY) break

      const res = await sendResendEmail({
        to: email,
        subject: lang === "es"
          ? "Próximo cobro de tu membresía IKMA"
          : "Your upcoming IKMA membership charge",
        html: buildInvoiceReminderHtml({ nombre, lang, fechaCobro: fecha, monto }),
        fromName: config.email_from_name,
        fromEmail: config.email_from_email,
      })
      if (!res.ok) {
        console.error("[cron-invoice-reminder] resend error:", res.status, await res.text())
        errores++
      } else {
        enviados++
      }
    } catch (err) {
      console.error("[cron-invoice-reminder] error:", err)
      errores++
    }
  }

  return NextResponse.json({ revisadas: subs.length, enviados, errores })
}

export const dynamic = "force-dynamic"
