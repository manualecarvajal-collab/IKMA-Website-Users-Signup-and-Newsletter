export const memberLabels: Record<number, string> = {
  1: "Licensed Health Professional",
  2: "Resident (Post-graduate)",
  3: "Student",
  4: "Associate (Non-health)",
}

export const statusColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  pagada: "bg-blue-100 text-blue-800",
  incompleta: "bg-orange-100 text-orange-800",
  // Cuenta eliminada: la fila solo sobrevive como registro de auditoría.
  eliminado: "bg-red-100 text-red-800",
}

export const statusLabels: Record<string, string> = {
  pendiente: "Pending",
  aprobada: "Approved",
  rechazada: "Rejected",
  pagada: "Paid",
  incompleta: "Incomplete",
  eliminado: "Deleted",
}

export type MembershipApplicationState = {
  tipo_miembro: number | null
  estado: string | null
}

/**
 * Does this set of applications still entitle the member to access?
 *
 * Entitlement is derived from the applications themselves, never from the last
 * decision taken, so that acting on one row cannot override another: a member
 * with an approved application plus a rejected duplicate must keep both their
 * access and their subscription.
 *
 *  - paid categories (1, 2, 4): an approved application, or one already paid
 *    and waiting for the admin verdict (the money is in, so billing must not be
 *    cancelled underneath them).
 *  - students (3): only an approved application - students never pay.
 */
export function hasVigenteAcceso(rows: MembershipApplicationState[]): boolean {
  return rows.some(
    (r) =>
      r.estado === "aprobada" ||
      (r.estado === "pagada" && r.tipo_miembro !== 3)
  )
}

/**
 * Is there an approved *paid* membership behind this member?
 *
 * Used by the billing webhook to decide whether a healthy subscription may give
 * access back: a student (tipo 3) never has one, and an application that is only
 * "pagada" still needs the admin verdict before it grants anything.
 */
export function hasAprobacionPagada(rows: MembershipApplicationState[]): boolean {
  return rows.some((r) => r.estado === "aprobada" && r.tipo_miembro !== 3)
}
/**
 * ¿Puede el miembro cambiar su categoría o región desde el perfil?
 *
 * Solo mientras no haya pagado: a partir de "pagada"/"aprobada" el precio ya
 * cobrado corresponde a la categoría anterior, así que un cambio silencioso
 * dejaría a alguien pagando la cuota de Residente con las ventajas de
 * Licenciado (o al revés). Los cambios de categoría pasan por el admin.
 *
 * El país sí se puede corregir siempre: no afecta al precio.
 */
export function puedeCambiarPlan(estado: string | null | undefined): boolean {
  return !estado || ["incompleta", "pendiente", "rechazada"].includes(estado)
}
