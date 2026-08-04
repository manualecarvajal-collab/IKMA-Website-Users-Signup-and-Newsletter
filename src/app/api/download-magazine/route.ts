import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

function extractPdfPath(archivoUrl: string): string {
  const marker = "/object/public/revistas-pdf/"
  const idx = archivoUrl.indexOf(marker)
  if (idx === -1) return archivoUrl
  return archivoUrl.slice(idx + marker.length)
}

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
    .select("suscripcion_activa, membresia_gratis")
    .eq("id", user.id)
    .single()

  const { data: revista } = await supabase
    .from("revistas")
    .select("id, archivo_url")
    .eq("id", revistaId)
    .single()

  if (!revista?.archivo_url) {
    return NextResponse.json({ error: "Magazine not found" }, { status: 404 })
  }

  // Paid subscribers: any magazine. Free members: only the first published edition.
  let puedeLeer = !!perfil?.suscripcion_activa
  if (!puedeLeer && perfil?.membresia_gratis) {
    const { data: primera } = await supabase
      .from("revistas")
      .select("id")
      .eq("publicado", true)
      .order("fecha_publicacion", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
    puedeLeer = primera?.id === revista.id
  }

  if (!puedeLeer) {
    return NextResponse.json({ error: "Active subscription required" }, { status: 403 })
  }

  const pdfPath = extractPdfPath(revista.archivo_url)

  const admin = await createAdminClient()
  const { data: signedUrlData, error } = await admin
    .storage
    .from("revistas-pdf")
    .createSignedUrl(pdfPath, 60)

  if (error || !signedUrlData?.signedUrl) {
    console.error("Signed URL error:", error?.message ?? "unknown")
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 })
  }

  return NextResponse.redirect(signedUrlData.signedUrl)
}
