import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
  }

  const folder = (formData.get("folder") as string) || ""

  const ext = file.name.split(".").pop()
  const fileName = folder
    ? `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    : `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )

  const { error } = await supabase.storage
    .from("article-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from("article-images")
    .getPublicUrl(fileName)

  return NextResponse.json({ url: publicUrl })
}
