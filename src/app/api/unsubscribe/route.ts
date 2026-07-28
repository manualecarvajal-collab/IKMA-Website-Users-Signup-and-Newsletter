import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return new Response("Missing email parameter", { status: 400 })
  }

  const admin = await createAdminClient()

  // Find user by email via auth admin API
  const { data: users } = await admin.auth.admin.listUsers()
  const user = users?.users.find((u) => u.email === email)

  if (user) {
    await admin
      .from("perfiles")
      .update({ newsletter_optout: true })
      .eq("id", user.id)
  }

  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Unsubscribed - IKMA</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
  .card { background: white; padding: 48px; border-radius: 16px; text-align: center; max-width: 480px; margin: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  h1 { color: #074469; margin-bottom: 12px; }
  p { color: #49454f; line-height: 1.6; }
</style>
</head>
<body>
  <div class="card">
    <h1>You have been unsubscribed</h1>
    <p>You will no longer receive email communications from IKMA.</p>
    <p style="font-size: 14px; color: #79747e;">If this was a mistake, you can re-subscribe from your account settings.</p>
  </div>
</body>
</html>`,
    { headers: { "Content-Type": "text/html" } }
  )
}
