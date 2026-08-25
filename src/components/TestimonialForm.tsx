"use client"

import { useActionState } from "react"
import { ImageUpload } from "./ImageUpload"

interface Testimonio {
  id?: string
  nombre: string
  rol_es?: string | null
  rol_en?: string | null
  cita_es: string
  cita_en: string
  region: string
  imagen_url?: string | null
  publicado: boolean
}

const REGIONS = [
  { value: "latin-america", label: "Latinoamérica" },
  { value: "north-america", label: "Norteamérica" },
  { value: "africa", label: "África" },
  { value: "europe", label: "Europa" },
]

export function TestimonialForm({
  action,
  testimonio,
}: {
  action: (formData: FormData) => Promise<{ error: string } | undefined>
  testimonio?: Testimonio | null
}) {
  const [state, formAction, pending] = useActionState(
    async (_: unknown, formData: FormData) => action(formData),
    undefined
  )

  const field =
    "w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
  const label = "block font-label-bold text-label-sm text-on-surface-variant mb-1.5"

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {state?.error && (
        <div className="bg-error-container text-on-error-container font-body-md text-body-md px-4 py-3 rounded-lg">{state.error}</div>
      )}

      <div>
        <label className={label}>Name *</label>
        <input name="nombre" defaultValue={testimonio?.nombre ?? ""} required className={field} />
      </div>

      <div>
        <label className={label}>Region *</label>
        <select name="region" defaultValue={testimonio?.region ?? "north-america"} className={field}>
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={label}>Role (ES)</label>
          <input name="rol_es" defaultValue={testimonio?.rol_es ?? ""} className={field} />
        </div>
        <div>
          <label className={label}>Role (EN)</label>
          <input name="rol_en" defaultValue={testimonio?.rol_en ?? ""} className={field} />
        </div>
      </div>

      <div>
        <label className={label}>Quote (ES) *</label>
        <textarea name="cita_es" defaultValue={testimonio?.cita_es ?? ""} rows={4} required className={field} />
      </div>

      <div>
        <label className={label}>Quote (EN) *</label>
        <textarea name="cita_en" defaultValue={testimonio?.cita_en ?? ""} rows={4} required className={field} />
      </div>

      <ImageUpload name="imagen_url" defaultValue={testimonio?.imagen_url} label="Avatar Image (optional)" />

      <div className="flex items-center gap-3">
        <input name="publicado" type="checkbox" defaultChecked={testimonio?.publicado ?? false} className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/30" />
        <label className="font-body-md text-body-md text-on-surface">Published</label>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button type="submit" disabled={pending}
          className="w-full sm:w-auto bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 text-center">
          {pending ? "Saving..." : testimonio ? "Update Testimonial" : "Create Testimonial"}
        </button>
        <a href="/admin/testimonios" className="w-full sm:w-auto bg-surface-container-high text-on-surface-variant font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-outline-variant/30 transition-colors text-center">Cancel</a>
      </div>
    </form>
  )
}
