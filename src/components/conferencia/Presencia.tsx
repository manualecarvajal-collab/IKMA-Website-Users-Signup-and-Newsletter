"use client"

import { useEffect } from "react"

/**
 * Latido de presencia.
 *
 * Manda una señal cada 20 s para que el panel sepa cuánta gente tiene la
 * página abierta. No renderiza nada y no envía ningún dato personal: solo un
 * identificador anónimo por pestaña, guardado en `sessionStorage` para que
 * recargar no cuente como una persona nueva.
 *
 * El envío se para cuando la pestaña pasa a segundo plano, para no inflar el
 * número con gente que dejó la página abierta y se fue.
 */

const INTERVALO_MS = 20_000
const CLAVE = "conf_sesion"

function idDeSesion(): string {
  let id = sessionStorage.getItem(CLAVE)
  if (!id) {
    // 16 bytes en hex: suficiente para no colisionar entre pestañas.
    id = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    sessionStorage.setItem(CLAVE, id)
  }
  return id
}

export default function Presencia() {
  useEffect(() => {
    let id: string
    try {
      id = idDeSesion()
    } catch {
      return // sin sessionStorage (modo restringido) simplemente no se cuenta
    }

    const latir = () => {
      if (document.visibilityState !== "visible") return
      void fetch("/api/conferencia/presencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sesion: id }),
        keepalive: true,
      }).catch(() => {})
    }

    latir()
    const timer = window.setInterval(latir, INTERVALO_MS)
    // Al volver a la pestaña se late ya, sin esperar al siguiente ciclo.
    const alVolver = () => latir()
    document.addEventListener("visibilitychange", alVolver)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", alVolver)
    }
  }, [])

  return null
}
