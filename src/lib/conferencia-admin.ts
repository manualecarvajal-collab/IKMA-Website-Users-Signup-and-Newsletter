import { createAdminClient } from "@/lib/supabase/server"
import { listAllAuthUsers } from "@/lib/supabase/auth-users"
import { claveNombre, idiomaPorPais } from "@/lib/conferencia"
import {
  CAMPANAS,
  CAMPANAS_POR_DEFECTO,
  IDIOMAS,
  PLANTILLAS_SISTEMA,
  SISTEMA_POR_DEFECTO,
  type CampanaId,
  type Idioma,
  type Plantilla,
  type PlantillaSistemaId,
} from "@/lib/conferencia-plantilla"

/**
 * Consultas del panel de campañas (`/admin/conferencia`).
 *
 * Módulo de servidor: usa el cliente admin (service_role), que ignora RLS.
 * Regla de oro (conferencia.md): toda query al schema `conferencia` DEBE
 * llevar `.schema("conferencia")`.
 */

type Admin = Awaited<ReturnType<typeof createAdminClient>>

export type EstadoMembresia =
  | "miembro"
  | "miembro_otro_correo"
  | "incompleta"
  | "cuenta_sin_solicitud"
  | "sin_cuenta"

export interface RegistroAdmin {
  id: string
  nombre: string
  email: string
  pais: string | null
  perfil_profesional: string | null
  estado: string
  created_at: string
  verificado_at: string | null
  /** Idioma del correo. Si la columna aún no existe, se deduce por país. */
  idioma: Idioma
  /** Cruce con el portal oficial. */
  estadoMembresia: EstadoMembresia
  /** Correo de la cuenta de miembro cuando el cruce fue por nombre. */
  miembroEmail: string | null
  /** Campañas que ya recibió, para no repetir a ciegas. */
  campanas: Record<CampanaId, boolean>
  /** Correos enviados con éxito (todas las tablas de `envios`). */
  envios: number
  /** De dónde salió la fila: `web` o `alta-manual`. */
  origen: string | null
}

export interface ConferenciaStats {
  total: number
  confirmados: number
  pendientes: number
  miembros: number
  /** Miembros cuya cuenta usa otro correo (inscripción duplicada). */
  miembrosOtroCorreo: number
  incompletas: number
  sinSolicitud: number
  sinCuenta: number
  cuentaSinSolicitud: number
  porPais: { pais: string; total: number }[]
  porPerfil: { perfil: string; total: number }[]
  porIdioma: { idioma: Idioma; total: number }[]
}

export interface Ajustes {
  campanas: Record<CampanaId, Record<Idioma, Plantilla>>
}

export interface ArticuloBait {
  slug: string
  titulo: string
  titulo_es: string | null
  resumen: string | null
  resumen_es: string | null
  imagen_url: string | null
}

/**
 * Resultado con error explícito.
 *
 * Antes estas funciones devolvían una lista vacía al fallar, y eso es
 * peligroso: "no hay inscritos" y "no pude leer los inscritos" se veían
 * exactamente igual en el panel.
 */
export interface Resultado<T> {
  data: T
  error?: string
}

/** Traduce los errores de PostgREST a algo accionable. */
function describeError(code: string | undefined, message: string): string {
  if (code === "PGRST205" || code === "PGRST200") {
    return `Falta una tabla del schema conferencia (${message}). ¿Está aplicada la migración 00056?`
  }
  if (code === "42703" || code === "PGRST204") {
    return `Falta una columna del schema conferencia (${message}). ¿Está aplicada la migración 00061?`
  }
  return `${message}${code ? ` (${code})` : ""}`
}

async function leerAjustes(admin: Admin): Promise<Resultado<Record<string, string>>> {
  const { data, error } = await admin.schema("conferencia").from("ajustes").select("clave, valor")

  if (error) {
    console.error("[leerAjustes]", error.message, error.code)
    return { data: {}, error: describeError(error.code, error.message) }
  }

  const mapa: Record<string, string> = {}
  for (const row of data ?? []) mapa[row.clave] = row.valor ?? ""
  return { data: mapa }
}

/**
 * Cruza los inscritos con las cuentas del portal y sus solicitudes.
 *
 * `registros` se lee con `select("*")` a propósito: si la migración 00061
 * todavía no está aplicada, la columna `idioma` no existe y un `select` con
 * columnas explícitas tumbaría el panel entero. Leyendo todo, el panel sigue
 * funcionando y deduce el idioma por país hasta que se aplique la migración.
 */
export async function getRegistros(admin: Admin): Promise<Resultado<RegistroAdmin[]>> {
  const [{ data, error }, authUsers, solicitudesRes, perfilesRes] = await Promise.all([
    admin.schema("conferencia").from("registros").select("*").order("created_at", { ascending: false }),
    listAllAuthUsers(admin),
    // shortcut: PostgREST corta en 1000 filas; hoy hay 26 solicitudes.
    admin.from("solicitudes_membresia").select("usuario_id, estado").limit(1000),
    // Los nombres de los miembros son la segunda llave del cruce: la
    // conferencia tiene inscripciones duplicadas con otro correo.
    admin.from("perfiles").select("id, nombre_completo").limit(1000),
  ])

  if (error) {
    console.error("[getRegistros]", error.message, error.code)
    return { data: [], error: describeError(error.code, error.message) }
  }

  // `envios` se consulta aparte para poder sobrevivir a la migración pendiente:
  // si `plantilla` no existe, se reintenta sin ella.
  // shortcut: PostgREST corta en 1000 filas; hoy hay menos de 300. Si el
  // historial crece, paginar o filtrar por fecha antes de leer.
  let envios: { registro_id: string; plantilla: string | null; ok: boolean }[] = []
  const { data: enviosData, error: enviosError } = await admin
    .schema("conferencia")
    .from("envios")
    .select("registro_id, plantilla, ok")
    .limit(1000)

  if (enviosError) {
    const { data: sinPlantilla } = await admin
      .schema("conferencia")
      .from("envios")
      .select("registro_id, ok")
      .limit(1000)
    envios = (sinPlantilla ?? []).map((e) => ({ ...e, plantilla: null }))
  } else {
    envios = enviosData ?? []
  }

  const usuarioPorEmail = new Map(
    authUsers
      .filter((u) => u.email)
      .map((u) => [u.email!.toLowerCase(), u])
  )

  const solicitudPorUsuario = new Map<string, string>()
  for (const s of solicitudesRes.data ?? []) {
    const previa = solicitudPorUsuario.get(s.usuario_id)
    // Si hay varias, manda la aprobada.
    if (!previa || s.estado === "aprobada") solicitudPorUsuario.set(s.usuario_id, s.estado)
  }

  // Segunda llave: nombre exacto del miembro aprobado. La conferencia tiene
  // inscripciones duplicadas con otro correo (Amanda, Sachiko, Haily/Hainy), y
  // el cruce solo por email las dejaba pasar como no miembros.
  const perfilPorId = new Map((perfilesRes.data ?? []).map((p) => [p.id, p.nombre_completo]))
  const miembroPorNombre = new Map<string, string>()
  for (const u of authUsers) {
    if (!u.email || solicitudPorUsuario.get(u.id) !== "aprobada") continue
    const meta = u.user_metadata as Record<string, unknown> | undefined
    const nombre =
      perfilPorId.get(u.id) ||
      (meta?.nombre_completo as string) ||
      (meta?.full_name as string) ||
      (meta?.name as string) ||
      ""
    const clave = claveNombre(nombre)
    if (clave) miembroPorNombre.set(clave, u.email.trim().toLowerCase())
  }

  const enviosPorRegistro = new Map<string, { plantilla: string | null; ok: boolean }[]>()
  for (const e of envios) {
    const lista = enviosPorRegistro.get(e.registro_id) ?? []
    lista.push(e)
    enviosPorRegistro.set(e.registro_id, lista)
  }

  return {
    data: (data ?? []).map((r) => {
      const email = (r.email ?? "").trim().toLowerCase()
      const usuario = usuarioPorEmail.get(email)
      let estadoMembresia: EstadoMembresia = "sin_cuenta"
      let miembroEmail: string | null = null

      if (usuario && solicitudPorUsuario.get(usuario.id) === "aprobada") {
        estadoMembresia = "miembro"
      } else {
        const clave = claveNombre(r.nombre)
        const miembro = clave ? miembroPorNombre.get(clave) : undefined
        if (miembro) {
          estadoMembresia = "miembro_otro_correo"
          miembroEmail = miembro
        } else if (usuario) {
          estadoMembresia = solicitudPorUsuario.get(usuario.id)
            ? "incompleta"
            : "cuenta_sin_solicitud"
        }
      }

      const propios = enviosPorRegistro.get(r.id) ?? []
      const campanas: Record<CampanaId, boolean> = {
        membresia: false,
        newsletter: false,
        proxima: false,
      }
      for (const e of propios) {
        if (e.ok && e.plantilla && CAMPANAS.includes(e.plantilla as CampanaId)) {
          campanas[e.plantilla as CampanaId] = true
        }
      }

      return {
        id: r.id,
        nombre: r.nombre ?? "",
        email: r.email ?? "",
        pais: r.pais,
        perfil_profesional: r.perfil_profesional,
        estado: r.estado,
        created_at: r.created_at,
        verificado_at: r.verificado_at,
        idioma: (r.idioma === "es" || r.idioma === "en" ? r.idioma : idiomaPorPais(r.pais)) as Idioma,
        estadoMembresia,
        miembroEmail,
        campanas,
        envios: propios.filter((e) => e.ok).length,
        origen: r.origen ?? null,
      }
    }),
  }
}

export async function getStats(
  registros: RegistroAdmin[]
): Promise<Resultado<ConferenciaStats>> {
  const cuenta = (estado: string) => registros.filter((r) => r.estado === estado).length
  const porMembresia = (estado: EstadoMembresia) =>
    registros.filter((r) => r.estadoMembresia === estado).length

  const agrupa = (clave: (r: RegistroAdmin) => string | null) => {
    const mapa = new Map<string, number>()
    for (const r of registros) {
      const k = clave(r)
      if (!k) continue
      mapa.set(k, (mapa.get(k) ?? 0) + 1)
    }
    return [...mapa.entries()]
      .map(([k, total]) => ({ clave: k, total }))
      .sort((a, b) => b.total - a.total)
  }

  return {
    data: {
      total: registros.length,
      confirmados: cuenta("confirmado"),
      pendientes: cuenta("nuevo"),
      miembros: porMembresia("miembro") + porMembresia("miembro_otro_correo"),
      miembrosOtroCorreo: porMembresia("miembro_otro_correo"),
      incompletas: porMembresia("incompleta"),
      sinSolicitud:
        porMembresia("cuenta_sin_solicitud") + porMembresia("sin_cuenta"),
      sinCuenta: porMembresia("sin_cuenta"),
      cuentaSinSolicitud: porMembresia("cuenta_sin_solicitud"),
      porPais: agrupa((r) => r.pais).map((x) => ({ pais: x.clave, total: x.total })),
      porPerfil: agrupa((r) => r.perfil_profesional ?? "sin_dato").map((x) => ({
        perfil: x.clave,
        total: x.total,
      })),
      porIdioma: IDIOMAS.map((idioma) => ({
        idioma,
        total: registros.filter((r) => r.idioma === idioma).length,
      })),
    },
  }
}

export async function getAjustes(admin: Admin): Promise<Resultado<Ajustes>> {
  const { data: mapa, error } = await leerAjustes(admin)

  const campanas = {} as Record<CampanaId, Record<Idioma, Plantilla>>
  for (const id of CAMPANAS) {
    const porIdioma = {} as Record<Idioma, Plantilla>
    for (const idioma of IDIOMAS) {
      const porDefecto = CAMPANAS_POR_DEFECTO[id][idioma]
      porIdioma[idioma] = {
        asunto: mapa[`plantilla_${id}_asunto_${idioma}`] ?? porDefecto.asunto,
        cuerpo: mapa[`plantilla_${id}_cuerpo_${idioma}`] ?? porDefecto.cuerpo,
      }
    }
    campanas[id] = porIdioma
  }

  return { data: { campanas }, error }
}

/**
 * Plantillas de los correos que dispara el registro público.
 *
 * Se mantienen editables en la base (aunque el panel ya no las muestre) para
 * no cambiar el comportamiento de quien se inscriba después del evento.
 */
export async function getPlantillasSistema(
  admin: Admin
): Promise<Record<PlantillaSistemaId, Plantilla>> {
  const { data: mapa } = await leerAjustes(admin)
  const plantillas = {} as Record<PlantillaSistemaId, Plantilla>

  for (const id of PLANTILLAS_SISTEMA) {
    const porDefecto = SISTEMA_POR_DEFECTO[id]
    plantillas[id] = {
      asunto: mapa[`plantilla_${id}_asunto`] ?? porDefecto.asunto,
      cuerpo: mapa[`plantilla_${id}_cuerpo`] ?? porDefecto.cuerpo,
    }
  }

  return plantillas
}

/** Artículos publicados para el insertador de la campaña de newsletter. */
export async function getArticulosBlog(admin: Admin): Promise<Resultado<ArticuloBait[]>> {
  const { data, error } = await admin
    .from("articulos")
    .select("slug, titulo, titulo_es, resumen, resumen_es, imagen_url")
    .eq("publicado", true)
    .order("fecha_publicacion", { ascending: false })
    .limit(8)

  if (error) {
    console.error("[getArticulosBlog]", error.message, error.code)
    return { data: [], error: error.message }
  }

  return { data: (data ?? []) as ArticuloBait[] }
}
