import Link from "next/link"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import Icon from "@/components/Icon"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Stats
  const { count: articulosPub } = await supabase
    .from("articulos").select("*", { count: "exact", head: true }).eq("publicado", true)
  const { count: articulosTotal } = await supabase
    .from("articulos").select("*", { count: "exact", head: true })
  const { count: revistasPub } = await supabase
    .from("revistas").select("*", { count: "exact", head: true }).eq("publicado", true)
  const { count: revistasTotal } = await supabase
    .from("revistas").select("*", { count: "exact", head: true })
  const { count: videosPub } = await supabase
    .from("videos").select("*", { count: "exact", head: true }).eq("publicado", true)
  const { count: videosTotal } = await supabase
    .from("videos").select("*", { count: "exact", head: true })

  // Recent articles for the card list + activity log
  const { data: articulosRecientes } = await supabase
    .from("articulos").select("titulo, slug")
    .order("created_at", { ascending: false }).limit(3)

  // Latest published magazine for the card
  const { data: ultimaRevista } = await supabase
    .from("revistas")
    .select("titulo, descripcion, imagen_portada, archivo_url")
    .eq("publicado", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Latest teaching video for the card
  const { data: ultimoVideo } = await supabase
    .from("videos")
    .select("titulo, slug, embed_url, imagen_preview")
    .eq("publicado", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const admin = await createAdminClient()
  const { data: actividades } = await admin
    .from("actividad_admin")
    .select("usuario_nombre, tipo, descripcion, ref_tabla, created_at")
    .order("created_at", { ascending: false }).limit(5)

  // Activity chart: page visits per day for last 14 days
  const catorceDias = new Date()
  catorceDias.setDate(catorceDias.getDate() - 14)
  const { data: visitasChart } = await admin
    .from("visitas")
    .select("created_at")
    .gte("created_at", catorceDias.toISOString())

  const countsPorDia: Record<string, number> = {}
  visitasChart?.forEach(v => {
    const dia = new Date(v.created_at).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
    countsPorDia[dia] = (countsPorDia[dia] || 0) + 1
  })

  const barras = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const label = i === 13 ? "Today" : d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
    const count = countsPorDia[label] || 0
    return { label, h: Math.min(Math.round((count / 100) * 100), 100), isToday: i === 13 }
  })

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="h-20 bg-white border-b border-[#c1c7ce] flex items-center justify-between px-6 sticky top-0 z-40">
        <div>
          <h1 className="text-[24px] font-semibold text-[#003652] leading-8 tracking-tight">Dashboard</h1>
          <p className="text-[12px] text-[#41474d] leading-4 tracking-[0.02em] font-medium">
            Welcome back, here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/suscriptores"
            className="bg-[#003652] text-white px-6 py-2 rounded-lg text-[14px] font-semibold leading-5 tracking-[0.01em] hover:bg-[#1a4d6d] transition-all duration-200 flex items-center gap-2"
          >
            <Icon name="person_add" size={20} className="font-light" />
            Users
          </Link>
        </div>
      </header>

      {/* Content Body */}
      <div className="w-full max-w-full px-4 sm:px-6 md:px-8 py-6 space-y-6">
        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Articles Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(26,77,109,0.08)] group hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
            <div className="p-6 pb-0 flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-[#cae6ff] flex items-center justify-center text-[#003652]">
                <Icon name="description" size={28} />
              </div>
              <span className="text-[#41474d] text-[12px] font-medium leading-4 tracking-[0.02em] bg-[#eceeef] px-2 py-1 rounded">
                Last 30 days
              </span>
            </div>
            <div className="p-6 pt-0 flex-1 flex flex-col">
              <div className="space-y-1">
                <h3 className="text-[#41474d] text-[14px] font-semibold leading-5 tracking-[0.01em]">Total Articles</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#003652]">{articulosTotal ?? 0}</span>
                  <span className="text-[#003652] text-[12px] font-medium leading-4 tracking-[0.02em]">Published</span>
                </div>
              </div>
              {articulosRecientes && articulosRecientes.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-[#c1c7ce] pt-4">
                  {articulosRecientes.map((a) => (
                    <li key={a.slug} className="text-[12px] text-[#41474d] font-medium leading-4 tracking-[0.02em] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#003652]"></span>
                      <span className="notranslate">{a.titulo}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="pt-4 border-t border-[#c1c7ce] flex justify-between items-center mt-auto">
                <Link href="/admin/articulos" className="text-[#003652] text-[14px] font-semibold leading-5 tracking-[0.01em] flex items-center gap-1 hover:underline">
                  Manage
                  <Icon name="arrow_forward" size={16} />
                </Link>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-[#d8dadb]"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-[#e1e3e4]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Magazines Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(26,77,109,0.08)] group hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
            <div className="p-6 pb-0 flex justify-between items-start">
              <div className="w-12 h-12 rounded-lg bg-[#ffddb3] flex items-center justify-center text-[#472d00]">
                <Icon name="menu_book" size={28} />
              </div>
              <div className="text-right">
                <h3 className="text-[#41474d] text-[14px] font-semibold leading-5 tracking-[0.01em]">Total Magazines</h3>
                <span className="text-4xl font-bold text-[#003652]">{revistasTotal ?? 0}</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="relative mt-2 rounded-lg overflow-hidden aspect-[4/3] bg-[#eceeef] border border-[#c1c7ce]">
                {ultimaRevista?.imagen_portada ? (
                  <img
                    src={ultimaRevista.imagen_portada}
                    alt={ultimaRevista.titulo}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#cae6ff]/30 to-[#1a4d6d]/10"></div>
                )}
                {!ultimaRevista?.imagen_portada && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon name="menu_book" size={48} className="text-[#003652]/30" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-[#003652]/90 text-white px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest">
                  {ultimaRevista ? "Latest Issue" : "No Issues"}
                </div>
              </div>
              {ultimaRevista && (
                <p className="text-[13px] font-semibold text-[#003652] mt-3 leading-5 line-clamp-2 notranslate">{ultimaRevista.titulo}</p>
              )}
              <div className="mt-4 pt-4 border-t border-[#c1c7ce] mt-auto">
                <Link href="/admin/revistas" className="text-[#003652] text-[14px] font-semibold leading-5 tracking-[0.01em] flex items-center gap-1 hover:underline">
                  Manage
                  <Icon name="arrow_forward" size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Total Teachings Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(26,77,109,0.08)] group hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
            <div className="p-6 pb-0 flex justify-between items-start">
              <div className="w-12 h-12 rounded-lg bg-[#d9e4e8] flex items-center justify-center text-[#003652]">
                <Icon name="smart_display" size={28} />
              </div>
              <div className="text-right">
                <h3 className="text-[#41474d] text-[14px] font-semibold leading-5 tracking-[0.01em]">Total Teachings</h3>
                <span className="text-4xl font-bold text-[#003652]">{videosTotal ?? 0}</span>
              </div>
            </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="relative mt-2 rounded-lg overflow-hidden aspect-video bg-[#0D2636]">
                  {ultimoVideo?.imagen_preview ? (
                    <img src={ultimoVideo.imagen_preview} alt={ultimoVideo.titulo} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#cae6ff]/10 to-[#0D2636]/60"></div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon name="play_arrow" size={32} className="text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-white text-[10px] font-medium truncate notranslate">{ultimoVideo?.titulo || "No teachings yet"}</p>
                  </div>
                </div>
              <div className="mt-4 pt-4 border-t border-[#c1c7ce] mt-auto">
                <Link href="/admin/teachings" className="text-[#003652] text-[14px] font-semibold leading-5 tracking-[0.01em] flex items-center gap-1 hover:underline">
                  Manage
                  <Icon name="arrow_forward" size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Overview / Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Activity */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(26,77,109,0.08)] h-96 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-[24px] font-semibold text-[#003652] leading-8 tracking-tight">System Activity</h2>
                <p className="text-[#41474d] text-[12px] font-medium leading-4 tracking-[0.02em]">Usage metrics over the last 14 days</p>
              </div>
              <div className="flex gap-4 text-[12px] font-medium text-[#41474d]">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-[#003652]">Y:</span> Visitors
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-[#003652]">X:</span> Month/Day
                </div>
              </div>
            </div>
            <div className="relative h-64 w-full">
              {/* Y-axis reference lines */}
              <div className="absolute inset-0 flex flex-col-reverse justify-between pb-6">
                {[0, 25, 50, 100].map(n => (
                  <div key={n} className="flex items-center gap-2 w-full">
                    <span className="text-[10px] text-[#41474d] w-6 text-right shrink-0">{n}</span>
                    <div className="flex-1 border-t border-[#d9e4e8]/50"></div>
                  </div>
                ))}
              </div>
              {/* Bars */}
              <div className="relative h-full flex items-end justify-between gap-2 px-8 pb-6">
                {barras.map((bar) => (
                <div key={bar.label} className="flex-1 flex flex-col justify-end gap-1 h-full group">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 group-hover:bg-[#003652] ${bar.isToday ? "bg-[#003652]" : "bg-[#003652]/20"}`}
                    style={{ height: `${bar.h}%` }}
                  ></div>
                  <span className={`text-[10px] text-center ${bar.isToday ? "font-bold text-[#003652]" : "text-[#41474d]"}`}>
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </div>

          {/* Activity History */}
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(26,77,109,0.08)] overflow-hidden">
            <div className="p-6 border-b border-[#c1c7ce] flex justify-between items-center">
              <h2 className="text-[24px] font-semibold text-[#003652] leading-8 tracking-tight">Activity History</h2>
              <span className="text-[12px] font-medium text-[#41474d] bg-[#f2f4f5] px-2 py-1 rounded">
                Latest
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f2f4f5]">
                  <tr>
                    <th className="px-6 py-4 text-[14px] font-semibold text-[#41474d] uppercase tracking-wider leading-5">Action</th>
                    <th className="px-6 py-4 text-[14px] font-semibold text-[#41474d] uppercase tracking-wider leading-5">User</th>
                    <th className="px-6 py-4 text-[14px] font-semibold text-[#41474d] uppercase tracking-wider leading-5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c1c7ce]">
                  {actividades?.map((a, i) => (
                    <tr key={`act-${i}`} className="hover:bg-[#ffffff] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded flex items-center justify-center ${
                            a.tipo?.startsWith("articulo") ? "bg-[#cae6ff]" :
                            a.tipo?.startsWith("revista") ? "bg-[#ffddb3]" :
                            a.tipo?.startsWith("video") || a.tipo?.startsWith("newsletter") ? "bg-[#d9e4e8]" :
                            a.tipo?.startsWith("usuario") || a.tipo?.startsWith("suscripcion") ? "bg-[#e1e3e4]" :
                            a.tipo?.startsWith("doctor") ? "bg-[#ffddb3]" :
                            "bg-[#eceeef]"
                          }`}>
                            <Icon name={
                              a.tipo?.startsWith("articulo_creado") ? "note_add" :
                               a.tipo?.startsWith("articulo_actualizado") ? "edit_note" :
                               a.tipo?.startsWith("articulo_eliminado") || a.tipo?.endsWith("_eliminado") ? "delete" :
                               a.tipo?.includes("publicado") ? "check_circle" :
                               a.tipo?.includes("despublicado") ? "visibility_off" :
                               a.tipo?.startsWith("revista") ? "menu_book" :
                               a.tipo?.startsWith("video") ? "smart_display" :
                               a.tipo?.startsWith("newsletter") ? "mail" :
                               a.tipo?.startsWith("doctor") ? "stethoscope" :
                               a.tipo?.startsWith("usuario") ? "person_remove" :
                               a.tipo?.startsWith("suscripcion") ? "subscriptions" :
                               "article"
                            } size={18} className={
                              a.tipo?.startsWith("articulo") ? "text-[#003652]" :
                              a.tipo?.startsWith("revista") ? "text-[#472d00]" :
                              a.tipo?.startsWith("video") || a.tipo?.startsWith("newsletter") ? "text-[#003652]" :
                              a.tipo?.startsWith("usuario") || a.tipo?.startsWith("suscripcion") ? "text-[#41474d]" :
                              a.tipo?.startsWith("doctor") ? "text-[#472d00]" :
                              "text-[#41474d]"
                            } />
                          </div>
                          <span className="text-[14px] text-[#1A1C1E] leading-5">{a.descripcion}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#41474d] text-[14px] leading-5"><span className="notranslate">{a.usuario_nombre || "—"}</span></td>
                      <td className="px-6 py-4 text-[#41474d] text-[14px] leading-5 whitespace-nowrap">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                    </tr>
                  ))}
                  {(!actividades || actividades.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-[#41474d] text-sm">
                        No activity recorded yet. Actions will appear here as you manage the site.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
