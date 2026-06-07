import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

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
      <aside className="w-64 bg-surface-container-low border-r border-outline-variant/30 shrink-0 hidden md:block">
        <div className="p-6 border-b border-outline-variant/20">
          <Link href="/admin" className="font-headline-md text-headline-md text-primary">IKMA CMS</Link>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{perfil.nombre_completo}</p>
        </div>
        <nav className="p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-primary-container/20 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">dashboard</span> Dashboard
          </Link>
          <Link href="/admin/articulos" className="flex items-center gap-3 px-4 py-3 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-primary-container/20 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">article</span> Articles
          </Link>
          <Link href="/admin/doctores" className="flex items-center gap-3 px-4 py-3 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-primary-container/20 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">stethoscope</span> Doctors
          </Link>
          <hr className="my-4 border-outline-variant/20" />
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-primary-container/20 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Site
          </Link>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden bg-surface-container-low border-b border-outline-variant/30 p-4 flex items-center justify-between">
          <Link href="/admin" className="font-headline-md text-headline-md text-primary">IKMA CMS</Link>
          <div className="flex items-center gap-2">
            <Link href="/admin/articulos" className="text-on-surface-variant hover:text-primary p-2"><span className="material-symbols-outlined">article</span></Link>
            <Link href="/admin/doctores" className="text-on-surface-variant hover:text-primary p-2"><span className="material-symbols-outlined">stethoscope</span></Link>
            <Link href="/" className="text-on-surface-variant hover:text-primary p-2"><span className="material-symbols-outlined">home</span></Link>
          </div>
        </header>
        <main className="flex-1 bg-surface">{children}</main>
      </div>
    </div>
  )
}
