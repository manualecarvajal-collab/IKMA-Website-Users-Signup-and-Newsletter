import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { name: fileName, type: fileType, folder } = await request.json()

    if (!fileName) {
      return NextResponse.json({ error: "No file name provided" }, { status: 400 })
    }

    if (!fileType?.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    const ext = fileName.split(".").pop()
    const storagePath = folder
      ? `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      : `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data, error } = await supabase.storage
      .from("article-images")
      .createSignedUploadUrl(storagePath, { upsert: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("article-images").getPublicUrl(storagePath)

    return NextResponse.json({ signedUrl: data.signedUrl, publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
