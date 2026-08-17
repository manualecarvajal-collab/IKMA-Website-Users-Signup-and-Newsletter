"use server"

import { revalidatePath } from "next/cache"
import { checkAdmin, registrarActividad } from "@/lib/supabase/admin-helpers"
import { createAdminClient } from "@/lib/supabase/server"

export async function getAllUsers() {
  await checkAdmin()
  const admin = await createAdminClient()

  const { data: perfiles } = await admin
    .from("perfiles")
    .select("id, nombre_completo, rol, suscripcion_activa")
  const perfilesMap = new Map((perfiles ?? []).map(p => [p.id, p]))

  // Source of truth: solicitudes_membresia. Keep the latest application per user.
  const { data: solicitudes } = await admin
    .from("solicitudes_membresia")
    .select("usuario_id, tipo_miembro, estado")
    .order("created_at", { ascending: true })
  const membresiaMap = new Map<string, { tipo_miembro: number | null; estado: string | null }>()
  for (const s of solicitudes ?? []) {
    membresiaMap.set(s.usuario_id, { tipo_miembro: s.tipo_miembro, estado: s.estado })
  }

  const { data: authData } = await admin.auth.admin.listUsers()
  const authUsers = authData?.users ?? []

  if (!authUsers.length) return []

  return authUsers
    .map(u => {
      const perfil = perfilesMap.get(u.id)
      // No application on record and no active subscription → the registration
      // is incomplete (student is the only free membership, and students always
      // leave an application behind after submitting).
      const membresia = membresiaMap.get(u.id)
      const sinPago = !perfil || !perfil.suscripcion_activa
      const meta = u.user_metadata as Record<string, unknown> | undefined
      return {
        id: u.id,
        // Google OAuth stores the name as full_name/name, not nombre_completo.
        // Last resort: derive a placeholder from the email local part.
        nombre_completo:
          perfil?.nombre_completo ||
          (meta?.nombre_completo as string) ||
          (meta?.full_name as string) ||
          (meta?.name as string) ||
          u.email?.split("@")[0] ||
          "",
        email: u.email || "No email",
        membresia: membresia ?? (sinPago ? { tipo_miembro: null, estado: "incompleta" } : null),
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
