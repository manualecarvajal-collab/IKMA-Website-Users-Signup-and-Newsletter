"use client"

import { useState } from "react"
import AvisoSesion from "./AvisoSesion"

/**
 * Envoltorio mínimo para poder cerrar el aviso desde el propio aviso.
 *
 * El estado vive aquí y no en `page.tsx` a propósito: la página es un componente
 * de servidor y no puede reaccionar al clic. Así el servidor decide SI hay que
 * preguntar (no hay preferencia guardada) y el cliente decide cuándo deja de
 * verse.
 */
export default function AvisoSesionAlMontar() {
  const [abierto, setAbierto] = useState(true)
  if (!abierto) return null
  return <AvisoSesion onCerrar={() => setAbierto(false)} />
}
