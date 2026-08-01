import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const VALID_TYPES = new Set(["recovery", "signup", "invite", "magiclink", "email_change"])

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const next = searchParams.get("next") ?? "/actualizar-password"

  if (!token_hash || !type || !VALID_TYPES.has(type)) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as "recovery" })

  if (error) {
    console.error("[/auth/confirm] verifyOtp error:", error.message)
    return NextResponse.redirect(new URL("/login?error=invalid_link", request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
}
