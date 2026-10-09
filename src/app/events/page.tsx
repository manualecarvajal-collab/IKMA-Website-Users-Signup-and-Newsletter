import type { Metadata } from "next"
import { pageSeo } from "@/lib/seo"
import FondoBarras from "@/components/conferencia/FondoBarras"
import HeroConferencia from "@/components/events/HeroConferencia"
// El fondo animado (barras flotantes) es el mismo de la landing: su CSS vive
// junto a la conferencia y se importa aquí tal cual, igual que hace
// `/conferencia/speakers`. Sin este import las barras existen pero no se mueven.
import "../conferencia/fondo.css"

export const metadata: Metadata = pageSeo({
  title: "Events - IKMA",
  description: "IKMA events: conferences, teachings and community activities.",
  path: "/events",
})

/**
 * Eventos de IKMA. Hoy la página es el anuncio de la conferencia 2026: un hero
 * que lleva a la landing (`/conferencia`), que es donde se explica el día y se
 * pide la inscripción. Antes era un estado vacío ("no hay eventos aún") y ese
 * mensaje dejó de ser cierto en cuanto hubo una conferencia que anunciar.
 *
 * El fondo de barras va fijo y cubre toda la ventana, así que la página no
 * necesita fondo propio: el mismo campo claro acompaña al hero.
 */
export default function EventsPage() {
  return (
    <>
      <FondoBarras />
      <HeroConferencia />
    </>
  )
}
