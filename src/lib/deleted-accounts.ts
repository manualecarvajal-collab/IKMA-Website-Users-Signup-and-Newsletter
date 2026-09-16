import { statusLabels } from "@/lib/membership"

// Shared, dependency-free pieces of the "deleted account" feature, safe to
// import from client components (the admin tables use the labels) and from the
// server-side code that writes the snapshots.

export const ESTADO_ELIMINADO = "eliminado"

export type MotivoEliminacion = "usuario" | "admin"

export type SnapshotEliminado = {
  id: string
  usuario_id: string
  email: string | null
  nombre_completo: string | null
  rol: string | null
  motivo: MotivoEliminacion
  eliminado_por_nombre: string | null
  tipo_miembro: number | null
  region: string | null
  estado_solicitud: string | null
  stripe_customer_id: string | null
  suscripcion_cancelada: boolean
  detalle: string | null
  visto_at: string | null
  usuario_created_at: string | null
  deleted_at: string
}

/** Row decoration the admin lists add to a deleted account. */
export type UserDeletionInfo = {
  motivo: string
  cuando: string
  estadoPrevio: string | null
  suscripcionCancelada: boolean
  detalle: string | null
}

export const motivoLabels: Record<MotivoEliminacion, string> = {
  usuario: "Deleted by the user",
  admin: "Deleted by an admin",
}

/** Best available name; never empty, so the tables never render a blank cell. */
export function nombreEliminado(s: Pick<SnapshotEliminado, "nombre_completo" | "email">): string {
  return s.nombre_completo?.trim() || s.email || "Deleted account"
}

/** "Deleted by the user" / "Deleted by an admin (Ana)" */
export function motivoLabel(
  s: Pick<SnapshotEliminado, "motivo" | "eliminado_por_nombre">
): string {
  const label = motivoLabels[s.motivo] ?? motivoLabels.usuario
  return s.motivo === "admin" && s.eliminado_por_nombre ? `${label} (${s.eliminado_por_nombre})` : label
}

/** The membership status the account had when it disappeared, if any. */
export function estadoPrevio(s: Pick<SnapshotEliminado, "estado_solicitud">): string | null {
  if (!s.estado_solicitud) return null
  return statusLabels[s.estado_solicitud] ?? s.estado_solicitud
}

/**
 * Snapshots that belong in the members list: only accounts that had actually
 * started a membership application. A plain reader who deleted their account
 * is a "user", not a "member".
 */
export function snapshotsDeMiembros(snapshots: SnapshotEliminado[]): SnapshotEliminado[] {
  return snapshots.filter((s) => s.tipo_miembro != null)
}

/**
 * Snapshots whose Stripe subscription still needs cancelling. These come from a
 * deletion where Stripe did not answer, so the account is gone but the charge
 * could survive - the cron retries them and the panel warns about them.
 */
export function pendientesDeCancelar(snapshots: SnapshotEliminado[]): SnapshotEliminado[] {
  return snapshots.filter((s) => !s.suscripcion_cancelada && !!s.stripe_customer_id)
}
