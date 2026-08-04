"use client"

import { useState, useActionState, useEffect } from "react"
import { ImageUpload } from "./ImageUpload"
import { AvatarUpload } from "./AvatarUpload"
import TiptapEditor from "./TiptapEditor"
import Icon from "./Icon"

interface Article {
  id?: string
  titulo: string
  slug: string
  contenido_html: string | null
  resumen: string | null
  titulo_es?: string | null
  contenido_html_es?: string | null
  resumen_es?: string | null
  categoria: string | null
  imagen_url: string | null
  publicado: boolean
  autor_nombre?: string | null
  autor_avatar_url?: string | null
  created_at?: string
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
    .trim()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
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

  const [activeTab, setActiveTab] = useState<"en" | "es">("en")

  // English fields
  const [title, setTitle] = useState(article?.titulo ?? "")
  const [contenido, setContenido] = useState(article?.contenido_html ?? "")
  const [resumen, setResumen] = useState(article?.resumen ?? "")

  // Spanish fields
  const [titleEs, setTitleEs] = useState(article?.titulo_es ?? "")
  const [contenidoEs, setContenidoEs] = useState(article?.contenido_html_es ?? "")
  const [resumenEs, setResumenEs] = useState(article?.resumen_es ?? "")

  const [imagenUrl, setImagenUrl] = useState(article?.imagen_url ?? "")
  const [showPreview, setShowPreview] = useState(false)

  const handleImageUpload = async (file: File): Promise<string> => {
    const resp = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, type: file.type }),
    })
    const { signedUrl, publicUrl } = await resp.json()
    if (signedUrl) {
      await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
    }
    setImagenUrl(publicUrl)
    return publicUrl
  }

  const previewTitle = activeTab === "en" ? title : (titleEs || title)
  const previewContent = activeTab === "en" ? contenido : (contenidoEs || contenido)

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-md text-headline-md text-primary">Preview</h2>
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-2 border border-outline-variant text-on-surface font-label-bold text-label-bold px-4 py-2 rounded-lg hover:bg-surface-container transition-all cursor-pointer"
          >
            <Icon name="edit" size={18} />
            Edit
          </button>
        </div>
        <div className="bg-surface rounded-xl border border-outline-variant/20 p-8 md:p-12">
          {imagenUrl && (
            <div className="w-full h-64 rounded-xl overflow-hidden bg-surface-variant mb-6">
              <img src={imagenUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="font-headline-xl text-[clamp(1.625rem,3.25vw,2.6rem)] text-primary mb-6">
            {previewTitle || "Article Title"}
          </h1>
          {article?.autor_nombre && (
            <p className="font-label-bold text-label-bold text-on-surface-variant mb-6">
              {article.autor_nombre} — {formatDate(article.created_at || new Date().toISOString())}
            </p>
          )}
          <div
            className="prose prose-lg max-w-none whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: previewContent || "<p>Start writing your article content...</p>" }}
          />
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="max-w-4xl space-y-6">
      {state?.error && (
        <div className="bg-error-container text-on-error-container font-body-md text-body-md px-4 py-3 rounded-lg">{state.error}</div>
      )}

      {/* Language Tabs */}
      <div className="flex gap-1 border-b border-outline-variant/30 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("en")}
          className={`px-5 py-2.5 font-label-bold text-label-bold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === "en"
              ? "bg-surface-container-low text-primary border border-outline-variant/30 border-b-0"
              : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low/50"
          }`}
        >
          <Icon name="language" size={14} className="inline mr-1.5 align-text-bottom" />
          English
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("es")}
          className={`px-5 py-2.5 font-label-bold text-label-bold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === "es"
              ? "bg-surface-container-low text-primary border border-outline-variant/30 border-b-0"
              : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low/50"
          }`}
        >
          <Icon name="language" size={14} className="inline mr-1.5 align-text-bottom" />
          Español
        </button>
      </div>

      {/* English Tab Content */}
      {activeTab === "en" && (
        <div className="space-y-6 pt-2">
          <div>
            <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Title *</label>
            <input name="titulo" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="hidden" name="slug" value={slugify(title)} />
            <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">Slug: {slugify(title) || "..."}</p>
          </div>

          <div>
            <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Summary / Excerpt</label>
            <textarea name="resumen" value={resumen} onChange={(e) => setResumen(e.target.value)} rows={3}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-label-bold text-label-sm text-on-surface-variant">Content</label>
            </div>
            <TiptapEditor
              content={contenido}
              onChange={setContenido}
              onImageUpload={handleImageUpload}
            />
            <input type="hidden" name="contenido_html" value={contenido} />
          </div>
        </div>
      )}

      {/* Spanish Tab Content */}
      {activeTab === "es" && (
        <div className="space-y-6 pt-2">
          <div>
            <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Título *</label>
            <input name="titulo_es" value={titleEs} onChange={(e) => setTitleEs(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Resumen</label>
            <textarea name="resumen_es" value={resumenEs} onChange={(e) => setResumenEs(e.target.value)} rows={3}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-label-bold text-label-sm text-on-surface-variant">Contenido</label>
            </div>
            <TiptapEditor
              content={contenidoEs}
              onChange={setContenidoEs}
              onImageUpload={handleImageUpload}
            />
            <input type="hidden" name="contenido_html_es" value={contenidoEs} />
          </div>
        </div>
      )}

      {/* Shared Fields */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="mx-auto sm:mx-0">
          <AvatarUpload name="autor_avatar_url" defaultValue={article?.autor_avatar_url} />
        </div>
        <div className="flex-1 w-full">
          <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Author Name</label>
          <input name="autor_nombre" defaultValue={article?.autor_nombre ?? ""}
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      <ImageUpload name="imagen_url" defaultValue={article?.imagen_url} label="Cover Image" />

      <div className="flex items-center gap-3">
        <input name="publicado" type="checkbox" defaultChecked={article?.publicado ?? false} className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/30" />
        <label className="font-body-md text-body-md text-on-surface">Published</label>
      </div>

      {/* Preview & Submit */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 border border-outline-variant/50 text-on-surface font-label-bold text-label-bold px-5 py-3 rounded-lg hover:bg-surface-container transition-all cursor-pointer"
        >
          <Icon name="visibility" size={18} />
          Preview
        </button>
        <div className="flex gap-4">
          <a href="/admin/articulos" className="bg-surface-container-high text-on-surface-variant font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-outline-variant/30 transition-colors text-center">Cancel</a>
          <button type="submit" disabled={pending}
            className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 text-center">
            {pending ? "Saving..." : article ? "Update Article" : "Create Article"}
          </button>
        </div>
      </div>
    </form>
  )
}
