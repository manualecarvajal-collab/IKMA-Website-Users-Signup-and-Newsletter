import Link from "next/link"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export default async function AdminDashboard() {
  const supabase = await createClient()
  const admin = await createAdminClient()

  const { count: articulosPub } = await supabase
    .from("articulos").select("*", { count: "exact", head: true }).eq("publicado", true)
  const { count: articulosTotal } = await supabase
    .from("articulos").select("*", { count: "exact", head: true })
  const { count: doctoresPub } = await supabase
    .from("doctores").select("*", { count: "exact", head: true }).eq("publicado", true)
  const { count: doctoresTotal } = await supabase
    .from("doctores").select("*", { count: "exact", head: true })
  const { count: revistasPub } = await supabase
    .from("revistas").select("*", { count: "exact", head: true }).eq("publicado", true)
  const { count: revistasTotal } = await supabase
    .from("revistas").select("*", { count: "exact", head: true })
  const { count: videosPub } = await supabase
    .from("videos").select("*", { count: "exact", head: true }).eq("publicado", true)
  const { count: videosTotal } = await supabase
    .from("videos").select("*", { count: "exact", head: true })

  // Use admin client (service_role) to bypass RLS and get real counts
  const { count: suscripActiva } = await admin
    .from("perfiles").select("*", { count: "exact", head: true }).eq("suscripcion_activa", true)
  const { data: authData } = await admin.auth.admin.listUsers()
  const usuariosTotal = authData?.users?.length ?? 0
  const soloRegistrados = usuariosTotal - (suscripActiva ?? 0)

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-gutter">
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm relative">
          <Link
            href="/admin/articulos"
            className="absolute top-4 right-4 text-primary font-label-bold text-label-sm hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Manage <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">article</span>
            </div>
            <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Total Articles</span>
          </div>
          <p className="font-headline-xl text-headline-xl text-primary">{articulosTotal ?? 0}</p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{articulosPub ?? 0} published</p>
          <div className="mt-4 pt-3 border-t border-outline-variant/10">
            <Link href="/admin/articulos" className="text-primary font-label-bold text-label-sm hover:underline flex items-center gap-1">
              Manage <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm relative">
          <Link
            href="/admin/doctores"
            className="absolute top-4 right-4 text-primary font-label-bold text-label-sm hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Manage <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">stethoscope</span>
            </div>
            <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Total Doctors</span>
          </div>
          <p className="font-headline-xl text-headline-xl text-primary">{doctoresTotal ?? 0}</p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{doctoresPub ?? 0} published</p>
          <div className="mt-4 pt-3 border-t border-outline-variant/10">
            <Link href="/admin/doctores" className="text-primary font-label-bold text-label-sm hover:underline flex items-center gap-1">
              Manage <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm relative">
          <Link
            href="/admin/revistas"
            className="absolute top-4 right-4 text-primary font-label-bold text-label-sm hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Manage <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">newsmode</span>
            </div>
            <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Total Magazines</span>
          </div>
          <p className="font-headline-xl text-headline-xl text-primary">{revistasTotal ?? 0}</p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{revistasPub ?? 0} published</p>
          <div className="mt-4 pt-3 border-t border-outline-variant/10">
            <Link href="/admin/revistas" className="text-primary font-label-bold text-label-sm hover:underline flex items-center gap-1">
              Manage <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm relative">
          <Link
            href="/admin/teachings"
            className="absolute top-4 right-4 text-primary font-label-bold text-label-sm hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Manage <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">play_circle</span>
            </div>
            <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Total Teachings</span>
          </div>
          <p className="font-headline-xl text-headline-xl text-primary">{videosTotal ?? 0}</p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{videosPub ?? 0} published</p>
          <div className="mt-4 pt-3 border-t border-outline-variant/10">
            <Link href="/admin/teachings" className="text-primary font-label-bold text-label-sm hover:underline flex items-center gap-1">
              Manage <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm relative">
          <Link
            href="/admin/suscriptores"
            className="absolute top-4 right-4 text-primary font-label-bold text-label-sm hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Manage <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">group</span>
            </div>
            <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Users</span>
          </div>
          <p className="font-headline-xl text-headline-xl text-primary">{usuariosTotal}</p>
          <div className="mt-4 pt-3 border-t border-outline-variant/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-label-bold text-label-sm text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-tertiary" />
                Paid Subscribers
              </span>
              <span className="font-label-bold text-label-sm text-on-surface">{suscripActiva}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-label-bold text-label-sm text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-surface-container-high" />
                Free Users
              </span>
              <span className="font-label-bold text-label-sm text-on-surface">{soloRegistrados}</span>
            </div>
            <div className="pt-2">
              <Link href="/admin/suscriptores" className="text-primary font-label-bold text-label-sm hover:underline flex items-center gap-1">
                Manage <span className="material-symbols-outlined text-sm">open_in_new</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
