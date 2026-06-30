import { getNewsletter } from "@/lib/supabase/admin-actions"
import EditNewsletterForm from "./form"

export default async function EditarNewsletterPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const newsletter = await getNewsletter(id)

  if (!newsletter) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto text-center py-24">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Newsletter not found</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">This newsletter record does not exist.</p>
      </div>
    )
  }

  return (
    <EditNewsletterForm
      id={newsletter.id}
      titulo={newsletter.titulo}
      contenido_html={newsletter.contenido_html}
      imagen_url={newsletter.imagen_url || ""}
    />
  )
}
