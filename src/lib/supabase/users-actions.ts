"use server"

import { revalidatePath } from "next/cache"
import { checkAdmin, registrarActividad } from "@/lib/supabase/admin-helpers"
import { createAdminClient } from "@/lib/supabase/server"

export async function getAllUsers() {
  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()
  const { data: perfiles } = await admin
    .from("perfiles")
    .select("id, nombre_completo, suscripcion_activa, membresia_gratis, rol")

  const perfilesMap = new Map((perfiles ?? []).map(p => [p.id, p]))
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
        membresia_gratis: perfil?.membresia_gratis ?? false,
        rol: perfil?.rol || "lector",
        created_at: u.created_at,
      }
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
