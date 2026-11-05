"use client"

import { useMemo, useState, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  enviarInvitacion,
  enviarPrueba,
  enviarVerificacion,
  guardarAjustes,
  type EnvioResumen,
} from "@/app/admin/conferencia/actions"
import TiptapEditor from "@/components/TiptapEditor"
import {
  PLANTILLAS,
  componerCorreo,
  type Plantilla,
  type PlantillaId,
} from "@/lib/conferencia-plantilla"
import type { Ajustes, ConferenciaStats, RegistroAdmin } from "@/lib/conferencia-admin"

/**
 * Panel de la conferencia.
 *
 * Todo el texto sale de i18n (`Admin.conferencia`), como el resto del admin.
 *
 * Lo importante aquí es que **nada se envía a ciegas**: hay que seleccionar
 * destinatarios, el botón dice a cuántos va a escribir, y se puede mandar una
 * prueba al propio correo antes. La cuota de Resend es corta y un envío
 * masivo no se deshace.
 */

/** Clave de i18n de cada estado; la etiqueta NO vive aquí. */
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
}

/** Clave de i18n de la pestaña de cada plantilla. */
const ETIQUETA_PLANTILLA: Record<PlantillaId, string> = {
  confirmacion: "templateConfirmation",
  acceso: "templateAccess",
  verificacion: "templateVerification",
  recordatorio: "templateReminder",
  invitacion: "templateInvitation",
}

const FILTROS = ["todos", "confirmado", "nuevo", "cancelado"] as const
const ETIQUETA_FILTRO: Record<string, string> = {
  todos: "filterAll",
  confirmado: "statusConfirmed",
  nuevo: "statusPending",
  cancelado: "statusCancelled",
}

/**
 * Botón de envío de una fila, con su propio estado: "Enviar enlace" → "Enviando…"
 * → "Enviado" o el error. Va aparte para no arrastrar la tabla entera a un
 * rerender por cada fila que se toca.
 */
function BotonFila({
  estado,
  onEnviar,
  etiqueta,
  enviando,
  hecho,
}: {
  estado?: string
  onEnviar: () => void
  etiqueta: string
  enviando: string
  hecho: string
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
  errores = [],
}: {
  registros: RegistroAdmin[]
  stats: ConferenciaStats
  ajustes: Ajustes
  /** Errores de lectura del servidor, para no confundir "vacío" con "falló". */
  errores?: string[]
}) {
  const t = useTranslations("Admin.conferencia")
  const locale = useLocale()

  const [sel, setSel] = useState<Set<string>>(new Set())
  // Arranca en `confirmado`, no en `todos`. Un registro `nuevo` no está
  // verificado —pudo crearlo cualquiera con el correo de otra persona—, así que
  // la lista con la que se invita a la membresía y al newsletter empieza por
  // quien demostró que el buzón es suyo. El resto sigue a un clic de filtro.
  const [filtro, setFiltro] = useState<string>("confirmado")
  /**
   * Las dos plantillas viven en el estado a la vez. Si solo guardáramos la
   * activa, cambiar de pestaña perdería lo escrito en la otra.
   */
  const [plantilla, setPlantilla] = useState<PlantillaId>("invitacion")
  const [borradores, setBorradores] = useState<Record<PlantillaId, Plantilla>>(ajustes.plantillas)

  const asunto = borradores[plantilla].asunto
  const cuerpo = borradores[plantilla].cuerpo

  function editar(campo: keyof Plantilla, valor: string) {
    setBorradores((prev) => ({ ...prev, [plantilla]: { ...prev[plantilla], [campo]: valor } }))
  }

  /**
   * Enlace de Zoom de la reunión. Es el botón del correo de la víspera y el
   * `{{enlace}}` del cuerpo: se pega aquí el día 13, cuando quien organiza la
   * reunión lo comparte.
   */
  const [urlEnlace, setUrlEnlace] = useState(ajustes.urlEnlace)
  /** Destino de la prueba. Vacío = el correo del administrador con sesión. */
  const [destinoPrueba, setDestinoPrueba] = useState("")
  const [resultado, setResultado] = useState<EnvioResumen | null>(null)
  const [aviso, setAviso] = useState<string>("")
  const [pendiente, start] = useTransition()

  /**
   * Resultado del botón de cada fila, por id: "enviando", "ok" o el error.
   * Va por fila para que un envío no bloquee la tabla entera ni borre el
   * mensaje de la que acaba de fallar.
   */
  const [filaEnvio, setFilaEnvio] = useState<Record<string, string>>({})
  /** Progreso del envío masivo: `{ hechos, total }` mientras corre. */
  const [lote, setLote] = useState<{ hechos: number; total: number } | null>(null)
  /** El envío a todos pide confirmación: es irreversible y no tiene deshacer. */
  const [confirmarTodos, setConfirmarTodos] = useState(false)
  /** Resultado de los reenvíos de verificación, aparte del de las plantillas. */
  const [resultadoVerif, setResultadoVerif] = useState<EnvioResumen | null>(null)

  const visibles = useMemo(
    () => (filtro === "todos" ? registros : registros.filter((r) => r.estado === filtro)),
    [registros, filtro]
  )

  const seleccionados = useMemo(() => registros.filter((r) => sel.has(r.id)), [registros, sel])
  const confirmadosSeleccionados = seleccionados.filter((r) => r.estado === "confirmado").length
  const noConfirmadosSeleccionados = seleccionados.length - confirmadosSeleccionados

  /** Todo el mundo que ha confirmado el código, sin importar el filtro. */
  const confirmados = useMemo(() => registros.filter((r) => r.estado === "confirmado"), [registros])
  /** Confirmados que todavía no han recibido NINGÚN correo. */
  const sinCorreos = confirmados.filter((r) => r.envios === 0).length
  /** Se inscribieron y no llegaron a meter el código. */
  const sinVerificar = useMemo(() => registros.filter((r) => r.estado === "nuevo"), [registros])
  const faltaEnlace = plantilla === "recordatorio" && !urlEnlace.trim()

  /**
   * Envía en tandas de 50.
   *
   * La acción del servidor tiene un tope por llamada (una tanda de 300 correos
   * en una sola petición se pasaría del tiempo máximo de la función), así que
   * el troceo se hace aquí y se acumula el resultado. Se detiene en seco si
   * Resend dice que no queda cuota: seguir solo gasta tiempo y llena el registro
   * de fallos idénticos.
   */
  async function enviarPorTandas(ids: string[], plantillaEnvio: PlantillaId) {
    const TANDA = 50
    const total = { enviados: 0, fallidos: 0, omitidosNoConfirmados: 0, cortadoPorCuota: false, detalle: [] as EnvioResumen["detalle"] }
    setLote({ hechos: 0, total: ids.length })
    for (let i = 0; i < ids.length; i += TANDA) {
      const tanda = ids.slice(i, i + TANDA)
      const borrador = borradores[plantillaEnvio]
      const r = await enviarInvitacion(tanda, borrador.asunto, borrador.cuerpo, plantillaEnvio, urlEnlace)
      total.enviados += r.enviados
      total.fallidos += r.fallidos
      total.omitidosNoConfirmados += r.omitidosNoConfirmados
      total.detalle.push(...r.detalle)
      setLote({ hechos: Math.min(i + TANDA, ids.length), total: ids.length })
      if (r.cortadoPorCuota) {
        total.cortadoPorCuota = true
        break
      }
      // Un error global (sin destinatario) significa que no tiene sentido seguir:
      // falta el enlace o la plantilla está vacía.
      if (r.detalle.some((d) => !d.email && !d.ok)) break
    }
    setLote(null)
    setResultado(total)
  }

  /**
   * Reenvía la verificación a quien no terminó. No manda «un recordatorio»: emite
   * un código NUEVO (el anterior caduca a los 15 minutos), por eso se trocea y se
   * respeta el mismo tope por llamada que el resto.
   */
  async function reenviarVerificacion(ids: string[]) {
    const TANDA = 50
    const total = { enviados: 0, fallidos: 0, omitidosNoConfirmados: 0, cortadoPorCuota: false, detalle: [] as EnvioResumen["detalle"] }
    setLote({ hechos: 0, total: ids.length })
    for (let i = 0; i < ids.length; i += TANDA) {
      const r = await enviarVerificacion(ids.slice(i, i + TANDA))
      total.enviados += r.enviados
      total.fallidos += r.fallidos
      total.omitidosNoConfirmados += r.omitidosNoConfirmados
      total.detalle.push(...r.detalle)
      setLote({ hechos: Math.min(i + TANDA, ids.length), total: ids.length })
      if (r.cortadoPorCuota) {
        total.cortadoPorCuota = true
        break
      }
    }
    setLote(null)
    setResultadoVerif(total)
  }

  /** Botón de una fila sin verificar. */
  async function reenviarVerificacionUna(id: string) {
    setFilaEnvio((prev) => ({ ...prev, [id]: "enviando" }))
    const r = await enviarVerificacion([id])
    const error = r.detalle.find((d) => !d.ok)?.error
    setFilaEnvio((prev) => ({ ...prev, [id]: r.enviados > 0 ? "ok" : `error:${error ?? "?"}` }))
  }

  /** Botón de una fila: manda la plantilla del enlace a esa persona sola. */
  async function enviarUna(id: string) {
    setFilaEnvio((prev) => ({ ...prev, [id]: "enviando" }))
    const borrador = borradores.recordatorio
    const r = await enviarInvitacion([id], borrador.asunto, borrador.cuerpo, "recordatorio", urlEnlace)
    const error = r.detalle.find((d) => !d.ok)?.error
    setFilaEnvio((prev) => ({
      ...prev,
      [id]: r.enviados > 0 ? "ok" : `error:${error ?? "?"}`,
    }))
  }

  const etiquetaEstado = (estado: string) =>
    ESTADOS[estado] ? t(ESTADOS[estado].key) : estado

  const etiquetaPerfil = (perfil: string | null) =>
    perfil ? (PERFILES[perfil] ? t(PERFILES[perfil]) : perfil) : "—"

  const fecha = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" }) : "—"

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

  /**
   * Vista previa del correo COMPLETO, no solo del cuerpo: usa la misma función
   * que el envío, así que lo que se ve aquí es literalmente lo que se manda.
   */
  const previewCompleto = useMemo(
    () =>
      componerCorreo(plantilla, cuerpo, {
        nombre: "María González",
        email: "maria@ejemplo.com",
        enlace: urlEnlace,
        // En la vista previa el enlace de acceso es de mentira: el real lo
        // genera el servidor para cada persona al enviar.
        acceso: plantilla === "acceso" ? "https://www.ikmaglobal.com/conferencia/acceso/validar?t=muestra" : undefined,
      }),
    [plantilla, cuerpo, urlEnlace]
  )

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">{t("title")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{t("subtitle")}</p>
      </div>

      {/* Si el servidor no pudo leer algo, hay que decirlo: un panel vacío y
          un panel que falló se parecen demasiado. */}
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
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi
          valor={stats.total}
          etiqueta={t("kpiRegistered")}
          nota={t("kpiRegisteredNote")}
        />
        <Kpi
          valor={stats.confirmados}
          etiqueta={t("kpiConfirmed")}
          nota={t("kpiConfirmedNote")}
        />
        <Kpi valor={stats.pendientes} etiqueta={t("kpiPending")} nota={t("kpiPendingNote")} />
      </div>

      {(stats.porPais.length > 0 || stats.porPerfil.length > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-gray-700">{t("byCountry")}</p>
            <div className="flex flex-wrap gap-2">
              {stats.porPais.length === 0 && <span className="text-sm text-gray-500">—</span>}
              {stats.porPais.map((p) => (
                <span
                  key={p.pais}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                >
                  {p.pais} · {p.total}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-gray-700">{t("byProfile")}</p>
            <div className="flex flex-wrap gap-2">
              {stats.porPerfil.length === 0 && <span className="text-sm text-gray-500">—</span>}
              {stats.porPerfil.map((p) => (
                <span
                  key={p.perfil}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                >
                  {etiquetaPerfil(p.perfil)} · {p.total}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- tabla */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
          <p className="font-semibold text-gray-800">
            {t("tableTitle")} <span className="text-gray-500">({visibles.length})</span>
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            {FILTROS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                className={`rounded-full px-3 py-1 transition-colors ${
                  filtro === f
                    ? "bg-ikmaBlue text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t(ETIQUETA_FILTRO[f])}
              </button>
            ))}
          </div>

          {/* Reenvío de la verificación: solo aparece si hay alguien a medias,
              porque es el único caso en el que sirve. */}
          {sinVerificar.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 px-3 py-2">
              <span className="text-sm font-medium text-amber-900">
                {t("verifyPending", { count: sinVerificar.length })}
              </span>
              <button
                type="button"
                disabled={Boolean(lote)}
                onClick={() => reenviarVerificacion(sinVerificar.map((r) => r.id))}
                className="rounded-full bg-amber-700 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {lote
                  ? t("sendingProgress", { done: lote.hechos, total: lote.total })
                  : t("sendVerifyAll", { count: sinVerificar.length })}
              </button>
            </div>
          )}

          {resultadoVerif && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
              <p className="font-medium text-gray-800">
                {t("verifyResult", { sent: resultadoVerif.enviados, failed: resultadoVerif.fallidos })}
              </p>
              {resultadoVerif.cortadoPorCuota && <p className="mt-1 text-red-700">{t("quotaCut")}</p>}
              <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                {resultadoVerif.detalle.map((d, i) => (
                  <li key={i} className={d.ok ? "text-emerald-700" : "text-red-700"}>
                    {d.ok ? "✓" : "✗"} {d.email || t("noEmail")}
                    {d.error && ` — ${d.error}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- móvil
            En un teléfono la tabla no cabe —necesita 1.086 px— y el botón de
            enviar quedaba cortado en el borde. Aquí cada registro es una ficha
            con lo imprescindible y el botón entero. */}
        <div className="md:hidden">
          <label className="mb-1 flex items-center gap-2 border-b border-gray-200 pb-2 text-xs uppercase tracking-wide text-gray-500">
            <input
              type="checkbox"
              aria-label={t("selectAll")}
              checked={visibles.length > 0 && visibles.every((r) => sel.has(r.id))}
              onChange={alternarVisibles}
            />
            {t("selectAll")}
          </label>
          {visibles.length === 0 && (
            <p className="py-6 text-center text-gray-500">{t("empty")}</p>
          )}
          <div className="divide-y divide-gray-100">
            {visibles.map((r) => (
              <div key={r.id} className="flex items-start gap-3 py-3">
                <input
                  type="checkbox"
                  aria-label={t("selectOne", { nombre: r.nombre })}
                  checked={sel.has(r.id)}
                  onChange={() => alternar(r.id)}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800">{r.nombre}</p>
                  <p className="break-all text-xs text-gray-600">{r.email}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        ESTADOS[r.estado]?.clase ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {etiquetaEstado(r.estado)}
                    </span>
                    {r.pais && <span>{r.pais}</span>}
                    <span>
                      {r.envios} · {t("colEmails")}
                    </span>
                  </div>
                  {r.estado === "confirmado" && (
                    <div className="mt-2">
                      <BotonFila
                        estado={filaEnvio[r.id]}
                        onEnviar={() => enviarUna(r.id)}
                        etiqueta={t("sendLink")}
                        enviando={t("sending")}
                        hecho={t("sendLinkDone")}
                      />
                    </div>
                  )}
                  {r.estado === "nuevo" && (
                    <div className="mt-2">
                      <BotonFila
                        estado={filaEnvio[r.id]}
                        onEnviar={() => reenviarVerificacionUna(r.id)}
                        etiqueta={t("sendVerify")}
                        enviando={t("sending")}
                        hecho={t("sendLinkDone")}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -------------------------------------------------- escritorio */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
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
                <th className="hidden p-3 xl:table-cell">{t("colCountry")}</th>
                <th className="hidden p-3 xl:table-cell">{t("colProfile")}</th>
                <th className="p-3">{t("colStatus")}</th>
                <th className="hidden p-3 xl:table-cell">{t("colCreated")}</th>
                <th className="hidden p-3 xl:table-cell">{t("colVerified")}</th>
                <th className="p-3">{t("colEmails")}</th>
                <th className="sticky right-0 z-10 border-l border-gray-200 bg-gray-50 p-3 shadow-[-8px_0_10px_-8px_rgba(0,0,0,0.18)]">
                  {t("colSendLink")}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-gray-500">
                    {t("empty")}
                  </td>
                </tr>
              )}
              {visibles.map((r) => (
                <tr key={r.id} className="group border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      aria-label={t("selectOne", { nombre: r.nombre })}
                      checked={sel.has(r.id)}
                      onChange={() => alternar(r.id)}
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-800">{r.nombre}</td>
                  <td className="break-all p-3 text-gray-600">{r.email}</td>
                  <td className="hidden p-3 text-gray-600 xl:table-cell">{r.pais ?? "—"}</td>
                  <td className="hidden p-3 text-gray-600 xl:table-cell">{etiquetaPerfil(r.perfil_profesional)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        ESTADOS[r.estado]?.clase ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {etiquetaEstado(r.estado)}
                    </span>
                  </td>
                  <td className="hidden p-3 text-gray-500 xl:table-cell">{fecha(r.created_at)}</td>
                  <td className="hidden p-3 text-gray-500 xl:table-cell">{fecha(r.verificado_at)}</td>
                  <td className="p-3 text-gray-500">{r.envios}</td>
                  <td className="sticky right-0 z-10 border-l border-gray-200 bg-white p-3 group-hover:bg-gray-50">
                    {/* Envío individual: solo tiene sentido para quien confirmó
                        el código. Un registro `nuevo` no ha demostrado que el
                        buzón sea suyo, y mandarle correo sería escribir a un
                        tercero. */}
                    {r.estado === "confirmado" ? (
                      <BotonFila
                        estado={filaEnvio[r.id]}
                        onEnviar={() => enviarUna(r.id)}
                        etiqueta={t("sendLink")}
                        enviando={t("sending")}
                        hecho={t("sendLinkDone")}
                      />
                    ) : r.estado === "nuevo" ? (
                      <BotonFila
                        estado={filaEnvio[r.id]}
                        onEnviar={() => reenviarVerificacionUna(r.id)}
                        etiqueta={t("sendVerify")}
                        enviando={t("sending")}
                        hecho={t("sendLinkDone")}
                      />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------------------------------------------- correo */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="font-semibold text-gray-800">{t("emailTitle")}</p>
        <p className="mt-1 text-sm text-gray-600">{t("emailDesc")}</p>

        {/* Selector de plantilla. Las tres se guardan y se envían por separado;
            lo editado en una no se pierde al cambiar a la otra. */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t("templateLabel")}:</span>
          {PLANTILLAS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setPlantilla(id)
                setAviso("")
                setResultado(null)
              }}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                plantilla === id
                  ? "bg-ikmaBlue text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t(ETIQUETA_PLANTILLA[id])}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t("subject")}</span>
              <input
                value={asunto}
                onChange={(e) => editar("asunto", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <div>
              <span className="text-sm font-medium text-gray-700">{t("message")}</span>
              <p className="mb-1 text-xs text-gray-500">
                {t("markersHint")}{" "}
                <code className="rounded bg-gray-100 px-1">{"{{nombre}}"}</code>{" "}
                <code className="rounded bg-gray-100 px-1">{"{{email}}"}</code>{" "}
                <code className="rounded bg-gray-100 px-1">{"{{enlace}}"}</code>{" "}
                <code className="rounded bg-gray-100 px-1">{"{{codigo}}"}</code>{" "}
                <code className="rounded bg-gray-100 px-1">{"{{minutos}}"}</code>
              </p>
              {plantilla === "verificacion" && (
                <p className="mb-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-900">
                  {t("verifyHint")}
                </p>
              )}
              {plantilla === "acceso" && (
                <p className="mb-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-900">
                  {t("accesoHint")}
                </p>
              )}
              <TiptapEditor
                content={cuerpo}
                onChange={(html) => editar("cuerpo", html)}
                onImageUpload={subirImagen}
              />
            </div>

            {/* Solo la plantilla de la víspera lleva enlace de reunión. */}
            {plantilla === "recordatorio" && (
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{t("zoomLinkLabel")}</span>
                <input
                  value={urlEnlace}
                  onChange={(e) => setUrlEnlace(e.target.value)}
                  placeholder="https://zoom.us/j/1234567890?pwd=…"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-xs text-gray-500">{t("zoomLinkHint")}</span>
                {!urlEnlace.trim() && (
                  <span className="mt-1 block rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                    {t("linkMissing")}
                  </span>
                )}
              </label>
            )}

            {sinCorreos > 0 && (
              <p className="text-xs text-gray-500">
                {t("pendingEmails", { count: sinCorreos, total: confirmados.length })}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {/* 1 · a los seleccionados (marcados en la tabla) */}
              <button
                type="button"
                disabled={pendiente || Boolean(lote) || faltaEnlace || confirmadosSeleccionados === 0}
                onClick={async () => {
                  setAviso("")
                  setResultado(null)
                  await enviarPorTandas(
                    seleccionados.filter((r) => r.estado === "confirmado").map((r) => r.id),
                    plantilla
                  )
                }}
                className="rounded-full bg-ikmaBlue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {lote ? t("sendingProgress", { done: lote.hechos, total: lote.total }) : t("sendTo", { count: confirmadosSeleccionados })}
              </button>

              {/* 2 · a TODOS los confirmados, con confirmación de por medio:
                  esto no se puede deshacer. */}
              {confirmarTodos ? (
                <span className="flex flex-wrap items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5">
                  <span className="text-sm font-semibold text-amber-900">
                    {t("sendAllConfirm", { count: confirmados.length })}
                  </span>
                  <button
                    type="button"
                    disabled={Boolean(lote) || faltaEnlace}
                    onClick={async () => {
                      setConfirmarTodos(false)
                      setAviso("")
                      setResultado(null)
                      await enviarPorTandas(confirmados.map((r) => r.id), plantilla)
                    }}
                    className="rounded-full bg-amber-700 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {t("sendAllYes")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmarTodos(false)}
                    className="text-sm font-semibold text-amber-900 underline"
                  >
                    {t("sendAllNo")}
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  disabled={Boolean(lote) || faltaEnlace || confirmados.length === 0}
                  onClick={() => setConfirmarTodos(true)}
                  className="rounded-full border border-ikmaBlue px-5 py-2.5 text-sm font-semibold text-ikmaBlue disabled:opacity-50"
                >
                  {t("sendAll", { count: confirmados.length })}
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
                      asunto,
                      cuerpo,
                      plantilla,
                      destinoPrueba.trim(),
                      urlEnlace
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

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <span className="whitespace-nowrap">{t("testTo")}</span>
                <input
                  value={destinoPrueba}
                  onChange={(e) => setDestinoPrueba(e.target.value)}
                  placeholder={t("testToPlaceholder")}
                  className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <button
                type="button"
                disabled={pendiente}
                onClick={() =>
                  start(async () => {
                    const r = await guardarAjustes({ plantillaId: plantilla, asunto, cuerpo, urlEnlace })
                    setAviso(r.ok ? t("saved") : t("saveFailed", { error: r.error ?? "" }))
                  })
                }
                className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50"
              >
                {t("saveTemplate")}
              </button>
            </div>

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
              {t("previewSubject", { subject: asunto || t("noSubject") })}
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
