"use client"

import { useEffect, useRef } from "react"

/**
 * Vídeo de la tarjeta de inscripción.
 *
 * El archivo pesa bastante (varios MB) y vive por debajo del pliegue, detrás
 * del hero, así que no conviene descargarlo al cargar la página: se usa
 * `preload="none"` y sólo se reproduce cuando el bloque entra en pantalla
 * (con un margen para que llegue listo).
 */
export default function CardVideo({
  src,
  poster,
}: {
  src: string
  poster?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    // Sin `rootMargin`: la sección queda pegada al borde inferior del
    // viewport, así que cualquier margen la daría por visible y descargaría
    // el vídeo al cargar. Con el umbral, sólo arranca cuando ya se ve.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        video.play().catch(() => {
          // Si el navegador bloquea el autoplay, queda el póster: no es
          // crítico, así que no hacemos nada.
        })
        observer.disconnect()
      },
      { threshold: 0.35 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
