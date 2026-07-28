import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single()
    if (perfil?.rol !== "administrador") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { name: fileName, type: fileType } = await request.json()

    if (!fileName) {
      return NextResponse.json({ error: "No file name provided" }, { status: 400 })
    }

    if (fileType !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    const ext = fileName.split(".").pop()
    const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const admin = await createAdminClient()

    const { data, error } = await admin.storage
      .from("revistas-pdf")
      .createSignedUploadUrl(storagePath)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = admin.storage.from("revistas-pdf").getPublicUrl(storagePath)

    return NextResponse.json({ signedUrl: data.signedUrl, publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}