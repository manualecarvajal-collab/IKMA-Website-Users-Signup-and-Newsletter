import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { buildNewsletterHtml } from "@/lib/email-template"
import { filterByAudiences, type Audience } from "@/lib/newsletter-audiences"
import { getAllRecipientsForAdmin } from "@/lib/supabase/email-actions"
import { sendResendEmail } from "@/lib/resend"

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = await createAdminClient()

  // Find newsletters due for sending
  const { data: due, error: fetchError } = await admin
    .from("newsletters")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .limit(5) // max 5 per cron run to avoid timeouts

  if (fetchError || !due?.length) {
    return NextResponse.json({ processed: 0 })
  }

  // Load email config once
  const { data: configRows } = await admin.from("app_config").select("key, value")
  const config: Record<string, string> = {}
  for (const row of configRows ?? []) config[row.key] = row.value

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Resend API key not configured" }, { status: 503 })
  }

  let processed = 0

  for (const newsletter of due) {
    try {
      // Mark as sending to prevent duplicate cron runs
      await admin.from("newsletters").update({ status: "sending" }).eq("id", newsletter.id)

      // Build recipient list (same logic as sendNewsletter)
      const allRecipients = await getAllRecipientsForAdmin(admin)

      const audiencias = (newsletter.audiencias as Audience[]) ?? ["registrados"]
      const recipients = filterByAudiences(allRecipients, audiencias)

      let sent = 0
      const sentEmails: string[] = []
      const failedEmails: { email: string; status: number; body: string }[] = []

      for (const { email, nombre } of recipients) {
        const resp = await sendResendEmail({
          to: email,
          subject: `Newsletter: ${newsletter.titulo}`,
          html: buildNewsletterHtml({
            nombre,
            titulo: newsletter.titulo,
            contenido_html: newsletter.contenido_html,
            imagen_url: newsletter.imagen_url,
            from_name: config.email_from_name || "IKMA",
            email,
          }),
          fromName: config.email_from_name,
          fromEmail: config.email_from_email,
        })
        if (resp.ok) {
          sent++
          sentEmails.push(email)
        } else {
          const body = await resp.text().catch(() => "")
          failedEmails.push({ email, status: resp.status, body })
          console.error(`[cron-send-newsletter] FAILED ${resp.status} → ${email}: ${body}`)
        }
      }

      // Update newsletter with results
      await admin.from("newsletters").update({
        status: "sent",
        destinatarios: sent,
        destinatarios_emails: sentEmails,
        ...(failedEmails.length ? { failed_emails: failedEmails } : {}),
      }).eq("id", newsletter.id)

      await admin.from("actividad_admin").insert({
        tipo: "newsletter_enviado_cron",
        descripcion: `Newsletter "${newsletter.titulo}" sent to ${sent} of ${recipients.length} recipients (scheduled)`,
        ref_tabla: "newsletters",
        ref_id: newsletter.id,
      })

      processed++
    } catch (err) {
      console.error(`[cron-send-newsletter] error on ${newsletter.id}:`, err)
      // Mark as failed so it doesn't retry forever
      await admin.from("newsletters").update({ status: "failed" }).eq("id", newsletter.id)
    }
  }

  return NextResponse.json({ processed })
}

export const dynamic = "force-dynamic"
