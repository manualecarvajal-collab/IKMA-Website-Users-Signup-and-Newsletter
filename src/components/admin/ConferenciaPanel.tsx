"use client"

import { useMemo, useState, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  enviarInvitacion,
  enviarPrueba,
  guardarAjustes,
  type EnvioResumen,
} from "@/app/admin/conferencia/actions"
import TiptapEditor from "@/components/TiptapEditor"
import { componerCorreo, type PlantillaId } from "@/lib/conferencia-plantilla"
import { ESTADOS_DIRECTO, type EstadoDirecto } from "@/components/conferencia/directo"
import type { Ajustes, ConferenciaStats, Plantilla, RegistroAdmin } from "@/lib/conferencia-admin"

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

/**
 * Aspecto de cada estado del directo en el panel.
 *
 * `Record<EstadoDirecto, ...>` a propósito: si algún día se añade un estado,
 * esto deja de compilar y no se queda un botón sin pintar.
 */
const ESTADO_UI: Record<EstadoDirecto, { etiqueta: string; clase: string }> = {
  antes: { etiqueta: "stateBefore", clase: "bg-gray-700 text-white" },
  vivo: { etiqueta: "stateLive", clase: "bg-red-600 text-white" },
  espera: { etiqueta: "stateWaiting", clase: "bg-amber-500 text-white" },
  final: { etiqueta: "stateEnded", clase: "bg-ikmaBlue text-white" },
}

/** Qué hace cada estado, para que el panel no deje adivinar. */
const ESTADO_HINT: Record<EstadoDirecto, string> = {
  antes: "stateHintBefore",
  vivo: "stateHintLive",
  espera: "stateHintWaiting",
  final: "stateHintEnded",
}

const FILTROS = ["todos", "confirmado", "nuevo", "cancelado"] as const
const ETIQUETA_FILTRO: Record<string, string> = {
  todos: "filterAll",
  confirmado: "statusConfirmed",
  nuevo: "statusPending",
  cancelado: "statusCancelled",
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

  const [directoEstado, setDirectoEstado] = useState(ajustes.directoEstado)
  // El enlace de Zoom ya no se edita desde aquí: la emisión va por el embed de
  // YouTube. Se sigue enviando al guardar para NO borrar el que hubiera — es el
  // que le da a los inscritos el botón para entrar a la reunión.
  const directoUrl = ajustes.directoUrl
  const [directoEmbed, setDirectoEmbed] = useState(ajustes.directoEmbed)
  const [resultado, setResultado] = useState<EnvioResumen | null>(null)
  const [aviso, setAviso] = useState<string>("")
  // El directo tiene su propio aviso: `aviso` se pinta dentro de la caja
  // del correo, así que reutilizarlo hacía que "Directo guardado" saliera
  // en la sección equivocada.
  const [avisoDirecto, setAvisoDirecto] = useState<string>("")
  const [pendiente, start] = useTransition()

  const visibles = useMemo(
    () => (filtro === "todos" ? registros : registros.filter((r) => r.estado === filtro)),
    [registros, filtro]
  )

  const seleccionados = useMemo(() => registros.filter((r) => sel.has(r.id)), [registros, sel])
  const confirmadosSeleccionados = seleccionados.filter((r) => r.estado === "confirmado").length
  const noConfirmadosSeleccionados = seleccionados.length - confirmadosSeleccionados

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
      componerCorreo(plantilla, cuerpo, { nombre: "María González", email: "maria@ejemplo.com" }),
    [plantilla, cuerpo]
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
        <Kpi valor={stats.conectados} etiqueta={t("kpiOnline")} nota={t("kpiOnlineNote")} />
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
        </div>

        <div className="overflow-x-auto">
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
                <th className="p-3">{t("colCountry")}</th>
                <th className="p-3">{t("colProfile")}</th>
                <th className="p-3">{t("colStatus")}</th>
                <th className="p-3">{t("colCreated")}</th>
                <th className="p-3">{t("colVerified")}</th>
                <th className="p-3">{t("colEmails")}</th>
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
                  <td className="p-3 font-medium text-gray-800">{r.nombre}</td>
                  <td className="p-3 text-gray-600">{r.email}</td>
                  <td className="p-3 text-gray-600">{r.pais ?? "—"}</td>
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
                  <td className="p-3 text-gray-500">{fecha(r.created_at)}</td>
                  <td className="p-3 text-gray-500">{fecha(r.verificado_at)}</td>
                  <td className="p-3 text-gray-500">{r.envios}</td>
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

        {/* Selector de plantilla. Las dos se guardan y se envían por separado;
            lo editado en una no se pierde al cambiar a la otra. */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t("templateLabel")}:</span>
          {(["invitacion", "recordatorio"] as PlantillaId[]).map((id) => (
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
              {t(id === "invitacion" ? "templateInvitation" : "templateReminder")}
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
                <code className="rounded bg-gray-100 px-1">{"{{email}}"}</code>
              </p>
              <TiptapEditor
                content={cuerpo}
                onChange={(html) => editar("cuerpo", html)}
                onImageUpload={subirImagen}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={pendiente}
                onClick={() =>
                  start(async () => {
                    setAviso("")
                    setResultado(null)
                    const ids = seleccionados.map((r) => r.id)
                    const res = await enviarInvitacion(ids, asunto, cuerpo, plantilla)
                    setResultado(res)
                  })
                }
                className="rounded-full bg-ikmaBlue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {pendiente
                  ? t("sending")
                  : t("sendTo", { count: confirmadosSeleccionados })}
              </button>

              <button
                type="button"
                disabled={pendiente}
                onClick={() =>
                  start(async () => {
                    setAviso("")
                    setResultado(null)
                    const r = await enviarPrueba(asunto, cuerpo, plantilla)
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
                    const r = await guardarAjustes({ plantillaId: plantilla, asunto, cuerpo })
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

      {/* -------------------------------------------------------- directo */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="font-semibold text-gray-800">{t("liveTitle")}</p>
        <p className="mt-1 text-sm text-gray-600">{t("liveDesc")}</p>

        {/* Control del directo. Cuatro estados y un clic cada uno: el día del
            evento se cambia de uno a otro con prisa, y un desplegable sería un
            paso de más. El color distingue el estado de un vistazo. */}
        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          <span className="text-sm font-medium text-gray-700">{t("liveStateLabel")}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {ESTADOS_DIRECTO.map((e) => (
              <button
                key={e}
                type="button"
                disabled={pendiente}
                // Se guarda al pulsar, sin botón de por medio. El estado del
                // directo se cambia EN DIRECTO, con el evento en marcha: un
                // cambio que se queda sin guardar porque nadie se acordó de
                // pulsar un botón es justo el fallo que no se puede permitir
                // ese día. Los enlaces sí llevan su botón: esos se configuran
                // con calma, antes.
                onClick={() =>
                  start(async () => {
                    setAvisoDirecto("")
                    const r = await guardarAjustes({ directoEstado: e })
                    // El botón solo se mueve si el servidor lo aceptó: pintarlo
                    // optimista dejaría el panel mintiendo sobre lo que se ve
                    // en la landing.
                    if (r.ok) setDirectoEstado(e)
                    setAvisoDirecto(
                      r.ok ? t("savedState") : t("saveFailed", { error: r.error ?? "" })
                    )
                  })
                }
                aria-pressed={directoEstado === e}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  directoEstado === e ? ESTADO_UI[e].clase : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t(ESTADO_UI[e].etiqueta)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">{t(ESTADO_HINT[directoEstado])}</p>
        </div>

        {avisoDirecto && <p className="mt-2 text-sm text-gray-700">{avisoDirecto}</p>}

        <div className="mt-4 grid gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t("embedLabel")}</span>
            <input
              value={directoEmbed}
              onChange={(e) => setDirectoEmbed(e.target.value)}
              placeholder="https://www.youtube.com/embed/…"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <button
          type="button"
          disabled={pendiente}
          onClick={() =>
            start(async () => {
              const r = await guardarAjustes({ directoUrl, directoEmbed })
              setAvisoDirecto(r.ok ? t("savedLive") : t("saveFailed", { error: r.error ?? "" }))
            })
          }
          className="mt-3 rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50"
        >
          {t("saveLive")}
        </button>

        <p className="mt-3 text-xs text-gray-500">{t("livePending")}</p>
      </div>
    </div>
  )
}
