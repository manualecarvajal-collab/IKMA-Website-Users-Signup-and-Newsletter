const RESEND_URL = "https://api.resend.com/emails"

export function resendFrom(fromName?: string | null, fromEmail?: string | null): string {
  return `${fromName || "IKMA"} <${fromEmail || "onboarding@resend.dev"}>`
}

export function sendResendEmail(input: {
  to: string
  subject: string
  html: string
  fromName?: string | null
  fromEmail?: string | null
}): Promise<Response> {
  return fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom(input.fromName, input.fromEmail),
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  })
}
