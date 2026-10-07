"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

/**
 * Tarjeta de la galería.
 *
 * Es cuadrada, del mismo tamaño que las demás. Dos usos:
 *   - ficha de PONENTE, pasando `foto` y `nombre`;
 *   - o contenedor libre (el panel del directo), pasando `children`.
 * La última tarjeta lleva `expandToVideo`: cuando queda **centrada en la
 * pantalla** crece de cuadrada a horizontal (16:9) para meter el vídeo.
 *
 * La detección de "centrada" se hace con un `rootMargin` lateral negativo, que
 * deja una franja estrecha en el centro horizontal de la ventana: la tarjeta
 * solo se considera activa cuando su centro cae dentro de esa franja. Así no
 * depende de que el padre le pase la posición.
 */
const CENTER_BAND = "0px -38% 0px -38%"

export default function GalleryCard({
  children,
  expandToVideo = false,
  foto,
  nombre,
}: {
  children?: ReactNode
  expandToVideo?: boolean
  /** Foto recortada del ponente. Si viene, la tarjeta se rellena con ella. */
  foto?: string
  /** Nombre del ponente, al pie de la foto. */
  nombre?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [centered, setCentered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !expandToVideo) return
    const observer = new IntersectionObserver(
      ([entry]) => setCentered(entry.isIntersecting),
      { rootMargin: CENTER_BAND, threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [expandToVideo])

  const expanded = expandToVideo && centered

  return (
    <div
      ref={ref}
      className={[
        "overflow-hidden rounded-[40px] bg-white shadow-[0_28px_70px_rgba(4,14,32,0.45)]",
        "transition-[width,height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        expanded
          ? "h-[380px] w-[676px] md:h-[720px] md:w-[1280px]"
          : "h-[240px] w-[240px] md:h-[460px] md:w-[460px]",
      ].join(" ")}
    >
      {/* Ficha de ponente: el nombre arriba, sobre la cabeza, y el retrato
          apoyado en el canto inferior de la tarjeta. Los recortes traen
          transparencia, así que se apoyan en el blanco de la tarjeta sin
          necesidad de fondo propio.
          `object-contain` y `max-h` en vez de `object-cover`: los retratos
          vienen con proporciones muy distintas (de 757×1009 a 2205×1470) y
          recortarlos cortaría cabezas. */}
      {foto && (
        <div className="flex h-full flex-col items-center">
          {nombre && (
            <p className="w-full px-4 pt-5 text-center text-[13px] font-bold uppercase leading-tight tracking-[0.07em] text-[#123045] md:text-[17px]">
              {nombre}
            </p>
          )}
          {/* `mt-auto` empuja la foto al borde inferior de la tarjeta, sin
              margen ni relleno debajo: el retrato apoya en el canto. */}
          <img
            src={foto}
            alt=""
            className="mt-auto max-h-[80%] w-auto max-w-[88%] object-contain"
            loading="lazy"
          />
        </div>
      )}
      {children}
    </div>
  )
}
