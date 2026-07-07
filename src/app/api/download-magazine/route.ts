import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const revistaId = searchParams.get("id")

  if (!revistaId) {
    return NextResponse.json({ error: "Missing magazine id" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("suscripcion_activa")
    .eq("id", user.id)
    .single()

  if (!perfil?.suscripcion_activa) {
    return NextResponse.json({ error: "Active subscription required" }, { status: 403 })
  }

  const { data: revista } = await supabase
    .from("revistas")
    .select("archivo_url")
    .eq("id", revistaId)
    .single()

  if (!revista?.archivo_url) {
    return NextResponse.json({ error: "Magazine not found" }, { status: 404 })
  }

  const { data: signedUrlData } = await supabase
    .storage
    .from("revistas-pdf")
    .createSignedUrl(revista.archivo_url, 60)

  if (!signedUrlData?.signedUrl) {
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 })
  }

  return NextResponse.redirect(signedUrlData.signedUrl)
}
