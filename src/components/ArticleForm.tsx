"use client"

import { useState, useActionState } from "react"
import { ImageUpload } from "./ImageUpload"
import { AvatarUpload } from "./AvatarUpload"
interface Article {
  id?: string
  titulo: string
  slug: string
  contenido_html: string | null
  resumen: string | null
  categoria: string | null
  imagen_url: string | null
  publicado: boolean
  autor_nombre?: string | null
  autor_avatar_url?: string | null
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
    .trim()
}

export function ArticleForm({
  action,
  article,
}: {
  action: (formData: FormData) => Promise<{ error: string } | undefined>
  article?: Article | null
}) {
  const [state, formAction, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      return action(formData)
    },
    undefined
  )

  const [title, setTitle] = useState(article?.titulo ?? "")

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

      <div className="flex items-start gap-6">
        <AvatarUpload name="autor_avatar_url" defaultValue={article?.autor_avatar_url} />
        <div className="flex-1">
          <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Author Name</label>
          <input name="autor_nombre" defaultValue={article?.autor_nombre ?? ""}
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      <div>
        <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Summary / Excerpt</label>
        <textarea name="resumen" defaultValue={article?.resumen ?? ""} rows={3}
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <ImageUpload name="imagen_url" defaultValue={article?.imagen_url} label="Cover Image" />

      <div>
        <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Content (HTML)</label>
        <textarea name="contenido_html" defaultValue={article?.contenido_html ?? ""} rows={16}
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="flex items-center gap-3">
        <input name="publicado" type="checkbox" defaultChecked={article?.publicado ?? false} className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/30" />
        <label className="font-body-md text-body-md text-on-surface">Published</label>
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={pending}
          className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50">
          {pending ? "Saving..." : article ? "Update Article" : "Create Article"}
        </button>
        <a href="/admin/articulos" className="bg-surface-container-high text-on-surface-variant font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-outline-variant/30 transition-colors">Cancel</a>
      </div>
    </form>
  )
}
