"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

/**
 * Se entera de los cambios de estado del directo y refresca la página.
 *
 * Por qué existe: la landing se renderiza en el servidor, así que cuando desde
 * el panel se pasa de "Before" a "Live", quien ya tenía la página abierta
 * seguía viendo el contador hasta recargar. El día del evento eso no vale: el
 * cambio tiene que llegar solo.
 *
 * Cómo: consulta el estado cada 20 s (el mismo ritmo que el latido de
 * `Presencia`) y, si difiere del que se renderizó, llama a `router.refresh()`,
 * que vuelve a pedir el HTML al servidor y lo parchea sin recargar ni perder el
 * estado de los componentes de cliente.
 *
 * Dos detalles que importan:
 *
 * 1. La referencia se actualiza ANTES de refrescar. Si no, el siguiente sondeo
 *    compararía contra los valores viejos, vería un cambio otra vez y
 *    refrescaría en bucle.
 * 2. Solo se consulta con la pestaña visible. Con la pestaña de fondo, el
 *    navegador limita los temporizadores y no tiene sentido gastar peticiones.
 */
export default function DirectoVivo({
  estado,
  url,
  embed,
}: {
  estado: string
  url: string
  embed: string
}) {
  const router = useRouter()
  const ultimo = useRef({ estado, url, embed })

  useEffect(() => {
    const consultar = async () => {
      if (document.visibilityState !== "visible") return
      try {
        const respuesta = await fetch("/api/conferencia/directo", {
          cache: "no-store",
        })
        if (!respuesta.ok) return
        const datos = await respuesta.json()
        const cambio =
          datos.estado !== ultimo.current.estado ||
          datos.url !== ultimo.current.url ||
          datos.embed !== ultimo.current.embed
        if (!cambio) return
        ultimo.current = datos
        router.refresh()
      } catch {
        // Un Corte de red no puede romper la página: se reintenta en el
        // siguiente ciclo y ya está.
      }
    }

    const id = window.setInterval(consultar, 20_000)
    return () => window.clearInterval(id)
  }, [router])

  return null
}
