import type { Metadata } from "next"
import { pageSeo } from "@/lib/seo"
import HeroCongreso from "@/components/events/HeroCongreso"
import CoroSection from "@/components/events/CoroSection"
import CoroMapa from "@/components/events/CoroMapa"

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
 *
 * Debajo del cartel va `CoroSection`: la mayoría de los que vengan al congreso no
 * conocen Venezuela, así que hay una sección que presenta la ciudad (historia,
 * patrimonio y naturaleza) con fotos.
 *
 * Cierra `CoroMapa`: el mapa de Coro, para quien tenga que planear el viaje.
 */
export default function EventsPage() {
  return (
    <>
      <HeroCongreso />
      <CoroSection />
      <CoroMapa />
    </>
  )
}
