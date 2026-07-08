"use client"

import { useState, useActionState } from "react"
import { ImageUpload } from "./ImageUpload"

interface Video {
  id?: string
  titulo: string
  slug: string
  descripcion: string | null
  embed_url: string | null
  imagen_preview: string | null
  publicado: boolean
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
    .trim()
}

export function VideoForm({
  action,
  video,
}: {
  action: (formData: FormData) => Promise<{ error: string } | undefined>
  video?: Video | null
}) {
  const [state, formAction, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      return action(formData)
    },
    undefined
  )

  const [title, setTitle] = useState(video?.titulo ?? "")

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {state?.error && (
        <div className="bg-error-container text-on-error-container font-body-md text-body-md px-4 py-3 rounded-lg">{state.error}</div>
      )}

      <div>
        <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Title *</label>
        <input name="titulo" value={title} onChange={(e) => setTitle(e.target.value)} required
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <input type="hidden" name="slug" value={slugify(title)} />
        <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">Slug: {slugify(title) || "..."}</p>
      </div>

      <div>
        <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">YouTube Embed URL *</label>
        <input name="embed_url" defaultValue={video?.embed_url ?? ""} required
          placeholder="https://www.youtube.com/embed/VIDEO_ID"
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">Full YouTube embed URL (e.g. https://www.youtube.com/embed/dQw4w9WgXcQ)</p>
      </div>

      <div>
        <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Description</label>
        <textarea name="descripcion" defaultValue={video?.descripcion ?? ""} rows={4}
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <ImageUpload name="imagen_preview" defaultValue={video?.imagen_preview} label="Preview Image (thumbnail)" />

      <div className="flex items-center gap-3">
        <input name="publicado" type="checkbox" defaultChecked={video?.publicado ?? false} className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/30" />
        <label className="font-body-md text-body-md text-on-surface">Published</label>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button type="submit" disabled={pending}
          className="w-full sm:w-auto bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 text-center">
          {pending ? "Saving..." : video ? "Update Video" : "Create Video"}
        </button>
        <a href="/admin/teachings" className="w-full sm:w-auto bg-surface-container-high text-on-surface-variant font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-outline-variant/30 transition-colors text-center">Cancel</a>
      </div>
    </form>
  )
}
