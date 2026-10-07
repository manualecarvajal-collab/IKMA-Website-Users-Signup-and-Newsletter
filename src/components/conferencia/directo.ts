/**
 * Estados del directo.
 *
 * Vive en su propio módulo, sin dependencias de servidor, porque lo usan los
 * dos lados: el servidor para leerlo y decidir qué se manda al navegador, y el
 * componente de cliente para tiparlo. Mismo motivo que `event.ts`.
 *
 *   antes   → cuenta atrás. La ve todo el mundo; todavía no hay nada que ver.
 *   vivo    → transmitiendo. Con inscripción confirmada se ve; sin ella, el
 *             bloqueo que invita a inscribirse.
 *   espera  → pausa durante el evento. Un aviso para todos, y quien no está
 *             inscrito mantiene debajo el botón de inscribirse.
 *   final   → la conferencia terminó. Pantalla de cierre con la invitación a
 *             hacerse miembro.
 *
 * Es una máquina de estados y no un booleano porque el evento tiene cuatro
 * momentos distintos, no dos, y el día del directo se cambia de uno a otro con
 * prisa.
 */

export const ESTADOS_DIRECTO = ["antes", "vivo", "espera", "final"] as const

export type EstadoDirecto = (typeof ESTADOS_DIRECTO)[number]

/**
 * Valida un valor que viene de fuera.
 *
 * Se usa en los dos límites: al leer `conferencia.ajustes` (donde el valor es
 * texto libre, porque es una tabla clave/valor) y al recibir el estado desde el
 * panel, que es un endpoint POST como cualquier server action.
 *
 * Un valor desconocido NO se acepta ni se propaga: se cae a `antes`, que es el
 * estado que no enseña nada a nadie. Fallar hacia el contador es fallar hacia
 * el lado seguro.
 */
export function esEstadoDirecto(valor: unknown): valor is EstadoDirecto {
  return typeof valor === "string" && (ESTADOS_DIRECTO as readonly string[]).includes(valor)
}
