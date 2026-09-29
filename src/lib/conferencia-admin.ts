import { createAdminClient } from "@/lib/supabase/server"
import type { PlantillaId } from "@/lib/conferencia-plantilla"

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
  conectados: number
  porPais: { pais: string; total: number }[]
  porPerfil: { perfil: string; total: number }[]
}

export interface Plantilla {
  asunto: string
  cuerpo: string
}

export interface Ajustes {
  directoUrl: string
  directoEmbed: string
  /** Las dos plantillas, indexadas por id: `invitacion` y `recordatorio`. */
  plantillas: Record<PlantillaId, Plantilla>
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

const DEFAULTS: Ajustes = {
  directoUrl: "",
  directoEmbed: "",
  plantillas: {
    invitacion: { asunto: "", cuerpo: "" },
    recordatorio: { asunto: "", cuerpo: "" },
  },
}

/**
 * Minutos de margen para contar a alguien como conectado.
 *
 * El latido se manda cada 20 s, así que 90 s tolera que a alguien se le
 * duerma una pestaña sin darlo por ido, y a la vez no cuenta a quien cerró.
 */
export const PRESENCIA_VENTANA_MINUTOS = 1.5

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

  const desde = new Date(Date.now() - PRESENCIA_VENTANA_MINUTOS * 60 * 1000).toISOString()
  const { count, error } = await admin
    .schema("conferencia")
    .from("presencia")
    .select("sesion_id", { count: "exact", head: true })
    .gte("last_seen", desde)

  if (error) console.error("[getStats/presencia]", error.message, error.code)

  return {
    data: {
      total: registros.length,
      confirmados: cuenta("confirmado"),
      pendientes: cuenta("nuevo"),
      cancelados: cuenta("cancelado"),
      // Si falla la presencia se muestra 0: los contadores de inscritos
      // siguen siendo válidos y no tiene sentido tumbar el panel entero.
      conectados: count ?? 0,
      porPais: agrupa((r) => r.pais).map((x) => ({ pais: x.clave, total: x.total })),
      porPerfil: agrupa((r) => r.perfil_profesional).map((x) => ({
        perfil: x.clave,
        total: x.total,
      })),
    },
    error: error ? describeError(error.code, error.message) : undefined,
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

  return {
    data: {
      directoUrl: mapa.directo_url ?? "",
      directoEmbed: mapa.directo_embed ?? "",
      plantillas: {
        invitacion: {
          asunto: mapa.plantilla_invitacion_asunto ?? "",
          cuerpo: mapa.plantilla_invitacion_cuerpo ?? "",
        },
        recordatorio: {
          asunto: mapa.plantilla_recordatorio_asunto ?? "",
          cuerpo: mapa.plantilla_recordatorio_cuerpo ?? "",
        },
      },
    },
  }
}
