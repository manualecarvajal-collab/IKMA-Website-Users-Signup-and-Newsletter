import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SidebarNav, MobileNav } from "@/components/AdminSidebar"

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
    <div className="flex min-h-screen">
      <SidebarNav nombre={perfil.nombre_completo} />
      <div className="flex-1 flex flex-col min-h-screen">
        <MobileNav />
        <main className="flex-1 bg-surface">{children}</main>
      </div>
    </div>
  )
}
