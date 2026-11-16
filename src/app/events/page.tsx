import type { Metadata } from "next"
import { pageSeo } from "@/lib/seo"
import HeroCongreso from "@/components/events/HeroCongreso"

export const metadata: Metadata = pageSeo({
  title: "Events - IKMA",
  description: "IKMA events: conferences, teachings and community activities.",
  path: "/events",
})

/**
 * Eventos de IKMA.
 *
 * Hoy la página anuncia el **IV Congreso Internacional (2027)**, que es lo que
 * viene. El anuncio de la conferencia de 2026 se retiró al terminar el evento.
 *
 * Se va también el fondo animado de barras: era parte del lenguaje visual de la
 * conferencia y esta página vuelve a la del sitio. Si algún día se recupera,
 * basta con volver a importar `conferencia/fondo.css` y pintar `<FondoBarras />`.
 */
export default function EventsPage() {
  return <HeroCongreso />
}
