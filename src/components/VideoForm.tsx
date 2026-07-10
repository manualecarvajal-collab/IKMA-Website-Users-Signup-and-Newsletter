"use client"

import { useState, useActionState } from "react"
import { ImageUpload } from "./ImageUpload"
import { createCategoria } from "@/lib/supabase/admin-actions"

interface Categoria {
  id: string
  nombre: string
}

interface Video {
  id?: string
  titulo: string
  slug: string
  descripcion: string | null
  embed_url: string | null
  imagen_preview: string | null
  publicado: boolean
  categoria_id?: string | null
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
  categorias: initialCategorias,
}: {
  action: (formData: FormData) => Promise<{ error: string } | undefined>
  video?: Video | null
  categorias: Categoria[]
}) {
  const [state, formAction, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      return action(formData)
    },
    undefined
  )

  const [title, setTitle] = useState(video?.titulo ?? "")
  const [categorias, setCategorias] = useState(initialCategorias)
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [catError, setCatError] = useState("")
  const [catPending, setCatPending] = useState(false)

  async function handleNewCategory() {
    if (!newCatName.trim()) return
    setCatPending(true)
    setCatError("")
    const fd = new FormData()
    fd.set("nombre", newCatName.trim())
    const result = await createCategoria(fd)
    if (result?.error) {
      setCatError(result.error)
      setCatPending(false)
      return
    }
    if (result?.data) {
      setCategorias((prev) => [...prev, result.data].sort((a, b) => a.nombre.localeCompare(b.nombre)))
      setNewCatName("")
      setShowNewCat(false)
      // Set a hidden input so the newly created category is selected
      document.getElementById("cat-select")?.setAttribute("data-selected", result.data.id)
    }
    setCatPending(false)
  }

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
        <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Category</label>
        <div className="flex gap-2">
          <select
            id="cat-select"
            name="categoria_id"
            defaultValue={video?.categoria_id ?? ""}
            className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="">No category</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <button type="button" onClick={() => setShowNewCat(!showNewCat)}
            className="bg-primary text-on-primary font-label-bold text-label-bold px-4 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors flex-shrink-0">
            + New Category
          </button>
        </div>
        {showNewCat && (
          <div className="mt-2 flex gap-2 items-start">
            <div className="flex-1">
              <input
                value={newCatName}
                onChange={(e) => { setNewCatName(e.target.value); setCatError("") }}
                placeholder="Category name"
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
              {catError && <p className="font-body-md text-body-md text-error mt-1 text-sm">{catError}</p>}
            </div>
            <button type="button" onClick={handleNewCategory} disabled={catPending || !newCatName.trim()}
              className="bg-primary text-on-primary font-label-bold text-label-bold px-4 py-2.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 flex-shrink-0">
              {catPending ? "Adding..." : "Add"}
            </button>
            <button type="button" onClick={() => { setShowNewCat(false); setNewCatName(""); setCatError("") }}
              className="bg-surface-container-high text-on-surface-variant font-label-bold text-label-bold px-4 py-2.5 rounded-lg hover:bg-outline-variant/30 transition-colors flex-shrink-0">
              Cancel
            </button>
          </div>
        )}
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
