"use client"

import { useActionState } from "react"
import { ImageUpload } from "./ImageUpload"
import { DynamicListEditor } from "./DynamicListEditor"

interface Doctor {
  id?: number
  nombre: string
  especialidad_principal: string
  frase: string | null
  acerca_de: string | null
  imagen_url: string | null
  estadisticas: Record<string, string> | null
  rating: number | null
  num_resenas: number | null
  especialidades: string[] | null
  idiomas: string[] | null
  disponibilidad: string | null
  hospital: string | null
  direccion: string | null
  experiencia: { period: string; title: string; org: string; icon: string }[] | null
  educacion: { degree: string; school: string }[] | null
  certificaciones: { cert: string; issuer: string }[] | null
  premios: { title: string; org: string; year: string }[] | null
  testimonios: { name: string; type: string; text: string }[] | null
  publicado: boolean
}

export function DoctorForm({
  action,
  doctor,
}: {
  action: (formData: FormData) => Promise<{ error: string } | undefined>
  doctor?: Doctor | null
}) {
  const [state, formAction, pending] = useActionState(
    async (_: unknown, formData: FormData) => action(formData),
    undefined
  )

  const stats = doctor?.estadisticas ?? {}

  return (
    <form action={formAction} className="max-w-4xl space-y-8">
      {state?.error && (
        <div className="bg-error-container text-on-error-container font-body-md text-body-md px-4 py-3 rounded-lg">{state.error}</div>
      )}

      {/* Basic Info */}
      <fieldset className="border border-outline-variant/30 rounded-xl p-6 space-y-6">
        <legend className="font-headline-md text-headline-md text-primary px-2">Basic Information</legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Full Name *</label>
            <input name="nombre" defaultValue={doctor?.nombre ?? ""} required
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Primary Specialty *</label>
            <input name="especialidad_principal" defaultValue={doctor?.especialidad_principal ?? ""} required
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        <ImageUpload name="imagen_url" defaultValue={doctor?.imagen_url} />

        <div>
          <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Quote / Phrase</label>
          <textarea name="frase" defaultValue={doctor?.frase ?? ""} rows={2}
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <div>
          <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">About</label>
          <textarea name="acerca_de" defaultValue={doctor?.acerca_de ?? ""} rows={4}
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </fieldset>

      {/* Stats & Rating */}
      <fieldset className="border border-outline-variant/30 rounded-xl p-6 space-y-4">
        <legend className="font-headline-md text-headline-md text-primary px-2">Stats & Rating</legend>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Years Experience</label>
            <input name="stat_experience" defaultValue={stats.experience ?? ""}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Patients</label>
            <input name="stat_patients" defaultValue={stats.patients ?? ""}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Awards</label>
            <input name="stat_awards" defaultValue={stats.awards ?? ""}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Publications</label>
            <input name="stat_publications" defaultValue={stats.publications ?? ""}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Rating</label>
            <input name="rating" type="number" step="0.1" defaultValue={doctor?.rating ?? ""}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Number of Reviews</label>
            <input name="num_resenas" type="number" defaultValue={doctor?.num_resenas ?? ""}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
      </fieldset>

      {/* Specialties & Languages */}
      <fieldset className="border border-outline-variant/30 rounded-xl p-6 space-y-4">
        <legend className="font-headline-md text-headline-md text-primary px-2">Specialties & Languages</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Specialties (comma-separated)</label>
            <input name="especialidades" defaultValue={doctor?.especialidades?.join(", ") ?? ""}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Languages (comma-separated)</label>
            <input name="idiomas" defaultValue={doctor?.idiomas?.join(", ") ?? ""}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
      </fieldset>

      {/* Location & Contact */}
      <fieldset className="border border-outline-variant/30 rounded-xl p-6 space-y-4">
        <legend className="font-headline-md text-headline-md text-primary px-2">Location & Contact</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Hospital / Clinic</label>
            <input name="hospital" defaultValue={doctor?.hospital ?? ""}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Availability</label>
            <input name="disponibilidad" defaultValue={doctor?.disponibilidad ?? ""}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div>
          <label className="block font-label-bold text-label-sm text-on-surface-variant mb-1.5">Address</label>
          <input name="direccion" defaultValue={doctor?.direccion ?? ""}
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </fieldset>

      {/* Professional Experience */}
      <fieldset className="border border-outline-variant/30 rounded-xl p-6 space-y-4">
        <legend className="font-headline-md text-headline-md text-primary px-2">Professional Experience</legend>
        <DynamicListEditor
          name="experiencia"
          columns={[
            { key: "title", label: "Position / Cargo", placeholder: "Chief of Cardiology" },
            { key: "org", label: "Company / Organization", placeholder: "IKMA Heart Institute" },
            { key: "period", label: "Period (e.g. 2018 — Present)", placeholder: "2018 — Present" },
          ]}
          defaultValue={doctor?.experiencia as unknown[]}
          emptyItem={{ title: "", org: "", period: "" }}
        />
      </fieldset>

      {/* Education */}
      <fieldset className="border border-outline-variant/30 rounded-xl p-6 space-y-4">
        <legend className="font-headline-md text-headline-md text-primary px-2">Education</legend>
        <DynamicListEditor
          name="educacion"
          columns={[
            { key: "degree", label: "Degree / Título", placeholder: "Doctor of Medicine" },
            { key: "school", label: "Institution", placeholder: "Johns Hopkins University" },
          ]}
          defaultValue={doctor?.educacion as unknown[]}
          emptyItem={{ degree: "", school: "" }}
        />
      </fieldset>

      {/* Certifications */}
      <fieldset className="border border-outline-variant/30 rounded-xl p-6 space-y-4">
        <legend className="font-headline-md text-headline-md text-primary px-2">Certifications</legend>
        <DynamicListEditor
          name="certificaciones"
          columns={[
            { key: "cert", label: "Certification", placeholder: "Board Certified — Cardiology" },
            { key: "issuer", label: "Issuer", placeholder: "American Board of Internal Medicine" },
          ]}
          defaultValue={doctor?.certificaciones as unknown[]}
          emptyItem={{ cert: "", issuer: "" }}
        />
      </fieldset>

      {/* Awards */}
      <fieldset className="border border-outline-variant/30 rounded-xl p-6 space-y-4">
        <legend className="font-headline-md text-headline-md text-primary px-2">Awards & Recognition</legend>
        <DynamicListEditor
          name="premios"
          columns={[
            { key: "title", label: "Award", placeholder: "Excellence in Cardiac Care" },
            { key: "org", label: "Organization", placeholder: "International Medical Association" },
            { key: "year", label: "Year", placeholder: "2023" },
          ]}
          defaultValue={doctor?.premios as unknown[]}
          emptyItem={{ title: "", org: "", year: "" }}
        />
      </fieldset>

      {/* Testimonials */}
      <fieldset className="border border-outline-variant/30 rounded-xl p-6 space-y-4">
        <legend className="font-headline-md text-headline-md text-primary px-2">Testimonials</legend>
        <DynamicListEditor
          name="testimonios"
          columns={[
            { key: "name", label: "Patient Name", placeholder: "Maria G." },
            { key: "type", label: "Type", placeholder: "Cardiology Patient" },
            { key: "text", label: "Testimonial", placeholder: "Dr. Jenkins transformed my life...", type: "textarea" },
          ]}
          defaultValue={doctor?.testimonios as unknown[]}
          emptyItem={{ name: "", type: "", text: "" }}
        />
      </fieldset>

      {/* Publish */}
      <div className="flex items-center gap-3">
        <input name="publicado" type="checkbox" defaultChecked={doctor?.publicado ?? false} className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/30" />
        <label className="font-body-md text-body-md text-on-surface">Published</label>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button type="submit" disabled={pending}
          className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50">
          {pending ? "Saving..." : doctor ? "Update Doctor" : "Create Doctor"}
        </button>
        <a href="/admin/doctores" className="bg-surface-container-high text-on-surface-variant font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-outline-variant/30 transition-colors">Cancel</a>
      </div>
    </form>
  )
}
