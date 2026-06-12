"use client"

import { useState, useActionState } from "react"
import { ImageUpload } from "./ImageUpload"
import { PdfUpload } from "./PdfUpload"

interface Revista {
  id?: string
  titulo: string
  descripcion: string | null
  archivo_url: string | null
  imagen_portada: string | null
  publicado: boolean
}

export function MagazineForm({
  action,
  revista,
}: {
  action: (formData: FormData) => Promise<{ error: string } | undefined>
  revista?: Revista | null
}) {
  const [state, formAction, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      return action(formData)
    },
    undefined
  )

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {state?.error && (
        <div className="bg-error-container text-on-error-container font-body-md text-body-md px-4 py-3 rounded-lg">{state.error}</div>
      )}

      <div>
        <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Title *</label>
        <input name="titulo" defaultValue={revista?.titulo ?? ""} required
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div>
        <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Description</label>
        <textarea name="descripcion" defaultValue={revista?.descripcion ?? ""} rows={3}
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <ImageUpload name="imagen_portada" defaultValue={revista?.imagen_portada} label="Cover Image" />

      <PdfUpload name="archivo_url" defaultValue={revista?.archivo_url} label="PDF File" />

      <div className="flex items-center gap-3">
        <input name="publicado" type="checkbox" defaultChecked={revista?.publicado ?? false} className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/30" />
        <label className="font-body-md text-body-md text-on-surface">Published</label>
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={pending}
          className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50">
          {pending ? "Saving..." : revista ? "Update Magazine" : "Create Magazine"}
        </button>
        <a href="/admin/revistas" className="bg-surface-container-high text-on-surface-variant font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-outline-variant/30 transition-colors">Cancel</a>
      </div>
    </form>
  )
}
