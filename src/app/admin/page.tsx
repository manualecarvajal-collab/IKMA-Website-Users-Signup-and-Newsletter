import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: articulosPub } = await supabase
    .from("articulos").select("*", { count: "exact", head: true }).eq("publicado", true)
  const { count: articulosTotal } = await supabase
    .from("articulos").select("*", { count: "exact", head: true })
  const { count: doctoresPub } = await supabase
    .from("doctores").select("*", { count: "exact", head: true }).eq("publicado", true)
  const { count: doctoresTotal } = await supabase
    .from("doctores").select("*", { count: "exact", head: true })

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">article</span>
            </div>
            <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Total Articles</span>
          </div>
          <p className="font-headline-xl text-headline-xl text-primary">{articulosTotal ?? 0}</p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{articulosPub ?? 0} published</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">stethoscope</span>
            </div>
            <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Total Doctors</span>
          </div>
          <p className="font-headline-xl text-headline-xl text-primary">{doctoresTotal ?? 0}</p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{doctoresPub ?? 0} published</p>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <Link href="/admin/articulos" className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline-md text-headline-md text-primary">Manage Articles</h2>
            <span className="material-symbols-outlined text-primary">arrow_forward</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">Create, edit, and publish journal articles</p>
        </Link>
        <Link href="/admin/doctores" className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline-md text-headline-md text-primary">Manage Doctors</h2>
            <span className="material-symbols-outlined text-primary">arrow_forward</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">Create, edit, and publish doctor profiles</p>
        </Link>
      </div>
    </div>
  )
}
