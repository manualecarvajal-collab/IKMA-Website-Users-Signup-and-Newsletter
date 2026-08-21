"use client"

import NewsletterForm from "@/components/NewsletterForm"
import type { Recipient } from "@/lib/newsletter-audiences"

export default function EditNewsletterForm({
  id,
  titulo,
  contenido_html,
  imagen_url,
  subscribers,
}: {
  id: string
  titulo: string
  contenido_html: string
  imagen_url: string
  subscribers: Recipient[]
}) {
  return (
    <NewsletterForm
      id={id}
      recipients={subscribers}
      heading="Edit & Re-send"
      headingDescription="Modify and send this newsletter again to your subscribers."
      initialTitulo={titulo}
      initialContenido={contenido_html}
      initialImagen={imagen_url}
    />
  )
}
