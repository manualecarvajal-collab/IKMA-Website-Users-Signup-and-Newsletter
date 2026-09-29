"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

/**
 * Tarjeta de la galería.
 *
 * Es cuadrada, del mismo tamaño que las demás. La última tarjeta lleva
 * `expandToVideo`: cuando queda **centrada en la pantalla** crece de cuadrada
 * a horizontal (16:9) para meter el vídeo.
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
}: {
  children?: ReactNode
  expandToVideo?: boolean
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
      {children}
    </div>
  )
}
