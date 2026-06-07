import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const articuloId = searchParams.get("id")

  if (!articuloId) {
    return NextResponse.json({ error: "Missing article id" }, { status: 400 })
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

  const { data: articulo } = await supabase
    .from("articulos")
    .select("url_pdf_storage")
    .eq("id", articuloId)
    .single()

  if (!articulo?.url_pdf_storage) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 })
  }

  const { data: signedUrlData } = await supabase
    .storage
    .from("revistas-pdf")
    .createSignedUrl(articulo.url_pdf_storage, 60)

  if (!signedUrlData?.signedUrl) {
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 })
  }

  return NextResponse.redirect(signedUrlData.signedUrl)
}
