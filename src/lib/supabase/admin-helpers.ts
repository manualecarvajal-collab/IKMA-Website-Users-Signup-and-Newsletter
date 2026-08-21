import { redirect } from "next/navigation"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/slugify"

export async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single()
  if (perfil?.rol !== "administrador") redirect("/")
  return { supabase, user }
}

export async function registrarActividad(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  tipo: string,
  descripcion: string,
  ref_tabla?: string,
  ref_id?: string
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  // Use admin client to bypass RLS on select (perfiles lookup)
  const admin = await createAdminClient()
  const { data: perfil } = await admin
    .from("perfiles")
    .select("nombre_completo")
    .eq("id", user.id)
    .single()
  await admin.from("actividad_admin").insert({
    usuario_id: user.id,
    usuario_nombre: perfil?.nombre_completo || user.email || "Admin",
    tipo,
    descripcion,
    ref_tabla,
    ref_id,
  })
}

export { slugify }
