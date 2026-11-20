"use client"

import { useMemo, useState, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  enviarCampana,
  enviarPrueba,
  guardarCampana,
  guardarIdioma,
  type EnvioResumen,
} from "@/app/admin/conferencia/actions"
import Icon from "@/components/Icon"
import TiptapEditor from "@/components/TiptapEditor"
import {
  CAMPANAS,
  componerCampana,
  type CampanaId,
  type Idioma,
  type Plantilla,
} from "@/lib/conferencia-plantilla"
import type {
  Ajustes,
  ArticuloBait,
  ConferenciaStats,
  EstadoMembresia,
  RegistroAdmin,
} from "@/lib/conferencia-admin"

/**
 * Panel de campañas de la conferencia («Bait» / «Carnada»).
 *
 * La lista es el cruce de los inscritos al evento con las cuentas del portal y
 * sus solicitudes de membresía. Abajo, el editor de las tres campañas.
 *
 * Lo importante sigue siendo que **nada se envía a ciegas**: hay que filtrar o
 * seleccionar, el botón dice a cuántos va a escribir, se puede mandar una
 * prueba al propio correo, y el idioma se decide destinatario por destinatario.
 */

/** Clave de i18n de cada estado de la conferencia; la etiqueta NO vive aquí. */
const ESTADOS: Record<string, { key: string; clase: string }> = {
  confirmado: { key: "statusConfirmed", clase: "bg-emerald-100 text-emerald-800" },
  nuevo: { key: "statusPending", clase: "bg-amber-100 text-amber-800" },
  cancelado: { key: "statusCancelled", clase: "bg-gray-200 text-gray-700" },
}

/** Perfiles almacenados (claves del CHECK) → clave de i18n. */
const PERFILES: Record<string, string> = {
  student: "profileStudent",
  licensed_health_professional: "profileLicensed",
  resident: "profileResident",
  non_professional: "profileOther",
  sin_dato: "profileUnknown",
}

/** Cruce con el portal → etiqueta y color. */
const MEMBRESIA: Record<EstadoMembresia, { key: string; clase: string }> = {
  miembro: { key: "membershipMember", clase: "bg-emerald-100 text-emerald-800" },
  miembro_otro_correo: {
    key: "membershipMemberOtherEmail",
    clase: "bg-indigo-100 text-indigo-800",
  },
  incompleta: { key: "membershipIncomplete", clase: "bg-amber-100 text-amber-800" },
  cuenta_sin_solicitud: {
    key: "membershipAccountNoApp",
    clase: "bg-sky-100 text-sky-800",
  },
  sin_cuenta: { key: "membershipNoAccount", clase: "bg-gray-100 text-gray-700" },
}

const CAMPANA_KEY: Record<CampanaId, string> = {
  membresia: "campaignMembership",
  newsletter: "campaignNewsletter",
  proxima: "campaignNext",
}

const CAMPANA_HINT: Record<CampanaId, string> = {
  membresia: "campaignMembershipHint",
  newsletter: "campaignNewsletterHint",
  proxima: "campaignNextHint",
}

const CAMPANA_ICON: Record<CampanaId, string> = {
  membresia: "person_add",
  newsletter: "mail",
  proxima: "calendar_today",
}

const CAMPANA_BADGE: Record<CampanaId, string> = {
  membresia: "M",
  newsletter: "N",
  proxima: "P",
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ikmaglobal.com"
const BASE_BLOG = "https://lh3.googleusercontent.com/aida-public/"

/** Un invitado es una fila que metió un administrador a mano, no una persona. */
const esInvitado = (r: { origen: string | null }) => r.origen === "alta-manual"

/** Normaliza para buscar: sin mayúsculas y sin tildes. */
const normalizar = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

const escaparHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))

const imagenAbsoluta = (url: string | null) =>
  !url ? "" : url.startsWith("http") ? url : `${BASE_BLOG}${url}`

function BotonFila({
  estado,
  onEnviar,
  etiqueta,
  enviando,
  hecho,
  title,
}: {
  estado?: string
  onEnviar: () => void
  etiqueta: string
  enviando: string
  hecho: string
  title?: string
}) {
  if (estado === "enviando") {
    return <span className="text-xs text-gray-500">{enviando}</span>
  }
  if (estado === "ok") {
    return <span className="text-xs font-semibold text-emerald-700">✓ {hecho}</span>
  }
  if (estado?.startsWith("error:")) {
    return (
      <span className="text-xs text-red-700" title={estado.slice(6)}>
        ✗ {estado.slice(6, 40)}
      </span>
    )
  }
  return (
    <button
      type="button"
      onClick={onEnviar}
      title={title}
      className="whitespace-nowrap rounded-full border border-ikmaBlue px-3 py-1 text-xs font-semibold text-ikmaBlue transition-colors hover:bg-ikmaBlue hover:text-white"
    >
      {etiqueta}
    </button>
  )
}

function Kpi({ valor, etiqueta, nota }: { valor: number | string; etiqueta: string; nota?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-3xl font-bold text-ikmaBlue">{valor}</p>
      <p className="mt-1 text-sm font-medium text-gray-700">{etiqueta}</p>
      {nota && <p className="mt-0.5 text-xs text-gray-500">{nota}</p>}
    </div>
  )
}

export default function ConferenciaPanel({
  registros,
  stats,
  ajustes,
  articulos,
  errores = [],
}: {
  registros: RegistroAdmin[]
  stats: ConferenciaStats
  ajustes: Ajustes
  articulos: ArticuloBait[]
  /** Errores de lectura del servidor, para no confundir "vacío" con "falló". */
  errores?: string[]
}) {
  const t = useTranslations("Admin.conferencia")
  const locale = useLocale()
  const idiomaInicial: Idioma = locale === "es" ? "es" : "en"

  /** Texto del buscador y filtros. */
  const [busqueda, setBusqueda] = useState("")
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [filtroMembresia, setFiltroMembresia] = useState("sin_solicitud")
  const [filtroPerfil, setFiltroPerfil] = useState("todos")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroIdioma, setFiltroIdioma] = useState("todos")
  const [filtroPais, setFiltroPais] = useState("todos")
  const [soloVerificados, setSoloVerificados] = useState(true)

  /**
   * Idioma editable por fila. Arranca con lo que venga del servidor; los
   * cambios se guardan al vuelo y se reflejan aquí sin esperar al refresh.
   */
  const [idiomas, setIdiomas] = useState<Record<string, Idioma>>(() =>
    Object.fromEntries(registros.map((r) => [r.id, r.idioma]))
  )
  const [idiomaBulk, setIdiomaBulk] = useState<Idioma>(idiomaInicial)
  const [guardandoIdioma, setGuardandoIdioma] = useState(false)
  const [avisoIdioma, setAvisoIdioma] = useState("")

  /** Campaña y borradores. Las tres viven a la vez para no perder lo editado. */
  const [plantilla, setPlantilla] = useState<CampanaId>("membresia")
  const [idiomaEdicion, setIdiomaEdicion] = useState<Idioma>(idiomaInicial)
  const [borradores, setBorradores] = useState<Ajustes["campanas"]>(ajustes.campanas)
  const [articuloSel, setArticuloSel] = useState("")

  const actual = borradores[plantilla][idiomaEdicion]

  function editar(campo: keyof Plantilla, valor: string) {
    setBorradores((prev) => ({
      ...prev,
      [plantilla]: {
        ...prev[plantilla],
        [idiomaEdicion]: { ...prev[plantilla][idiomaEdicion], [campo]: valor },
      },
    }))
  }

  const [destinoPrueba, setDestinoPrueba] = useState("")
  const [resultado, setResultado] = useState<EnvioResumen | null>(null)
  const [aviso, setAviso] = useState("")
  const [pendiente, start] = useTransition()
  const [filaEnvio, setFilaEnvio] = useState<Record<string, string>>({})
  const [lote, setLote] = useState<{ hechos: number; total: number } | null>(null)
  const [confirmarTodos, setConfirmarTodos] = useState(false)
  const [saltarEnviados, setSaltarEnviados] = useState(true)

  const paises = useMemo(() => {
    const mapa = new Map<string, number>()
    for (const r of registros) {
      if (!r.pais) continue
      mapa.set(r.pais, (mapa.get(r.pais) ?? 0) + 1)
    }
    return [...mapa.entries()].sort((a, b) => b[1] - a[1])
  }, [registros])

  const visibles = useMemo(() => {
    let lista = registros

    if (filtroMembresia === "sin_solicitud") {
      lista = lista.filter(
        (r) => r.estadoMembresia === "cuenta_sin_solicitud" || r.estadoMembresia === "sin_cuenta"
      )
    } else if (filtroMembresia === "miembro") {
      lista = lista.filter(
        (r) => r.estadoMembresia === "miembro" || r.estadoMembresia === "miembro_otro_correo"
      )
    } else if (filtroMembresia !== "todos") {
      lista = lista.filter((r) => r.estadoMembresia === filtroMembresia)
    }

    if (filtroPerfil !== "todos") {
      lista = lista.filter((r) => (r.perfil_profesional ?? "sin_dato") === filtroPerfil)
    }
    if (filtroEstado !== "todos") lista = lista.filter((r) => r.estado === filtroEstado)
    if (filtroIdioma !== "todos") lista = lista.filter((r) => (idiomas[r.id] ?? r.idioma) === filtroIdioma)
    if (filtroPais !== "todos") lista = lista.filter((r) => (r.pais ?? "") === filtroPais)
    if (soloVerificados) lista = lista.filter((r) => r.estado === "confirmado")

    const q = normalizar(busqueda.trim())
    if (!q) return lista
    return lista.filter(
      (r) => normalizar(r.nombre).includes(q) || normalizar(r.email).includes(q)
    )
  }, [
    registros,
    filtroMembresia,
    filtroPerfil,
    filtroEstado,
    filtroIdioma,
    filtroPais,
    soloVerificados,
    busqueda,
    idiomas,
  ])

  const seleccionados = useMemo(() => registros.filter((r) => sel.has(r.id)), [registros, sel])
  const seleccionadosConfirmados = seleccionados.filter((r) => r.estado === "confirmado")
  const noConfirmadosSeleccionados = seleccionados.length - seleccionadosConfirmados.length

  /** En membresía no se invita a quien ya es miembro ni a quien tiene una solicitud a medias. */
  const aplica = (r: RegistroAdmin) =>
    !(
      plantilla === "membresia" &&
      (r.estadoMembresia === "miembro" ||
        r.estadoMembresia === "miembro_otro_correo" ||
        r.estadoMembresia === "incompleta")
    )

  const seleccionadosEnviables = seleccionadosConfirmados.filter(aplica)
  const visiblesEnviables = visibles.filter((r) => r.estado === "confirmado" && aplica(r))
  const omitidosMembresia = seleccionadosConfirmados.filter((r) => !aplica(r)).length

  const resumenIdiomas = (lista: RegistroAdmin[]) => ({
    es: lista.filter((r) => (idiomas[r.id] ?? r.idioma) === "es").length,
    en: lista.filter((r) => (idiomas[r.id] ?? r.idioma) === "en").length,
  })
  const idiomasSeleccion = resumenIdiomas(seleccionadosEnviables)
  const idiomasVisibles = resumenIdiomas(visiblesEnviables)

  const faltaPlantilla = ![
    borradores[plantilla].es.asunto,
    borradores[plantilla].es.cuerpo,
    borradores[plantilla].en.asunto,
    borradores[plantilla].en.cuerpo,
  ].every((v) => v.trim())

  /**
   * Envía en tandas de 50. La acción del servidor tiene un tope por llamada;
   * el troceo se hace aquí y se acumula el resultado. Se detiene en seco si
   * Resend dice que no queda cuota.
   */
  async function enviarPorTandas(ids: string[], campana: CampanaId) {
    const TANDA = 50
    const total: EnvioResumen = {
      enviados: 0,
      fallidos: 0,
      omitidosNoConfirmados: 0,
      omitidosMiembros: 0,
      yaEnviados: 0,
      cortadoPorCuota: false,
      detalle: [],
    }
    const es = borradores[campana].es
    const en = borradores[campana].en

    setLote({ hechos: 0, total: ids.length })
    for (let i = 0; i < ids.length; i += TANDA) {
      const tanda = ids.slice(i, i + TANDA)
      const r = await enviarCampana(
        tanda,
        campana,
        es.asunto,
        es.cuerpo,
        en.asunto,
        en.cuerpo,
        saltarEnviados
      )
      total.enviados += r.enviados
      total.fallidos += r.fallidos
      total.omitidosNoConfirmados += r.omitidosNoConfirmados
      total.omitidosMiembros = (total.omitidosMiembros ?? 0) + (r.omitidosMiembros ?? 0)
      total.yaEnviados = (total.yaEnviados ?? 0) + (r.yaEnviados ?? 0)
      total.detalle.push(...r.detalle)
      setLote({ hechos: Math.min(i + TANDA, ids.length), total: ids.length })
      if (r.cortadoPorCuota) {
        total.cortadoPorCuota = true
        break
      }
      if (r.detalle.some((d) => !d.email && !d.ok)) break
    }
    setLote(null)
    setResultado(total)
  }

  /** Botón de una fila: manda la campaña activa a esa persona sola. */
  async function enviarUna(id: string) {
    setFilaEnvio((prev) => ({ ...prev, [id]: "enviando" }))
    const es = borradores[plantilla].es
    const en = borradores[plantilla].en
    const r = await enviarCampana(
      [id],
      plantilla,
      es.asunto,
      es.cuerpo,
      en.asunto,
      en.cuerpo
    )
    const error = r.detalle.find((d) => !d.ok)?.error
    setFilaEnvio((prev) => ({
      ...prev,
      [id]: r.enviados > 0 ? "ok" : `error:${error ?? "?"}`,
    }))
  }

  async function cambiarIdioma(id: string, idioma: Idioma) {
    const previo = idiomas[id]
    setIdiomas((p) => ({ ...p, [id]: idioma }))
    setAvisoIdioma("")
    const r = await guardarIdioma([id], idioma)
    if (!r.ok) {
      setIdiomas((p) => ({ ...p, [id]: previo ?? "en" }))
      setAvisoIdioma(t("idiomaSaveFailed", { error: r.error ?? "" }))
    }
  }

  async function cambiarIdiomaSeleccionados(idioma: Idioma) {
    const ids = [...sel]
    if (ids.length === 0) return
    setGuardandoIdioma(true)
    setAvisoIdioma("")
    const r = await guardarIdioma(ids, idioma)
    setGuardandoIdioma(false)
    if (r.ok) {
      setIdiomas((prev) => {
        const copia = { ...prev }
        for (const id of ids) copia[id] = idioma
        return copia
      })
      setAvisoIdioma(t("saved"))
    } else {
      setAvisoIdioma(t("idiomaSaveFailed", { error: r.error ?? "" }))
    }
  }

  function alternar(id: string) {
    setSel((prev) => {
      const copia = new Set(prev)
      if (copia.has(id)) copia.delete(id)
      else copia.add(id)
      return copia
    })
  }

  function alternarVisibles() {
    const todos = visibles.every((r) => sel.has(r.id))
    setSel((prev) => {
      const copia = new Set(prev)
      for (const r of visibles) {
        if (todos) copia.delete(r.id)
        else copia.add(r.id)
      }
      return copia
    })
  }

  function limpiarFiltros() {
    setBusqueda("")
    setFiltroMembresia("todos")
    setFiltroPerfil("todos")
    setFiltroEstado("todos")
    setFiltroIdioma("todos")
    setFiltroPais("todos")
    setSoloVerificados(false)
  }

  /** Sube una imagen del editor al storage y devuelve su URL pública. */
  async function subirImagen(file: File): Promise<string> {
    const resp = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, type: file.type }),
    })
    const { signedUrl, publicUrl } = await resp.json()
    if (signedUrl) {
      await fetch(signedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
    }
    return publicUrl
  }

  /** Inserta imagen + enlace de un artículo del blog al final del cuerpo. */
  function insertarArticulo() {
    const a = articulos.find((x) => x.slug === articuloSel)
    if (!a) return
    const titulo = idiomaEdicion === "es" ? a.titulo_es || a.titulo : a.titulo
    const img = imagenAbsoluta(a.imagen_url)
    const encabezado = idiomaEdicion === "es" ? "<h3>Para leer</h3>" : "<h3>Worth reading</h3>"
    const bloque = [
      encabezado,
      img
        ? `<p><img src="${img}" alt="${escaparHtml(titulo)}" style="max-width:100%;border-radius:12px" /></p>`
        : "",
      `<p><a href="${SITE}/blog/${a.slug}">${escaparHtml(titulo)}</a></p>`,
    ]
      .filter(Boolean)
      .join("\n")
    editar("cuerpo", `${actual.cuerpo}\n${bloque}`)
    setArticuloSel("")
  }

  /**
   * Vista previa del correo COMPLETO: usa la misma función que el envío, así
   * que lo que se ve aquí es literalmente lo que se manda.
   */
  const previewCompleto = useMemo(
    () =>
      componerCampana(
        plantilla,
        actual.cuerpo,
        { nombre: "María González", email: "maria@ejemplo.com" },
        idiomaEdicion
      ),
    [plantilla, actual.cuerpo, idiomaEdicion]
  )

  const etiquetaEstado = (estado: string) =>
    ESTADOS[estado] ? t(ESTADOS[estado].key) : estado

  const etiquetaPerfil = (perfil: string | null) =>
    perfil && PERFILES[perfil] ? t(PERFILES[perfil]) : t("profileUnknown")

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-ikmaBlue/10 p-3 text-ikmaBlue">
          <Icon name="fishing_hook" size={32} />
        </div>
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">{t("title")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("subtitle")}</p>
        </div>
      </div>

      {errores.length > 0 && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4">
          <p className="font-semibold text-red-800">{t("errTitle")}</p>
          <ul className="mt-1 list-inside list-disc text-sm text-red-700">
            {errores.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-red-700">{t("errNote")}</p>
        </div>
      )}

      {/* ---------------------------------------------------------- KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi valor={stats.total} etiqueta={t("kpiTotal")} nota={t("kpiTotalNote")} />
        <Kpi valor={stats.sinSolicitud} etiqueta={t("kpiNoMembers")} nota={t("kpiNoMembersNote")} />
        <Kpi
          valor={stats.miembros}
          etiqueta={t("kpiMembers")}
          nota={t("kpiMembersNote", {
            direct: stats.miembros - stats.miembrosOtroCorreo,
            other: stats.miembrosOtroCorreo,
          })}
        />
        <Kpi valor={stats.incompletas} etiqueta={t("kpiIncomplete")} nota={t("kpiIncompleteNote")} />
        <Kpi valor={stats.pendientes} etiqueta={t("kpiPending")} nota={t("kpiPendingNote")} />
      </div>

      {/* ------------------------------------------------- distribución */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">{t("byProfile")}</p>
          <div className="flex flex-wrap gap-2">
            {stats.porPerfil.length === 0 && <span className="text-sm text-gray-500">—</span>}
            {stats.porPerfil.map((p) => (
              <span key={p.perfil} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {etiquetaPerfil(p.perfil)} · {p.total}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">{t("byCountry")}</p>
          <div className="flex flex-wrap gap-2">
            {stats.porPais.length === 0 && <span className="text-sm text-gray-500">—</span>}
            {stats.porPais.slice(0, 10).map((p) => (
              <span key={p.pais} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {p.pais} · {p.total}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">{t("byLanguage")}</p>
          <div className="flex flex-wrap gap-2">
            {stats.porIdioma.map((p) => (
              <span key={p.idioma} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {p.idioma === "es" ? t("idiomaEs") : t("idiomaEn")} · {p.total}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- tabla */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-gray-800">
              {t("tableTitle")} <span className="text-gray-500">({visibles.length})</span>
            </p>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="w-full max-w-64 rounded-full border border-gray-300 px-4 py-1.5 text-sm sm:w-64"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <select
              value={filtroMembresia}
              onChange={(e) => setFiltroMembresia(e.target.value)}
              aria-label={t("colMembership")}
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5"
            >
              <option value="sin_solicitud">{t("filterNoMembers")}</option>
              <option value="todos">{t("filterAll")}</option>
              <option value="miembro">{t("filterMembers")}</option>
              <option value="miembro_otro_correo">{t("filterMemberOtherEmail")}</option>
              <option value="incompleta">{t("filterIncomplete")}</option>
              <option value="cuenta_sin_solicitud">{t("filterAccountNoApp")}</option>
              <option value="sin_cuenta">{t("filterNoAccount")}</option>
            </select>

            <select
              value={filtroPerfil}
              onChange={(e) => setFiltroPerfil(e.target.value)}
              aria-label={t("colProfile")}
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5"
            >
              <option value="todos">{t("filterAll")}</option>
              <option value="student">{t("profileStudent")}</option>
              <option value="licensed_health_professional">{t("profileLicensed")}</option>
              <option value="resident">{t("profileResident")}</option>
              <option value="non_professional">{t("profileOther")}</option>
              <option value="sin_dato">{t("profileUnknown")}</option>
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              aria-label={t("colStatus")}
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5"
            >
              <option value="todos">{t("filterAll")}</option>
              <option value="confirmado">{t("filterConfirmed")}</option>
              <option value="nuevo">{t("filterPending")}</option>
            </select>

            <select
              value={filtroIdioma}
              onChange={(e) => setFiltroIdioma(e.target.value)}
              aria-label={t("colIdioma")}
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5"
            >
              <option value="todos">{t("filterAll")}</option>
              <option value="es">{t("idiomaEs")}</option>
              <option value="en">{t("idiomaEn")}</option>
            </select>

            <select
              value={filtroPais}
              onChange={(e) => setFiltroPais(e.target.value)}
              aria-label={t("byCountry")}
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5"
            >
              <option value="todos">{t("filterAll")}</option>
              {paises.map(([pais, total]) => (
                <option key={pais} value={pais}>
                  {pais} ({total})
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700">
              <input
                type="checkbox"
                checked={soloVerificados}
                onChange={(e) => setSoloVerificados(e.target.checked)}
              />
              {t("onlyVerified")}
            </label>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="rounded-full border border-gray-300 px-3 py-1.5 text-gray-600 hover:bg-gray-50"
            >
              {t("clearFilters")}
            </button>
          </div>

          {sel.size > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-blue-50 px-3 py-2">
              <span className="text-sm font-medium text-blue-900">
                {t("bulkIdioma")}
              </span>
              <select
                value={idiomaBulk}
                onChange={(e) => {
                  const idioma = e.target.value as Idioma
                  setIdiomaBulk(idioma)
                  void cambiarIdiomaSeleccionados(idioma)
                }}
                disabled={guardandoIdioma}
                className="rounded-full border border-blue-300 bg-white px-3 py-1 text-sm disabled:opacity-50"
              >
                <option value="es">{t("idiomaEs")}</option>
                <option value="en">{t("idiomaEn")}</option>
              </select>
              <span className="text-xs text-blue-800">
                {t("selectedCount", { count: sel.size })}
              </span>
            </div>
          )}

          {avisoIdioma && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {avisoIdioma}
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="w-10 p-3">
                  <input
                    type="checkbox"
                    aria-label={t("selectAll")}
                    checked={visibles.length > 0 && visibles.every((r) => sel.has(r.id))}
                    onChange={alternarVisibles}
                  />
                </th>
                <th className="p-3">{t("colName")}</th>
                <th className="p-3">{t("colEmail")}</th>
                <th className="p-3">{t("colProfile")}</th>
                <th className="p-3">{t("colStatus")}</th>
                <th className="p-3">{t("colIdioma")}</th>
                <th className="p-3">{t("colMembership")}</th>
                <th className="p-3">{t("colCampaigns")}</th>
                <th className="p-3">{t("colAction")}</th>
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500">
                    {t("empty")}
                  </td>
                </tr>
              )}
              {visibles.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      aria-label={t("selectOne", { nombre: r.nombre })}
                      checked={sel.has(r.id)}
                      onChange={() => alternar(r.id)}
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-800">
                    {r.nombre}
                    {esInvitado(r) && (
                      <span className="ml-2 whitespace-nowrap rounded-full bg-purple-100 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-purple-800">
                        {t("guestBadge")}
                      </span>
                    )}
                  </td>
                  <td className="break-all p-3 text-gray-600">
                    {r.email}
                    {r.pais && <span className="ml-2 text-xs text-gray-400">{r.pais}</span>}
                  </td>
                  <td className="p-3 text-gray-600">{etiquetaPerfil(r.perfil_profesional)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        ESTADOS[r.estado]?.clase ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {etiquetaEstado(r.estado)}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={idiomas[r.id] ?? r.idioma}
                      onChange={(e) => void cambiarIdioma(r.id, e.target.value as Idioma)}
                      aria-label={t("colIdioma")}
                      className="rounded-md border border-gray-300 bg-white px-1.5 py-1 text-xs"
                    >
                      <option value="es">ES</option>
                      <option value="en">EN</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${MEMBRESIA[r.estadoMembresia].clase}`}>
                      {t(MEMBRESIA[r.estadoMembresia].key)}
                    </span>
                    {r.estadoMembresia === "miembro_otro_correo" && r.miembroEmail && (
                      <div className="mt-0.5 break-all text-[10px] text-gray-500">{r.miembroEmail}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {CAMPANAS.map((c) => (
                        <span
                          key={c}
                          title={`${t(CAMPANA_KEY[c])}: ${r.campanas[c] ? "✓" : "—"}`}
                          className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                            r.campanas[c]
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {CAMPANA_BADGE[c]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    {r.estado !== "confirmado" ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : !aplica(r) ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      <BotonFila
                        estado={filaEnvio[r.id]}
                        onEnviar={() => void enviarUna(r.id)}
                        etiqueta={t("sendOne")}
                        enviando={t("sending")}
                        hecho={t("sendOneDone")}
                        title={`${t("sendOne")} · ${t(CAMPANA_KEY[plantilla])}`}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------------------------------------------- campañas */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="font-semibold text-gray-800">{t("campaignTitle")}</p>
        <p className="mt-1 text-sm text-gray-600">{t("campaignDesc")}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {CAMPANAS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setPlantilla(id)
                setConfirmarTodos(false)
                setAviso("")
                setResultado(null)
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-colors ${
                plantilla === id
                  ? "bg-ikmaBlue text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Icon name={CAMPANA_ICON[id]} size={16} />
              {t(CAMPANA_KEY[id])}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">{t(CAMPANA_HINT[plantilla])}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t("editorLanguage")}:</span>
          {(["es", "en"] as const).map((idioma) => (
            <button
              key={idioma}
              type="button"
              onClick={() => setIdiomaEdicion(idioma)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                idiomaEdicion === idioma
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {idioma === "es" ? t("languageEs") : t("languageEn")}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t("subject")}</span>
              <input
                value={actual.asunto}
                onChange={(e) => editar("asunto", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <div>
              <span className="text-sm font-medium text-gray-700">{t("message")}</span>
              <p className="mb-1 text-xs text-gray-500">
                {t("markersHint")}{" "}
                <code className="rounded bg-gray-100 px-1">{"{{nombre}}"}</code>{" "}
                <code className="rounded bg-gray-100 px-1">{"{{email}}"}</code>
              </p>

              {plantilla === "newsletter" && (
                <div className="mb-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-700">{t("insertArticle")}</p>
                  <p className="mt-1 text-xs text-gray-500">{t("insertArticleHint")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <select
                      value={articuloSel}
                      onChange={(e) => setArticuloSel(e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">{t("articlePlaceholder")}</option>
                      {articulos.map((a) => (
                        <option key={a.slug} value={a.slug}>
                          {idiomaEdicion === "es" ? a.titulo_es || a.titulo : a.titulo}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={insertarArticulo}
                      disabled={!articuloSel}
                      className="rounded-full bg-gray-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {t("insertArticleButton")}
                    </button>
                  </div>
                </div>
              )}

              <TiptapEditor
                content={actual.cuerpo}
                onChange={(html) => editar("cuerpo", html)}
                onImageUpload={subirImagen}
              />
            </div>

            <label className="flex items-start gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={saltarEnviados}
                onChange={(e) => setSaltarEnviados(e.target.checked)}
                className="mt-0.5"
              />
              <span>{t("skipSentLabel")}</span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={pendiente || Boolean(lote) || faltaPlantilla || seleccionadosEnviables.length === 0}
                onClick={async () => {
                  setAviso("")
                  setResultado(null)
                  await enviarPorTandas(seleccionadosEnviables.map((r) => r.id), plantilla)
                }}
                className="rounded-full bg-ikmaBlue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {lote
                  ? t("sendingProgress", { done: lote.hechos, total: lote.total })
                  : t("sendSelected", { count: seleccionadosEnviables.length })}
              </button>

              {confirmarTodos ? (
                <span className="flex flex-wrap items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5">
                  <span className="text-sm font-semibold text-amber-900">
                    {t("sendConfirm", { count: visiblesEnviables.length })}
                  </span>
                  <button
                    type="button"
                    disabled={Boolean(lote) || faltaPlantilla}
                    onClick={async () => {
                      setConfirmarTodos(false)
                      setAviso("")
                      setResultado(null)
                      await enviarPorTandas(visiblesEnviables.map((r) => r.id), plantilla)
                    }}
                    className="rounded-full bg-amber-700 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {t("sendYes")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmarTodos(false)}
                    className="text-sm font-semibold text-amber-900 underline"
                  >
                    {t("sendNo")}
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  disabled={Boolean(lote) || faltaPlantilla || visiblesEnviables.length === 0}
                  onClick={() => setConfirmarTodos(true)}
                  className="rounded-full border border-ikmaBlue px-5 py-2.5 text-sm font-semibold text-ikmaBlue disabled:opacity-50"
                >
                  {t("sendFiltered", { count: visiblesEnviables.length })}
                </button>
              )}

              <button
                type="button"
                disabled={pendiente}
                onClick={() =>
                  start(async () => {
                    setAviso("")
                    setResultado(null)
                    const r = await enviarPrueba(
                      plantilla,
                      idiomaEdicion,
                      actual.asunto,
                      actual.cuerpo,
                      destinoPrueba.trim()
                    )
                    setAviso(
                      r.ok
                        ? t("testSent", { email: r.destino ?? "" })
                        : t("testFailed", { error: r.error ?? "" })
                    )
                  })
                }
                className="rounded-full border border-ikmaBlue px-5 py-2.5 text-sm font-semibold text-ikmaBlue disabled:opacity-50"
              >
                {t("sendTest")}
              </button>

              <button
                type="button"
                disabled={pendiente}
                onClick={() =>
                  start(async () => {
                    const r = await guardarCampana(plantilla, idiomaEdicion, actual.asunto, actual.cuerpo)
                    setAviso(r.ok ? t("saved") : t("saveFailed", { error: r.error ?? "" }))
                  })
                }
                className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50"
              >
                {t("saveTemplate")}
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <span className="whitespace-nowrap">{t("testTo")}</span>
              <input
                value={destinoPrueba}
                onChange={(e) => setDestinoPrueba(e.target.value)}
                placeholder={t("testToPlaceholder")}
                className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <p className="text-xs text-gray-500">
              {t("summarySelected", {
                count: seleccionadosEnviables.length,
                es: idiomasSeleccion.es,
                en: idiomasSeleccion.en,
              })}
            </p>
            <p className="text-xs text-gray-500">
              {t("summaryFiltered", {
                count: visiblesEnviables.length,
                es: idiomasVisibles.es,
                en: idiomasVisibles.en,
              })}
            </p>

            {faltaPlantilla && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {t("missingTemplate")}
              </p>
            )}

            {plantilla === "membresia" && omitidosMembresia > 0 && (
              <p className="text-sm text-amber-700">
                {t("omitMembers", { count: omitidosMembresia })}
              </p>
            )}

            {noConfirmadosSeleccionados > 0 && (
              <p className="text-sm text-amber-700">
                {t("omitWarning", { count: noConfirmadosSeleccionados })}
              </p>
            )}

            {aviso && <p className="text-sm text-gray-700">{aviso}</p>}

            {resultado && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm">
                <p className="font-medium text-gray-800">
                  {t("resultSent", { sent: resultado.enviados, failed: resultado.fallidos })}
                  {resultado.omitidosNoConfirmados > 0 &&
                    t("resultOmitted", { omitted: resultado.omitidosNoConfirmados })}
                  {(resultado.omitidosMiembros ?? 0) > 0 &&
                    t("resultMembers", { count: resultado.omitidosMiembros ?? 0 })}
                  {(resultado.yaEnviados ?? 0) > 0 &&
                    t("resultAlready", { count: resultado.yaEnviados ?? 0 })}
                </p>
                {resultado.cortadoPorCuota && (
                  <p className="mt-1 text-red-700">{t("quotaCut")}</p>
                )}
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                  {resultado.detalle.map((d, i) => (
                    <li key={i} className={d.ok ? "text-emerald-700" : "text-red-700"}>
                      {d.ok ? "✓" : "✗"} {d.email || t("noEmail")}
                      {d.error && ` — ${d.error}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">{t("previewTitle")}</p>
            <p className="mt-1 text-xs text-gray-500">{t("previewNote")}</p>
            <p className="mt-1 text-xs text-gray-500">
              {t("previewSubject", { subject: actual.asunto || t("noSubject") })}
            </p>
            <iframe
              title={t("previewFrame")}
              srcDoc={previewCompleto}
              className="mt-2 h-[460px] w-full rounded-lg border border-gray-300 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
