import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, inquiryType, message } = body

    if (!firstName || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const admin = await createAdminClient()
    const { data: configRows, error: configErr } = await admin.from("app_config").select("*")
    if (configErr) console.error("Config fetch error:", configErr)

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
      to: "manuelecarvajal@gmail.com",
      subject: `Website Contact: ${inquiryType} from ${firstName} ${lastName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:700">Name</td><td style="padding:8px">${firstName} ${lastName}</td></tr>
          <tr><td style="padding:8px;font-weight:700">Email</td><td style="padding:8px">${email}</td></tr>
          <tr><td style="padding:8px;font-weight:700">Inquiry Type</td><td style="padding:8px">${inquiryType}</td></tr>
          <tr><td style="padding:8px;font-weight:700">Message</td><td style="padding:8px">${message.replace(/\n/g, "<br>")}</td></tr>
        </table>
      `,
    }

    console.error("DEBUG from:", from, "apiKey exists:", !!process.env.RESEND_API_KEY)

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
      return NextResponse.json({ error: `Resend: ${err}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Contact form error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
