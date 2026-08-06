import type { SupabaseClient } from "@supabase/supabase-js"

// Free membership (tipo 3, estado "aprobada") is recorded in
// solicitudes_membresia by the student application flow (manual admin review).
// perfiles.membresia_gratis is only a denormalized mirror added by migration
// 00029, so we always derive the status from solicitudes_membresia to avoid
// silent failures when the column is missing.

export async function getFreeMemberIds(admin: SupabaseClient): Promise<Set<string>> {
  const { data } = await admin
    .from("solicitudes_membresia")
    .select("usuario_id")
    .eq("tipo_miembro", 3)
    .eq("estado", "aprobada")
  return new Set((data ?? []).map((s) => s.usuario_id))
}

export async function esMembresiaGratis(admin: SupabaseClient, userId: string): Promise<boolean> {
  const ids = await getFreeMemberIds(admin)
  return ids.has(userId)
}

// Same check using the regular (user-scoped) client: RLS allows users to read
// their own solicitudes ("Usuarios ven sus propias solicitudes").
export async function esMembresiaGratisUsuario(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("solicitudes_membresia")
    .select("id")
    .eq("usuario_id", userId)
    .eq("tipo_miembro", 3)
    .eq("estado", "aprobada")
    .maybeSingle()
  return !!data
}

// Merges free-member ids into a list of paid subscribers, appending a profile
// row for each free member that is not already a paid subscriber.
export async function mergeFreeMembers(
  admin: SupabaseClient,
  paid: { id: string; nombre_completo: string | null }[]
): Promise<{ id: string; nombre_completo: string | null }[]> {
  const freeIds = await getFreeMemberIds(admin)
  if (!freeIds.size) return paid

  const known = new Set(paid.map((s) => s.id))
  const missing = [...freeIds].filter((id) => !known.has(id))
  if (!missing.length) return paid

  const { data: freeProfiles } = await admin
    .from("perfiles")
    .select("id, nombre_completo")
    .in("id", missing)

  const byId = new Map((freeProfiles ?? []).map((p) => [p.id, p.nombre_completo]))
  return [
    ...paid,
    ...missing.map((id) => ({ id, nombre_completo: byId.get(id) ?? null })),
  ]
}
