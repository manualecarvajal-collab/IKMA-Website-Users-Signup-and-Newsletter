"use client"

import { useState, useRef } from "react"

export function AvatarUpload({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue ?? "")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (rawFile: File) => {
    setUploading(true)
    setUploadError("")
    try {
      // ponytail: resize client-side; avatars are small by nature but users might pick a 12MP photo
      const MAX_DIM = 600
      const img = await createImageBitmap(rawFile)
      let w = img.width, h = img.height
      if (w > MAX_DIM || h > MAX_DIM) {
        if (w > h) { h = Math.round(h * MAX_DIM / w); w = MAX_DIM }
        else { w = Math.round(w * MAX_DIM / h); h = MAX_DIM }
      }
      const canvas = document.createElement("canvas")
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, w, h)
      img.close()
      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, "image/jpeg", 0.85))

      if (!blob) throw new Error("Image compression failed")
      const file = new File([blob], rawFile.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" })

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, type: file.type, folder: "avatars" }),
      })

      const text = await res.text()

      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(text || `HTTP ${res.status}`)
      }

      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      const uploadRes = await fetch(data.signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file to storage")
      }

      setUrl(data.publicUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setUploadError(`${message}. You can paste a URL below instead.`)
      console.error("Upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div>
      <p className="font-label-bold text-label-sm text-on-surface-variant mb-2">Author Avatar</p>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/30 flex items-center justify-center flex-shrink-0">
          {url ? (
            <img src={url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-2xl text-on-surface-variant/50">person</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="bg-primary text-on-primary font-label-bold text-label-sm px-4 py-2 rounded-lg hover:brightness-110 transition-colors cursor-pointer inline-block text-center">
            {uploading ? "Uploading..." : "Upload Picture"}
            <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} disabled={uploading} className="hidden" />
          </label>
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="text-error font-label-bold text-label-xs hover:underline cursor-pointer text-xs text-left"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      {uploadError && (
        <p className="font-body-md text-body-md text-error text-sm mt-2">{uploadError}</p>
      )}
      {uploadError && !url && (
        <input name={name} defaultValue={defaultValue ?? ""} placeholder="Paste avatar URL here..."
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 mt-2" />
      )}
      <input type="hidden" name={name} value={url} />
    </div>
  )
}
