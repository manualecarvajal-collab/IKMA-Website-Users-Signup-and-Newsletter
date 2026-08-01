import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const { code } = await request.json().catch(() => ({ code: null as string | null }))

  if (!code) {
    return NextResponse.json({ ok: false, message: "Missing code" }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
