/**
 * Fecha y hora de inicio de la conferencia IKMA.
 *
 * Vive en su propio módulo para que **todos** los contadores de la landing
 * compartan un único valor. Si el evento se mueve, se cambia aquí y se
 * actualiza a la vez en el hero y en el panel del directo.
 *
 * `null` deja los contadores en cero (útil mientras la fecha no esté cerrada).
 */

/** Sábado 14 de noviembre de 2026, 9:00 en hora de Venezuela (UTC−04:00). */
export const EVENT_DATE: string | null = "2026-11-14T09:00:00-04:00"

/** Cuánto antes del inicio se manda el enlace a quien se inscribe. */
const VENTANA_ENLACE_MS = 24 * 60 * 60 * 1000

/** El evento dura de 9:00 a 15:30. */
const DURACION_MS = 6.5 * 60 * 60 * 1000

/**
 * ¿Estamos en el tramo en el que el enlace de Zoom tiene que salir AL INSTANTE?
 *
 * El plan normal es mandarlo a todos el día antes. Pero quien se inscribe
 * DENTRO de esas últimas 24 horas no puede esperar al siguiente envío manual:
 * se quedaría sin enlace hasta que alguien se acordara de él. Por eso, entre
 * las 24 h previas y el final del evento, el enlace sale solo al confirmar el
 * código.
 *
 * Se incluye la conferencia ya en marcha (hasta las 15:30) a propósito: quien
 * se inscribe a las 11 de la mañana ese mismo día también tiene que poder
 * entrar, y ese es justo el caso que más duele si falla.
 *
 * Función pura y con la hora inyectable para poder probarla sin esperar a
 * noviembre.
 */
export function enVentanaDeEnlace(ahora: number = Date.now()): boolean {
  if (!EVENT_DATE) return false
  const inicio = new Date(EVENT_DATE).getTime()
  if (Number.isNaN(inicio)) return false
  return ahora >= inicio - VENTANA_ENLACE_MS && ahora <= inicio + DURACION_MS
}
