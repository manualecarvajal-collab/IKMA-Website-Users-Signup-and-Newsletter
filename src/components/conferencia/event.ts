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
