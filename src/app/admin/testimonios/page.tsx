import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { deleteTestimonio, toggleTestimonioStatus } from "@/lib/supabase/admin-actions"
import { DeleteButton } from "@/components/DeleteButton"
import { ToggleStatus } from "@/components/ToggleStatus"
import Icon from "@/components/Icon"

const REGION_LABELS: Record<string, string> = {
  "latin-america": "Latinoamérica",
  "north-america": "Norteamérica",
  "africa": "África",
  "europe": "Europa",
}

export default async function AdminTestimoniosPage() {
  const supabase = await createClient()
  const { data: testimonios } = await supabase
    .from("testimonios")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Testimonials</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage testimonials shown on the public page.</p>
        </div>
        <Link
          href="/admin/testimonios/nuevo"
          className="w-full sm:w-auto bg-primary text-on-primary font-label-bold text-label-bold px-5 py-2.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors inline-flex items-center justify-center gap-2"
        >
          <Icon name="add" size={14} /> New Testimonial
        </Link>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4">Name</th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Region</th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Status</th>
              <th className="text-right font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonios?.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center font-body-md text-body-md text-on-surface-variant">No testimonials yet.</td></tr>
            )}
            {testimonios?.map((t) => (
              <tr key={t.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {t.imagen_url && (
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-variant flex-shrink-0">
                        <img src={t.imagen_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-headline-md text-body-md text-on-surface notranslate">{t.nombre}</p>
                      <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-0.5 line-clamp-1">{t.cita_es}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell font-body-md text-body-md text-on-surface-variant">
                  {REGION_LABELS[t.region] ?? t.region}
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <ToggleStatus id={t.id} published={t.publicado} toggleAction={toggleTestimonioStatus} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/testimonios/${t.id}/editar`} className="text-primary hover:text-primary-fixed-dim p-1.5">
                      <Icon name="edit" size={18} />
                    </Link>
                    <DeleteButton action={deleteTestimonio.bind(null, t.id)} label="Testimonial" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
