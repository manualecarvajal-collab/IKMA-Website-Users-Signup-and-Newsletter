"use client"

import { useState, useRef } from "react"
import Icon from "@/components/Icon"

export function PdfUpload({ name, defaultValue, label }: { name: string; defaultValue?: string | null; label?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    setUploading(true)
    setUploadError("")
    try {
      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, type: file.type }),
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div className="space-y-3">
      {label && <p className="font-label-bold text-label-sm text-on-surface-variant mb-1.5">{label}</p>}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-outline-variant/50 bg-surface-container-low hover:border-primary/50"
        }`}
      >
        <input ref={inputRef} type="file" accept=".pdf" onChange={handleChange} disabled={uploading} className="hidden" />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Icon name="cloud_upload" size={36} className="text-on-surface-variant/50 animate-pulse" />
            <p className="font-body-md text-body-md text-on-surface-variant">Uploading...</p>
          </div>
        ) : url ? (
          <div className="flex flex-col items-center gap-2">
            <Icon name="description" size={36} className="text-error/70" />
            <p className="font-body-md text-body-md text-on-surface-variant text-sm break-all max-w-full">PDF uploaded</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setUrl("") }}
              className="text-error font-label-bold text-label-sm hover:underline cursor-pointer"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Icon name="description" size={36} className="text-on-surface-variant/50" />
            <p className="font-body-md text-body-md text-on-surface-variant">
              Drag & drop your PDF here
            </p>
            <p className="font-label-bold text-label-sm text-primary">Browse Files</p>
          </div>
        )}
      </div>
      {uploadError && (
        <p className="font-body-md text-body-md text-error text-sm mt-2">{uploadError}</p>
      )}
      {uploadError && !url && (
        <input name={name} defaultValue={defaultValue ?? ""} placeholder="Paste PDF URL here..."
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 mt-2" />
      )}
      <input type="hidden" name={name} value={url} />
    </div>
  )
}
