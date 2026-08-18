import Link from "next/link"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import Icon from "@/components/Icon"
import { getTranslations } from "next-intl/server"
import { memberLabels, statusLabels, statusColors } from "@/lib/membership"

export default async function AdminDashboard() {
  const t = await getTranslations("Admin")
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

  // Last 5 membership applications for the summary card
  const { data: ultimosMiembros } = await admin
    .from("solicitudes_membresia")
    .select("id, usuario_id, tipo_miembro, estado")
    .order("created_at", { ascending: false })
    .limit(5)
  const idsMiembros = ultimosMiembros?.map((s) => s.usuario_id) || []
  const { data: perfilesMiembros } = idsMiembros.length
    ? await admin.from("perfiles").select("id, nombre_completo").in("id", idsMiembros)
    : { data: [] }
  const nombreMap = new Map(perfilesMiembros?.map((p) => [p.id, p.nombre_completo]) ?? [])

  const { count: totalUsuarios } = await admin
    .from("perfiles").select("*", { count: "exact", head: true })
  const { count: totalSolicitudes } = await admin
    .from("solicitudes_membresia").select("*", { count: "exact", head: true })
  const { count: solicitudesPendientes } = await admin
    .from("solicitudes_membresia").select("*", { count: "exact", head: true }).eq("estado", "pendiente")

  // Activity chart: page visits per day for last 14 days.
  // Se agrega en la DB (view visitas_por_dia) para no chocar con el
  // límite de 1000 filas por query.
  const catorceDias = new Date(Date.now() - 13 * 86400000).toISOString().slice(0, 10)
  const { data: visitasChart } = await admin
    .from("visitas_por_dia")
    .select("dia, total")
    .gte("dia", catorceDias)

  const countsPorDia: Record<string, number> = {}
  visitasChart?.forEach(v => {
    countsPorDia[v.dia] = v.total
  })

  const dias = Array.from({ length: 14 }, (_, i) =>
    new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10)
  )
  // ponytail: eje Y fijo 0-1000 (250/500/750), barras cap al 100%
  const barras = dias.map((d, i) => ({
    label: i === 13 ? t("today") : d.slice(5).replace("-", "/"),
    count: countsPorDia[d] || 0,
    h: Math.min(100, Math.round(((countsPorDia[d] || 0) / 1000) * 100)),
    isToday: i === 13,
  }))

  return (
    <div className="flex flex-col min-h-screen md:h-screen">
      {/* Header */}
      <header className="bg-white border-b border-[#c1c7ce] flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:px-6 py-3 md:h-20 md:py-0 sticky top-0 z-40">
        <div>
          <h1 className="text-[24px] font-semibold text-[#003652] leading-8 tracking-tight">{t("dashboardTitle")}</h1>
          <p className="text-[12px] text-[#41474d] leading-4 tracking-[0.02em] font-medium">
            {t("dashboardSubtitle")}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 w-full md:w-auto md:justify-start">
          <div className="flex items-center gap-3">
            <span className="text-[#41474d] text-[14px] font-medium leading-5 tracking-[0.02em]">Total Users</span>
            <span className="bg-[#cae6ff] text-[#003652] px-3 py-2 rounded-lg text-[14px] font-bold leading-5 tracking-[0.01em]">
              {totalUsuarios ?? 0}
            </span>
          </div>
          <Link
            href="/admin/suscriptores"
            className="ml-auto bg-[#003652] text-white px-6 py-2 rounded-lg text-[14px] font-semibold leading-5 tracking-[0.01em] hover:bg-[#1a4d6d] transition-all duration-200 flex items-center gap-2"
          >
            <Icon name="person_add" size={20} className="font-light" />
            {t("users")}
          </Link>
        </div>
      </header>

      {/* Content Body */}
      <div className="w-full max-w-full px-4 sm:px-6 md:px-8 py-6 flex-1 flex flex-col gap-6 min-h-0">
        {/* Quick Stats Section */}
        {/* Mobile: compact buttons for Magazines + Articles */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          <Link href="/admin/revistas" className="bg-white rounded-xl p-4 shadow-[0_4px_20px_rgba(26,77,109,0.08)] flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#ffddb3] flex items-center justify-center text-[#472d00]">
                <Icon name="menu_book" size={18} />
              </div>
              <span className="text-[12px] font-semibold text-[#41474d] leading-4">{t("totalMagazines")}</span>
            </div>
            <span className="text-2xl font-bold text-[#003652]">{revistasTotal ?? 0}</span>
            {ultimaRevista && (
              <span className="text-[11px] text-[#41474d] truncate notranslate">{ultimaRevista.titulo}</span>
            )}
          </Link>
          <Link href="/admin/articulos" className="bg-white rounded-xl p-4 shadow-[0_4px_20px_rgba(26,77,109,0.08)] flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#cae6ff] flex items-center justify-center text-[#003652]">
                <Icon name="description" size={18} />
              </div>
              <span className="text-[12px] font-semibold text-[#41474d] leading-4">{t("totalArticles")}</span>
            </div>
            <span className="text-2xl font-bold text-[#003652]">{articulosPub ?? 0}</span>
            <span className="text-[11px] text-[#41474d]">{t("published")}</span>
          </Link>
          <Link href="/admin/teachings" className="bg-white rounded-xl p-4 shadow-[0_4px_20px_rgba(26,77,109,0.08)] flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#d9e4e8] flex items-center justify-center text-[#003652]">
                <Icon name="smart_display" size={18} />
              </div>
              <span className="text-[12px] font-semibold text-[#41474d] leading-4">{t("totalTeachings")}</span>
            </div>
            <span className="text-2xl font-bold text-[#003652]">{videosTotal ?? 0}</span>
            {ultimoVideo && (
              <span className="text-[11px] text-[#41474d] truncate notranslate">{ultimoVideo.titulo}</span>
            )}
          </Link>
          <Link href="/admin/members" className="bg-white rounded-xl p-4 shadow-[0_4px_20px_rgba(26,77,109,0.08)] flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#e1e3e4] flex items-center justify-center text-[#003652]">
                <Icon name="groups" size={18} />
              </div>
              <span className="text-[12px] font-semibold text-[#41474d] leading-4">Members</span>
            </div>
            <span className="text-2xl font-bold text-[#003652]">{totalSolicitudes ?? 0}</span>
            <span className="text-[11px] text-[#41474d]">
              {(solicitudesPendientes ?? 0) > 0 ? `${solicitudesPendientes} pending` : t("published")}
            </span>
          </Link>
        </div>
        <div className="hidden md:flex md:flex-row flex-wrap min-[1366px]:flex-nowrap gap-6">
          {/* Total Magazines Card */}
          <div className="hidden md:flex justify-start">
            <div className="relative h-72 md:h-auto max-w-full aspect-[3/4] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(26,77,109,0.08)] group hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
            {ultimaRevista?.imagen_portada ? (
              <img
                src={ultimaRevista.imagen_portada}
                alt={ultimaRevista.titulo}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#cae6ff]/30 to-[#1a4d6d]/10"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white via-white/40 to-transparent"></div>
            <div className="relative p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-lg bg-[#ffddb3] flex items-center justify-center text-[#472d00]">
                  <Icon name="menu_book" size={28} />
                </div>
                <div className="text-right">
                  <h3 className="text-[#003652] text-[14px] font-semibold leading-5 tracking-[0.01em]">{t("totalMagazines")}</h3>
                  <span className="text-4xl font-bold text-[#003652]">{revistasTotal ?? 0}</span>
                </div>
              </div>
              <div className="mt-auto">
                {ultimaRevista && (
                  <p className="text-[#003652] text-[13px] font-semibold leading-5 line-clamp-2 notranslate mb-3">{ultimaRevista.titulo}</p>
                )}
                <Link href="/admin/revistas" className="inline-flex items-center gap-1 text-[#003652] text-[14px] font-semibold leading-5 tracking-[0.01em] hover:underline">
                  {t("manage")}
                  <Icon name="arrow_forward" size={16} />
                </Link>
              </div>
            </div>
            </div>
          </div>
          {/* Total Articles Card */}
          <div className="hidden md:flex bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(26,77,109,0.08)] group hover:-translate-y-0.5 transition-all duration-300 flex-col w-[283.283px]">
            <div className="p-6 pb-0 flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-[#cae6ff] flex items-center justify-center text-[#003652]">
                <Icon name="description" size={28} />
              </div>
              <span className="text-[#41474d] text-[12px] font-medium leading-4 tracking-[0.02em] bg-[#eceeef] px-2 py-1 rounded">
                {t("last30Days")}
              </span>
            </div>
            <div className="p-6 pt-0 flex-1 flex flex-col">
              <div className="space-y-1">
                <h3 className="text-[#41474d] text-[14px] font-semibold leading-5 tracking-[0.01em]">{t("totalArticles")}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#003652]">{articulosTotal ?? 0}</span>
                  <span className="text-[#003652] text-[12px] font-medium leading-4 tracking-[0.02em]">{t("published")}</span>
                </div>
              </div>
              {articulosRecientes && articulosRecientes.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-[#c1c7ce] pt-3">
                  {articulosRecientes.map((a) => (
                    <li key={a.slug} className="text-[12px] text-[#41474d] font-medium leading-4 tracking-[0.02em] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#003652]"></span>
                      <span className="notranslate">{a.titulo}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="pt-3 border-t border-[#c1c7ce] flex justify-between items-center mt-auto">
                <Link href="/admin/articulos" className="text-[#003652] text-[14px] font-semibold leading-5 tracking-[0.01em] flex items-center gap-1 hover:underline">
                  {t("manage")}
                  <Icon name="arrow_forward" size={16} />
                </Link>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-[#d8dadb]"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-[#e1e3e4]"></div>
                </div>
</div>
            </div>
          </div>

          {/* Total Teachings Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(26,77,109,0.08)] group hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-1 md:min-w-[320px]">
            <div className="p-6 pb-0 flex justify-between items-start">
              <div className="w-12 h-12 rounded-lg bg-[#d9e4e8] flex items-center justify-center text-[#003652]">
                <Icon name="smart_display" size={28} />
              </div>
              <div className="text-right">
                <h3 className="text-[#41474d] text-[14px] font-semibold leading-5 tracking-[0.01em]">{t("totalTeachings")}</h3>
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
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-white text-[10px] font-medium truncate notranslate">{ultimoVideo?.titulo || t("noTeachingsYet")}</p>
                  </div>
                </div>
              <div className="mt-4 pt-4 border-t border-[#c1c7ce] mt-auto">
                <Link href="/admin/teachings" className="text-[#003652] text-[14px] font-semibold leading-5 tracking-[0.01em] flex items-center gap-1 hover:underline">
                  {t("manage")}
                  <Icon name="arrow_forward" size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Members Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(26,77,109,0.08)] flex flex-col md:w-[340px]">
            <div className="p-6 pb-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#e1e3e4] flex items-center justify-center text-[#003652]">
                  <Icon name="groups" size={22} />
                </div>
                <h3 className="text-[#41474d] text-[14px] font-semibold leading-5 tracking-[0.01em]">Recent Members</h3>
              </div>
            </div>
            <div className="px-6 space-y-3 flex-1">
              {ultimosMiembros && ultimosMiembros.length > 0 ? (
                ultimosMiembros.map((s) => (
                  <div key={s.id} className="border-b border-[#c1c7ce]/50 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/admin/members/${s.id}`} className="text-[13px] font-medium text-[#003652] hover:underline truncate notranslate">
                        {nombreMap.get(s.usuario_id) || "Unknown"}
                      </Link>
                      <span className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[s.estado] || "bg-[#eceeef] text-[#41474d]"}`}>
                        {statusLabels[s.estado] || s.estado}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#41474d] mt-0.5 truncate">
                      {memberLabels[s.tipo_miembro ?? 0] || "Unknown"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[12px] text-[#41474d]">No members yet.</p>
              )}
            </div>
            <div className="px-6 pb-6 pt-3 border-t border-[#c1c7ce] flex justify-between items-center mt-auto">
              <Link href="/admin/members" className="text-[#003652] text-[14px] font-semibold leading-5 tracking-[0.01em] flex items-center gap-1 hover:underline">
                {t("manage")}
                <Icon name="arrow_forward" size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Overview / Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* System Activity */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(26,77,109,0.08)] flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-lg sm:text-[24px] font-semibold text-[#003652] leading-8 tracking-tight">{t("systemActivity")}</h2>
                <p className="text-[#41474d] text-[12px] font-medium leading-4 tracking-[0.02em]">{t("systemActivityDesc")}</p>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-medium text-[#41474d]">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-[#003652]">Y:</span> {t("visitors")}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-[#003652]">X:</span> {t("monthDay")}
                </div>
              </div>
            </div>
            <div className="relative w-full h-64 md:h-auto md:flex-1 md:min-h-0">
              {/* Y-axis reference lines */}
              <div className="absolute inset-0 flex flex-col-reverse justify-between pb-6">
                {[0, 250, 500, 750, 1000].map(n => (
                  <div key={n} className="flex items-center gap-2 w-full">
                    <span className="text-[10px] text-[#41474d] w-8 text-right shrink-0">{n}</span>
                    <div className="flex-1 border-t border-[#d9e4e8]/50"></div>
                  </div>
                ))}
              </div>
              {/* Bars */}
              <div className="relative h-full flex items-end justify-between gap-2 px-3 sm:px-8 pb-6">
                {barras.map((bar) => (
                <div key={bar.label} className="flex-1 flex flex-col justify-end gap-1 h-full group relative">
                  <span className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 bg-[#003652] text-white text-[11px] font-bold rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                    {bar.count}
                  </span>
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 group-hover:bg-[#003652] ${bar.isToday ? "bg-[#003652]" : "bg-[#003652]/20"}`}
                    style={{ height: `${bar.h}%` }}
                  ></div>
                  <span className={`text-[10px] text-center ${bar.isToday ? "font-bold text-[#003652] block" : "text-[#41474d] hidden sm:block"}`}>
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </div>

          {/* Activity History */}
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(26,77,109,0.08)] overflow-hidden flex flex-col min-h-0">
            <div className="p-6 border-b border-[#c1c7ce] flex justify-between items-center shrink-0">
              <h2 className="text-lg sm:text-[24px] font-semibold text-[#003652] leading-8 tracking-tight">{t("activityHistory")}</h2>
              <span className="text-[12px] font-medium text-[#41474d] bg-[#f2f4f5] px-2 py-1 rounded">
                {t("latest")}
              </span>
            </div>
            <div className="overflow-x-auto flex-1 min-h-0 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f2f4f5]">
                  <tr>
                    <th className="px-3 sm:px-6 py-4 text-[12px] sm:text-[14px] font-semibold text-[#41474d] uppercase tracking-wider leading-5">{t("action")}</th>
                    <th className="px-3 sm:px-6 py-4 text-[12px] sm:text-[14px] font-semibold text-[#41474d] uppercase tracking-wider leading-5">{t("user")}</th>
                    <th className="px-3 sm:px-6 py-4 text-[12px] sm:text-[14px] font-semibold text-[#41474d] uppercase tracking-wider leading-5">{t("date")}</th>
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
                          <span className="text-[12px] sm:text-[14px] text-[#1A1C1E] leading-5">{a.descripcion}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-[#41474d] text-[12px] sm:text-[14px] leading-5"><span className="notranslate">{a.usuario_nombre || "—"}</span></td>
                      <td className="px-3 sm:px-6 py-4 text-[#41474d] text-[14px] leading-5 whitespace-nowrap">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                    </tr>
                  ))}
                  {(!actividades || actividades.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-[#41474d] text-sm">
                        {t("noActivity")}
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
