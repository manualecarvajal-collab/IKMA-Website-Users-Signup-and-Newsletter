import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminNavWrapper } from "@/components/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, nombre_completo")
    .eq("id", user.id)
    .single()

  if (perfil?.rol !== "administrador") redirect("/")

  return (
    <AdminNavWrapper nombre={perfil.nombre_completo}>
      {children}
    </AdminNavWrapper>
  )
}
