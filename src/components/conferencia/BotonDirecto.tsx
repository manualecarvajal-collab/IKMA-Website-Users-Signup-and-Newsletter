"use client"

import Link from "next/link"

/**
 * Botón que entra a la transmisión desde la página de ponentes.
 *
 * POR QUÉ HACE CARGA COMPLETA (`location.assign`) Y NO NAVEGACIÓN DE CLIENTE.
 *
 * El marco del directo no es un panel quieto: se **expande** cuando su centro cae
 * en el centro de la pantalla, y eso lo decide un `IntersectionObserver` dentro de
 * `GalleryCard`. Cuando se llega con una navegación de cliente desde ponentes, ese
 * observador no llega a dispararse: el marco se queda cuadrado, pequeño y rodeado
 * por lo que quede detrás. Comprobado, y no es cuestión de esperar: ni el tiempo,
 * ni mover la rueda, ni un `resize` real del viewport lo despiertan.
 *
 * Cargando la misma URL de cero —con el ancla— sí expande, y el riel se coloca en
 * el marco (ver el efecto de `#directo` en `HorizontalRail`). Por eso este botón
 * se comporta como un enlace normal y hace la carga completa.
 *
 * `Link` en vez de `a` para no saltarse la regla del repo sobre enlaces internos,
 * y el `preventDefault` es lo que convierte la navegación de cliente en carga
 * completa. Al ser un enlace de verdad, el clic con la rueda o "abrir en pestaña
 * nueva" siguen funcionando.
 */
export default function BotonDirecto({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  const destino = "/conferencia#directo"

  return (
    <Link
      href={destino}
      className={className}
      onClick={(e) => {
        e.preventDefault()
        window.location.assign(destino)
      }}
    >
      {label}
      <span className="spk-boton-icono" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.5v13l11-6.5-11-6.5Z" />
        </svg>
      </span>
    </Link>
  )
}
