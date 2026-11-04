/**
 * Fecha y hora de inicio de la conferencia IKMA.
 *
 * Vive en su propio módulo para que **todos** los contadores de la landing
 * compartan un único valor. Si el evento se mueve, se cambia aquí y se
 * actualiza a la vez en el hero y en el panel del directo.
 *
 * `null` deja los contadores en cero (útil mientras la fecha no esté cerrada).
 */

/**
 * Sábado 14 de noviembre de 2026, **9:00 en hora del Este (UTC−05:00)**.
 *
 * Ese es el instante que fija la invitación de Zoom («Nov 14, 2026 09:00 AM
 * Eastern Time») y el que dice el correo de confirmación, así que es también al
 * que cuenta la página: contador, ventana del enlace y botón de la web.
 *
 * OJO CON LA CONVERSIÓN, porque es la fuente de error más fácil de todo esto:
 * en noviembre Estados Unidos ya está en horario de invierno, así que
 * 09:00 EST son las **10:00 en Venezuela** (UTC−4) y las 14:00 UTC. Antes esta
 * constante era `-04:00` —hora de Coro— y el contador latía una hora antes que
 * la reunión.
 */
export const EVENT_DATE: string | null = "2026-11-14T09:00:00-05:00"

/** Cuánto antes del inicio se manda el enlace, y desde cuándo la web lo ofrece. */
const VENTANA_ENLACE_MS = 24 * 60 * 60 * 1000

/** El evento dura de 9:00 a 15:30, hora del Este. */
export const DURACION_MS = 6.5 * 60 * 60 * 1000

/**
 * En qué momento del evento estamos.
 *
 *   antes      — todavía falta más de un día. La web anuncia la fecha y el
 *                contador; el enlace aún no existe para nadie.
 *   vispera    — últimas 24 horas. El enlace ya salió por correo y la web
 *                también lo ofrece: es la red de seguridad de quien lo perdió.
 *   enMarcha   — la conferencia está ocurriendo (9:00 a 15:30, EST).
 *   terminado  — acabó.
 *
 * Se calcula con la hora inyectable para poder probar los cuatro tramos sin
 * esperar a noviembre.
 */
export type MomentoEvento = "antes" | "vispera" | "enMarcha" | "terminado"

export function momentoDelEvento(ahora: number = Date.now()): MomentoEvento {
  if (!EVENT_DATE) return "antes"
  const inicio = new Date(EVENT_DATE).getTime()
  if (Number.isNaN(inicio)) return "antes"

  if (ahora < inicio - VENTANA_ENLACE_MS) return "antes"
  if (ahora < inicio) return "vispera"
  if (ahora <= inicio + DURACION_MS) return "enMarcha"
  return "terminado"
}

/**
 * ¿Estamos en el tramo en el que el enlace de Zoom ya está disponible?
 *
 * Dos consecuencias, con el mismo corte:
 *
 *   · un administrador manda el enlace a todos por correo, y
 *   · quien se inscribe DENTRO de esas 24 horas lo recibe al instante (si no,
 *     se quedaría sin enlace hasta que alguien se acordara de él), y
 *   · la landing se lo ofrece en un botón a quien ya está inscrito.
 *
 * Incluye la conferencia ya en marcha: quien entra a las once de la mañana ese
 * mismo día también tiene que poder llegar, y es el caso que más duele.
 */
export function enVentanaDeEnlace(ahora: number = Date.now()): boolean {
  const momento = momentoDelEvento(ahora)
  return momento === "vispera" || momento === "enMarcha"
}
