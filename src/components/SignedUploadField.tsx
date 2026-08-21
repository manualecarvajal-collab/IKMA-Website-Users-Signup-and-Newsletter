"use client"

import { useState, useRef } from "react"
import Icon from "@/components/Icon"

export function SignedUploadField({
  name,
  defaultValue,
  label,
  onChange,
  endpoint = "/api/upload",
  folder,
  accept,
  maxDim,
  variant = "dropzone",
  fileKind = "image",
}: {
  name: string
  defaultValue?: string | null
  label?: string
  onChange?: (url: string) => void
  endpoint?: string
  folder?: string
  accept?: string
  maxDim?: number
  variant?: "dropzone" | "avatar"
  fileKind?: "image" | "pdf"
}) {
  const [url, setUrl] = useState(defaultValue ?? "")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync internal state when the parent changes the value (e.g. after a
  // remount from toggling preview/edit).
  const [prevDefault, setPrevDefault] = useState(defaultValue)
  if (prevDefault !== defaultValue) {
    setPrevDefault(defaultValue)
    setUrl(defaultValue ?? "")
  }

  const uploadFile = async (rawFile: File) => {
    setUploading(true)
    setUploadError("")
    try {
      let file = rawFile

      // ponytail: resize client-side before upload to avoid multi-MB images on the server
      if (fileKind === "image" && maxDim) {
        const img = await createImageBitmap(rawFile)
        let w = img.width, h = img.height
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim }
          else { w = Math.round(w * maxDim / h); h = maxDim }
        }
        const canvas = document.createElement("canvas")
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0, w, h)
        img.close()
        const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, "image/jpeg", 0.85))
        if (!blob) throw new Error("Image compression failed")
        file = new File([blob], rawFile.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" })
      }

      const body: Record<string, string> = { name: file.name, type: file.type }
      if (folder) body.folder = folder

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

      const value = data.publicUrl || data.path || ""
      setUrl(value)
      onChange?.(value)
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const remove = () => {
    setUrl("")
    onChange?.("")
  }

  const fallbackInput = (
    <>
      {uploadError && (
        <p className="font-body-md text-body-md text-error text-sm mt-2">{uploadError}</p>
      )}
      {uploadError && !url && (
        <input name={name} defaultValue={defaultValue ?? ""} placeholder="Paste URL here..."
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 mt-2" />
      )}
      <input type="hidden" name={name} value={url} />
    </>
  )

  if (variant === "avatar") {
    return (
      <div>
        <p className="font-label-bold text-label-sm text-on-surface-variant mb-2">Author Avatar</p>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/30 flex items-center justify-center flex-shrink-0">
            {url ? (
              <img src={url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Icon name="person" size={24} className="text-on-surface-variant/50" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="bg-primary text-on-primary font-label-bold text-label-sm px-4 py-2 rounded-lg hover:brightness-110 transition-colors cursor-pointer inline-block text-center">
              {uploading ? "Uploading..." : "Upload Picture"}
              <input ref={inputRef} type="file" accept={accept ?? "image/*"} onChange={handleChange} disabled={uploading} className="hidden" />
            </label>
            {url && (
              <button
                type="button"
                onClick={remove}
                className="text-error font-label-bold text-label-xs hover:underline cursor-pointer text-xs text-left"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        {fallbackInput}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {label && <p className="font-label-bold text-label-sm text-on-surface-variant mb-1.5">{label}</p>}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={(e) => { e.preventDefault(); setDragging(false) }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-outline-variant/50 bg-surface-container-low hover:border-primary/50"
        }`}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} disabled={uploading} className="hidden" />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Icon name="cloud_upload" size={36} className="text-on-surface-variant/50 animate-pulse" />
            <p className="font-body-md text-body-md text-on-surface-variant">Uploading...</p>
          </div>
        ) : url ? (
          fileKind === "pdf" ? (
            <div className="flex flex-col items-center gap-2">
              <Icon name="description" size={36} className="text-error/70" />
              <p className="font-body-md text-body-md text-on-surface-variant text-sm break-all max-w-full">PDF uploaded</p>
              <button type="button" onClick={(e) => { e.stopPropagation(); remove() }} className="text-error font-label-bold text-label-sm hover:underline cursor-pointer">
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <img src={url} alt="Preview" className="max-h-40 rounded-lg object-contain" />
              <button type="button" onClick={(e) => { e.stopPropagation(); remove() }} className="text-error font-label-bold text-label-sm hover:underline cursor-pointer">
                Remove image
              </button>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Icon name={fileKind === "pdf" ? "description" : "cloud_upload"} size={36} className="text-on-surface-variant/50" />
            <p className="font-body-md text-body-md text-on-surface-variant">
              Drag & drop your {fileKind === "pdf" ? "PDF" : "file"} here
            </p>
            <p className="font-label-bold text-label-sm text-primary">Browse Files</p>
          </div>
        )}
      </div>
      {fallbackInput}
    </div>
  )
}
