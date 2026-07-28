import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, inquiryType, message } = body

    if (!firstName || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    // Limit message length
    if (String(message).length > 5000) {
      return NextResponse.json({ error: "Message too long (max 5000 characters)" }, { status: 400 })
    }

    // Escape all user input to prevent HTML injection
    const safeFirstName = escapeHtml(firstName)
    const safeLastName = escapeHtml(lastName)
    const safeEmail = escapeHtml(email)
    const safeInquiryType = escapeHtml(inquiryType).replace(/[\r\n]/g, " ").slice(0, 100)
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>")

    const admin = await createAdminClient()
    const { data: configRows } = await admin.from("app_config").select("*")

    const config: Record<string, string> = {}
    if (configRows) {
      for (const row of configRows) {
        config[row.key] = row.value
      }
    }

    const fromName = config.email_from_name || "IKMA"
    const fromEmail = config.email_from_email || "onboarding@resend.dev"
    const from = `${fromName} <${fromEmail}>`

    const payload = {
      from,
      to: "info@ikmaglobal.com",
      subject: `Website Contact: ${safeInquiryType} from ${safeFirstName} ${safeLastName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:700">Name</td><td style="padding:8px">${safeFirstName} ${safeLastName}</td></tr>
          <tr><td style="padding:8px;font-weight:700">Email</td><td style="padding:8px">${safeEmail}</td></tr>
          <tr><td style="padding:8px;font-weight:700">Inquiry Type</td><td style="padding:8px">${safeInquiryType}</td></tr>
          <tr><td style="padding:8px;font-weight:700">Message</td><td style="padding:8px">${safeMessage}</td></tr>
        </table>
      `,
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Resend error:", err)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Contact form error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
