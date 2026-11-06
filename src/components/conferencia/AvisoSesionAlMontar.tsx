"use client"

import { useState, useSyncExternalStore } from "react"
import AvisoSesion from "./AvisoSesion"

/**
 * Cuándo se pregunta por la sesión.
 *
 * NO en el aterrizaje. Antes salía en cuanto la persona entraba —recién llegada
 * del correo, sin haber leído nada— y tapaba la página; lo natural era quitarlo
 * de en medio con Escape. Y ese gesto, hasta hace un momento, le cambiaba la
 * sesión a «solo esta vez» sin avisar.
 *
 * Ahora se pregunta a partir de la SEGUNDA visita a la landing con sesión
 * abierta: quien viene una sola vez no necesita que le interrumpan, porque el
 * valor por defecto ya es «mantener». La pregunta es para quien vuelve, que es
 * quien de verdad se juega quedarse fuera.
 *
 * El contador vive en `localStorage` (no hace falta que viaje al servidor) y se
 * lee como almacén externo: montarlo con un `useEffect` que haga `setState`
 * provoca un render en cascada, y el linter lo marca con razón.
 */
const CLAVE = "conf_visitas"

/** No hay eventos: el valor se calcula al leerlo y no cambia durante la sesión. */
const suscribir = () => () => {}

/** En el servidor no hay `localStorage`: la instantánea es «primera visita». */
const enServidor = () => false

let visitasLeidas = false
function esSegundaVisita(): boolean {
  // El contador se incrementa UNA vez por carga de página, en la primera
  // lectura del cliente; leerlo dos veces no debe inflarlo.
  try {
    if (!visitasLeidas) {
      visitasLeidas = true
      const visitas = Number(window.localStorage.getItem(CLAVE) ?? "0") + 1
      window.localStorage.setItem(CLAVE, String(visitas))
      return visitas >= 2
    }
    return Number(window.localStorage.getItem(CLAVE) ?? "0") >= 2
  } catch {
    // Navegador sin almacenamiento (modo privado antiguo): no se pregunta.
    return false
  }
}

export default function AvisoSesionAlMontar() {
  const [cerrado, setCerrado] = useState(false)
  const segundaVisita = useSyncExternalStore(suscribir, esSegundaVisita, enServidor)

  if (cerrado || !segundaVisita) return null
  return <AvisoSesion onCerrar={() => setCerrado(true)} />
}
