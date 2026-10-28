import { createAdminClient } from "@/lib/supabase/server"
import {
  PLANTILLAS,
  PLANTILLAS_POR_DEFECTO,
  type Plantilla,
  type PlantillaId,
} from "@/lib/conferencia-plantilla"

/**
 * Consultas del panel de la conferencia (`/admin/conferencia`).
 *
 * Módulo de servidor: usa el cliente admin (service_role), que ignora RLS.
 * Regla de oro (conferencia.md): toda query al schema `conferencia` DEBE
 * llevar `.schema("conferencia")`.
 */

type Admin = Awaited<ReturnType<typeof createAdminClient>>

export interface RegistroAdmin {
  id: string
  nombre: string
  email: string
  pais: string | null
  perfil_profesional: string | null
  estado: string
  created_at: string
  verificado_at: string | null
  /** Cuántas invitaciones se le han enviado ya. */
  envios: number
}

export interface ConferenciaStats {
  total: number
  confirmados: number
  pendientes: number
  cancelados: number
  porPais: { pais: string; total: number }[]
  porPerfil: { perfil: string; total: number }[]
}

export interface Ajustes {
  /** Las tres plantillas, indexadas por id. Ver `conferencia-plantilla.ts`. */
  plantillas: Record<PlantillaId, Plantilla>
  /**
   * Enlace de Zoom de la reunión. Es el botón de la plantilla `recordatorio`,
   * la que se manda la víspera: se pega en el panel ese mismo día, cuando quien
   * organiza la reunión lo comparte.
   */
  urlEnlace: string
}

/**
 * Resultado con error explícito.
 *
 * Antes estas funciones devolvían una lista vacía al fallar, y eso es
 * peligroso: "no hay inscritos" y "no pude leer los inscritos" se veían
 * exactamente igual en el panel. Pasó de verdad — la migración `00056` no
 * estaba aplicada y el panel mostraba una tabla vacía como si no hubiera
 * nadie. Mejor decirlo.
 */
export interface Resultado<T> {
  data: T
  error?: string
}

const DEFAULTS: Ajustes = { plantillas: PLANTILLAS_POR_DEFECTO, urlEnlace: "" }

/**
 * Traduce los errores de PostgREST a algo accionable.
 *
 * `PGRST205` y `PGRST200` son los que aparecen cuando falta una tabla porque
 * su migración no se aplicó; sin traducirlo se leen como un fallo críptico de
 * la API. Pasó de verdad con la `00056`.
 */
function describeError(code: string | undefined, message: string): string {
  if (code === "PGRST205" || code === "PGRST200") {
    return `Falta una tabla del schema conferencia (${message}). ¿Está aplicada la migración 00056?`
  }
  return `${message}${code ? ` (${code})` : ""}`
}

export async function getRegistros(admin: Admin): Promise<Resultado<RegistroAdmin[]>> {
  const { data, error } = await admin
    .schema("conferencia")
    .from("registros")
    .select("id, nombre, email, pais, perfil_profesional, estado, created_at, verificado_at, envios(id)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getRegistros]", error.message, error.code)
    return { data: [], error: describeError(error.code, error.message) }
  }

  return {
    data: (data ?? []).map((r) => ({
      id: r.id,
      nombre: r.nombre ?? "",
      email: r.email ?? "",
      pais: r.pais,
      perfil_profesional: r.perfil_profesional,
      estado: r.estado,
      created_at: r.created_at,
      verificado_at: r.verificado_at,
      // `envios` llega como lista de relaciones; solo interesa cuántas hay.
      envios: Array.isArray(r.envios) ? r.envios.length : 0,
    })),
  }
}

export async function getStats(
  admin: Admin,
  registros: RegistroAdmin[]
): Promise<Resultado<ConferenciaStats>> {
  const cuenta = (e: string) => registros.filter((r) => r.estado === e).length

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
      cancelados: cuenta("cancelado"),
      porPais: agrupa((r) => r.pais).map((x) => ({ pais: x.clave, total: x.total })),
      porPerfil: agrupa((r) => r.perfil_profesional).map((x) => ({
        perfil: x.clave,
        total: x.total,
      })),
    },
  }
}

export async function getAjustes(admin: Admin): Promise<Resultado<Ajustes>> {
  const { data, error } = await admin.schema("conferencia").from("ajustes").select("clave, valor")

  if (error) {
    console.error("[getAjustes]", error.message, error.code)
    return { data: DEFAULTS, error: describeError(error.code, error.message) }
  }

  const mapa: Record<string, string> = {}
  for (const row of data ?? []) mapa[row.clave] = row.valor ?? ""

  // Cada plantilla cae a su texto por defecto si la clave no existe todavía: la
  // de confirmación se envía sola al verificar el código, así que un correo con
  // el cuerpo vacío sería peor que uno con el texto de partida.
  const plantillas = {} as Record<PlantillaId, Plantilla>
  for (const id of PLANTILLAS) {
    const porDefecto = PLANTILLAS_POR_DEFECTO[id]
    plantillas[id] = {
      asunto: mapa[`plantilla_${id}_asunto`] ?? porDefecto.asunto,
      cuerpo: mapa[`plantilla_${id}_cuerpo`] ?? porDefecto.cuerpo,
    }
  }

  return { data: { plantillas, urlEnlace: mapa.plantilla_recordatorio_url ?? "" } }
}
