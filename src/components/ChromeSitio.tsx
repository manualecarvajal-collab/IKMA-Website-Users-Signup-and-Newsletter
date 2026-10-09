"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/**
 * Chrome del sitio —barra superior, aviso de inscripción incompleta, footer,
 * newsletter y aviso de cookies— con una puerta por ruta: en `/conferencia` no
 * se pinta nada, porque la landing trae su propia navegación y su propio cierre.
 *
 * POR QUÉ ES UN COMPONENTE DE CLIENTE Y NO UN `if` EN EL LAYOUT RAÍZ.
 * Antes la decisión se tomaba en `app/layout.tsx` leyendo la cabecera
 * `x-pathname` que pone `src/proxy.ts`. El problema no era la cabecera: el
 * layout raíz NO se vuelve a renderizar en las navegaciones de cliente, se
 * conserva el del primer documento. Así que el valor se quedaba pegado al de la
 * primera carga, en los dos sentidos:
 *
 *   · entrar a la conferencia desde /events → seguía la barra y el footer del
 *     sitio encima de la landing;
 *   · salir de la landing a cualquier página del sitio → esa página se quedaba
 *     sin barra ni footer hasta recargar a mano.
 *
 * `usePathname()` sí cambia en cada navegación, y además se resuelve en el
 * render del servidor (el navbar ya lo usa para marcar el enlace activo, y la
 * clase activa viene en el HTML servido). Eso es lo que hace que cargar la
 * landing directamente no parpadee: la puerta ya devuelve `null` en el primer
 * pintado, sin esperar a que hidrate. Es el mismo recurso que ya usan
 * `FooterWrapper` (oculta el footer en /admin) y `NewsletterCTAVisibility`.
 */
const RUTAS_SIN_CHROME = ["/conferencia"]

export default function ChromeSitio({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const sinChrome = RUTAS_SIN_CHROME.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  )

  if (sinChrome) return null
  return <>{children}</>
}
