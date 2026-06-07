import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const response = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL!))

  const cookiesToClear = response.cookies.getAll().map((c) => c.name)
  if (cookiesToClear.length === 0) {
    const prefixes = ["sb-", "supabase-"]
    for (const prefix of prefixes) {
      for (let i = 0; i < 5; i++) {
        const name = i === 0 ? `${prefix}auth-token` : `${prefix}auth-token.${i}`
        response.cookies.set(name, "", { maxAge: 0, path: "/" })
      }
    }
  }

  return response
}