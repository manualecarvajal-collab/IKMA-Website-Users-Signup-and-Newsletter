import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { randomStoragePath, createSignedUpload } from "@/lib/uploads"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Any authenticated user may request a signed upload URL for a license file.
    // The URL is scoped to a random storage path, so it cannot be used to read
    // or overwrite other files. This endpoint is called by membership applicants.
    const { name: fileName, type: fileType } = await request.json()

    if (!fileName) {
      return NextResponse.json({ error: "No file name provided" }, { status: 400 })
    }

    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!allowed.includes(fileType)) {
      return NextResponse.json({ error: "Only PDF and image files are allowed" }, { status: 400 })
    }

    const storagePath = randomStoragePath("", fileName)

    const result = await createSignedUpload("membership-licenses", storagePath)
    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }
    if (!("data" in result) || !result.data) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    return NextResponse.json({ signedUrl: result.data.signedUrl, path: storagePath })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
