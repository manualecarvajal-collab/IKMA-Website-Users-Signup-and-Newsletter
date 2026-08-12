"use server"

import { revalidatePath } from "next/cache"
import { checkAdmin, registrarActividad } from "@/lib/supabase/admin-helpers"
import { createAdminClient } from "@/lib/supabase/server"
import { getFreeMemberIds } from "@/lib/supabase/free-membership"

export async function getAllUsers() {
  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()

  // membresia_gratis only exists after migration 00029; retry without it so a
  // missing column never breaks the whole user list (roles would default to "lector")
  let perfiles: { id: string; nombre_completo: string | null; suscripcion_activa: boolean | null; membresia_gratis?: boolean | null; rol: string | null }[] | null = null
  let error: unknown = null
  ;({ data: perfiles, error } = await admin
    .from("perfiles")
    .select("id, nombre_completo, suscripcion_activa, membresia_gratis, rol"))
  if (error) {
    ;({ data: perfiles, error } = await admin
      .from("perfiles")
      .select("id, nombre_completo, suscripcion_activa, rol"))
  }

  const perfilesMap = new Map((perfiles ?? []).map(p => [p.id, p]))
  // Source of truth for free membership: solicitudes_membresia (tipo 3, aprobada)
  const freeIds = await getFreeMemberIds(admin)
  // Users with an incomplete registration: filled the form, never paid
  const { data: incompletas } = await admin
    .from("solicitudes_membresia")
    .select("usuario_id")
    .eq("estado", "incompleta")
  const incompletasIds = new Set((incompletas ?? []).map((s) => s.usuario_id))
  const { data: authData } = await admin.auth.admin.listUsers()
  const authUsers = authData?.users ?? []

  if (!authUsers.length) return []

  return authUsers
    .map(u => {
      const perfil = perfilesMap.get(u.id)
      return {
        id: u.id,
        nombre_completo: perfil?.nombre_completo || (u.user_metadata?.nombre_completo as string) || "",
        email: u.email || "No email",
        suscripcion_activa: perfil?.suscripcion_activa ?? false,
        membresia_gratis: (perfil?.membresia_gratis ?? false) || freeIds.has(u.id),
        membresia_incompleta: incompletasIds.has(u.id),
        rol: perfil?.rol || "lector",
        created_at: u.created_at,
      }
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function updateUserName(userId: string, nombre: string): Promise<{ success?: boolean; error?: string }> {
  const nombreLimpio = nombre.trim()
  if (!nombreLimpio) return { error: "Name is required" }

  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()

  const { data: target } = await admin
    .from("perfiles")
    .select("rol, nombre_completo")
    .eq("id", userId)
    .single()
  if (target?.rol === "administrador") return { error: "Cannot rename an admin user" }

  const nombreViejo = target?.nombre_completo || "User"
  await admin.from("perfiles").update({ nombre_completo: nombreLimpio }).eq("id", userId)
  // Keep emails in sync — they read the name from auth user_metadata
  await admin.auth.admin.updateUserById(userId, { user_metadata: { nombre_completo: nombreLimpio } })

  await registrarActividad(supabase, "usuario_editado", `Renamed user "${nombreViejo}" → "${nombreLimpio}"`, "perfiles", userId)

  revalidatePath("/admin/suscriptores")
  revalidatePath("/admin/members")
  return { success: true }
}

export async function deactivateSubscription(userId: string): Promise<void> {
  const { supabase } = await checkAdmin()
  await supabase.from("perfiles").update({ suscripcion_activa: false }).eq("id", userId)
  revalidatePath("/admin/suscriptores")
}

export async function deleteUser(userId: string): Promise<void> {
  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()

  const { data: target } = await admin
    .from("perfiles")
    .select("rol, nombre_completo")
    .eq("id", userId)
    .single()
  if (target?.rol === "administrador") {
    throw new Error("Cannot delete an admin user")
  }

  const nombreUser = target?.nombre_completo || "User"
  await admin.auth.admin.deleteUser(userId)
  await supabase.from("perfiles").delete().eq("id", userId)

  await registrarActividad(supabase, "usuario_eliminado", `Deleted user "${nombreUser}" (${userId})"`, "perfiles", userId)

  revalidatePath("/admin/suscriptores")
}

export async function updateUsersBatch(updates: { id: string, suscripcion_activa: boolean }[]) {
  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()

  const ids = updates.map(u => u.id)
  const { data: targets } = await admin
    .from("perfiles")
    .select("id, rol, nombre_completo")
    .in("id", ids)

  const adminIds = new Set((targets ?? []).filter(t => t.rol === "administrador").map(t => t.id))

  for (const update of updates) {
    if (adminIds.has(update.id)) continue
    const target = (targets ?? []).find(t => t.id === update.id)
    await supabase
      .from("perfiles")
      .update({ suscripcion_activa: update.suscripcion_activa })
      .eq("id", update.id)
    
    const nombre = target?.nombre_completo || "User"
    const accion = update.suscripcion_activa ? "activated" : "deactivated"
    await registrarActividad(supabase, `suscripcion_${update.suscripcion_activa ? "activada" : "desactivada"}`, `${accion} subscription for "${nombre}"`, "perfiles", update.id)
  }

  revalidatePath("/admin/suscriptores")
  return { success: true }
}
