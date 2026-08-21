import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { randomStoragePath, createSignedUpload } from "@/lib/uploads"

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

    const storagePath = randomStoragePath("", fileName)

    const result = await createSignedUpload("revistas-pdf", storagePath)
    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }
    if (!("data" in result) || !result.data) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    return NextResponse.json({ signedUrl: result.data.signedUrl, publicUrl: result.publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
