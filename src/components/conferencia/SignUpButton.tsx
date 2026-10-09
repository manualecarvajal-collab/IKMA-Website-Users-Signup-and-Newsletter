"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import DirectoPanel from "./DirectoPanel"
import type { EstadoDirecto } from "./directo"

/**
 * Botón "Sign Up Now" del hero.
 *
 * En escritorio baja hasta el riel con un desplazamiento animado en vez del
 * salto instantáneo del ancla. Sigue siendo un `<a href="#registro">`, así que
 * sin JavaScript el enlace funciona igual.
 *
 * EN MÓVIL HACE OTRA COSA. En móvil no hay riel (los paneles se apilan) y el
 * marco del directo se oculta, así que el botón abre la transmisión en un
 * pop-up. El disparador vive aquí, en el mismo componente de cliente que ya
 * existía, para no duplicar ni el botón ni el panel: el estado y el cierre se
 * resuelven en un solo sitio.
 */

/** Mismo corte que el CSS (`fondo.css`), para que no se desincronicen. */
const MOVIL = "(max-width: 767px)"

/**
 * Se lee como store externo y no con un `useEffect` que rellene estado: eso
 * provocaría un render en cascada, y el servidor no puede saber el ancho, así
 * que la instantánea de servidor es `false`.
 */
const suscribirMovil = (avisar: () => void) => {
  const mq = window.matchMedia(MOVIL)
  mq.addEventListener("change", avisar)
  return () => mq.removeEventListener("change", avisar)
}

export default function SignUpButton({
  label,
  className,
  directo,
}: {
  label: string
  className?: string
  /**
   * Datos del directo. Si vienen y la pantalla es móvil, el botón abre el
   * pop-up en lugar de desplazar. Sin ellos se comporta como siempre.
   */
  directo?: { estado: EstadoDirecto; inscrito: boolean; url: string; embed: string }
}) {
  const [abierto, setAbierto] = useState(false)
  const esMovil = useSyncExternalStore(
    suscribirMovil,
    () => window.matchMedia(MOVIL).matches,
    () => false
  )

  // Con el pop-up abierto, el fondo no se desplaza.
  useEffect(() => {
    if (!abierto) return
    const previo = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previo
    }
  }, [abierto])

  const usaPopUp = Boolean(directo) && esMovil

  return (
    <>
      <a
        href="#registro"
        onClick={(e) => {
          if (usaPopUp) {
            e.preventDefault()
            setAbierto(true)
            return
          }
          const section = document.getElementById("registro")
          if (!section) return // sin destino, dejamos que el ancla haga su trabajo
          e.preventDefault()
          // Respeta la preferencia de movimiento reducido.
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
          section.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "start",
          })
          window.history.replaceState(null, "", "#registro")
        }}
        className={className}
      >
        {label}
      </a>

      {abierto && directo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#030404]/60 p-4 md:hidden"
          onClick={() => setAbierto(false)}
        >
          <div
            className="relative w-full max-w-[min(560px,92vw)] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(4,14,32,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[18px] leading-none text-[#123045] shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123045]"
            >
              ×
            </button>
            <div className="relative h-[min(520px,64svh)]">
              <DirectoPanel {...directo} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
