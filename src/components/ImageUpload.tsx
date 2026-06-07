"use client"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

export function ImageUpload({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue ?? "")
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const ext = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from("doctor-images")
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from("doctor-images")
        .getPublicUrl(fileName)

      setUrl(publicUrl)
    } catch (err) {
      console.error("Upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Photo</label>
      <div className="flex items-start gap-4">
        {url && (
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-container-high shrink-0 border border-outline-variant/30">
            <img src={url} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <label className="bg-primary text-on-primary font-label-bold text-label-sm px-4 py-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer inline-block">
            {uploading ? "Uploading..." : "Choose File"}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
          <input type="hidden" name={name} value={url} />
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="block text-error font-label-bold text-label-sm hover:underline cursor-pointer"
            >
              Remove image
            </button>
          )}
          {url && <p className="font-body-md text-body-md text-on-surface-variant text-sm break-all">{url}</p>}
        </div>
      </div>
    </div>
  )
}
