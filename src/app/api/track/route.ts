import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const { path } = await request.json()
  if (!path || typeof path !== "string") return NextResponse.json({ error: "path required" }, { status: 400 })
  const admin = await createAdminClient()
  await admin.from("visitas").insert({ path })
  return NextResponse.json({ ok: true })
}
