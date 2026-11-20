"use server"

import { createAdminClient, createClient } from "@/lib/supabase/server"
import { sendResendEmail } from "@/lib/resend"
import { claveNombre, getSenderConfig, idiomaPorPais } from "@/lib/conferencia"
import { listAllAuthUsers } from "@/lib/supabase/auth-users"
import {
  CAMPANAS,
  IDIOMAS,
  componerCampana,
  type CampanaId,
  type Idioma,
} from "@/lib/conferencia-plantilla"

/**
 * Acciones del panel de campañas de la conferencia.
 *
 * Nada se fía del cliente, y eso incluye QUIÉN llama: cada acción pasa por
 * `requireAdmin()`. El `layout.tsx` de `/admin` protege la PÁGINA, no la
 * acción —una server action es un endpoint POST y se puede invocar sin pasar
 * por esa página—, así que el rol se comprueba aquí dentro. Los destinatarios
 * también se vuelven a leer de la base a partir de los ids recibidos.
 */

async function requireAdmin(): Promise<
  { ok: true; email: string } | { ok: false; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: "No hay sesión" }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single()

  if (perfil?.rol !== "administrador") return { ok: false, error: "No autorizado" }

  return { ok: true, email: user.email ?? "" }
}

export interface EnvioDetalle {
  email: string
  ok: boolean
  error?: string
}

export interface EnvioResumen {
  enviados: number
  fallidos: number
  /** Seleccionados que NO estaban confirmados y por tanto no se tocaron. */
  omitidosNoConfirmados: number
  /** Miembros aprobados que se saltaron al invitar a la membresía. */
  omitidosMiembros?: number
  /**
   * Seleccionados que ya habían recibido ESTE correo (mismo asunto y envío
   * correcto) y no se les ha repetido. Evita el doble envío al reintentar un
   * lote que se cortó a medias.
   */
  yaEnviados?: number
  /** Se paró porque Resend devolvió 429 (cuota agotada). */
  cortadoPorCuota: boolean
  detalle: EnvioDetalle[]
}

/** Tope de seguridad por envío: evita disparar cientos por un clic accidental. */
const MAX_POR_ENVIO = 50

/**
 * PAUSA ENTRE ENVÍOS.
 *
 * Resend acepta 2 peticiones por segundo; por encima devuelve 429. 600 ms deja
 * el ritmo en ~1,6 por segundo, por debajo del límite.
 */
const PAUSA_ENTRE_ENVIOS_MS = 600

const esperar = (ms: number) => new Promise((v) => setTimeout(v, ms))

type EnvioResend = { ok: boolean; status: number; cuerpo: string }

/**
 * Envía un correo y, si Resend responde 429 por ritmo, espera y reintenta.
 * Un 429 por cuota no se reintenta: no queda nada que gastar.
 */
async function enviarConReintento(
  input: Parameters<typeof sendResendEmail>[0],
  intentos = 3
): Promise<EnvioResend> {
  let ultimo: EnvioResend = { ok: false, status: 0, cuerpo: "" }
  for (let i = 0; i < intentos; i++) {
    const res = await sendResendEmail(input)
    if (res.ok) return { ok: true, status: res.status, cuerpo: "" }

    const cuerpo = await res.text().catch(() => "")
    ultimo = { ok: false, status: res.status, cuerpo }

    const esCuota = /quota|daily|limit reach|exceeded your/i.test(cuerpo)
    if (res.status === 429 && !esCuota && i < intentos - 1) {
      await esperar(1000 * 2 ** i)
      continue
    }
    break
  }
  return ultimo
}

/**
 * Envía una campaña a los registros seleccionados.
 *
 * El idioma se decide POR DESTINATARIO: `es` o `en` según su fila; si la
 * columna todavía no existe, se deduce por país. El asunto y el cuerpo que
 * llegan del panel son los dos borradores (ES y EN); aquí se elige el que
 * corresponde a cada persona.
 *
 * Solo se escribe a quien tiene `estado = 'confirmado'`. Un email en `nuevo` no
 * está verificado: pudo escribirlo cualquiera, así que mandarle correo sería
 * escribir a un tercero que nunca dio señales.
 */
export async function enviarCampana(
  ids: string[],
  campana: CampanaId,
  asuntoEs: string,
  cuerpoEs: string,
  asuntoEn: string,
  cuerpoEn: string,
  saltarYaEnviados = false
): Promise<EnvioResumen> {
  const resumen: EnvioResumen = {
    enviados: 0,
    fallidos: 0,
    omitidosNoConfirmados: 0,
    omitidosMiembros: 0,
    cortadoPorCuota: false,
    detalle: [],
  }

  const guard = await requireAdmin()
  if (!guard.ok) {
    return { ...resumen, detalle: [{ email: "", ok: false, error: guard.error }] }
  }

  if (!CAMPANAS.includes(campana)) {
    return { ...resumen, detalle: [{ email: "", ok: false, error: "Campaña desconocida" }] }
  }

  if (![asuntoEs, cuerpoEs, asuntoEn, cuerpoEn].every((v) => v.trim())) {
    return {
      ...resumen,
      detalle: [{ email: "", ok: false, error: "Faltan el asunto o el cuerpo en español o en inglés" }],
    }
  }

  if (ids.length === 0) return resumen
  if (ids.length > MAX_POR_ENVIO) {
    return { ...resumen, detalle: [{ email: "", ok: false, error: `Máximo ${MAX_POR_ENVIO} por envío` }] }
  }

  const admin = await createAdminClient()
  // `select("*")` para no romper si la migración 00061 aún no está aplicada.
  const { data, error } = await admin
    .schema("conferencia")
    .from("registros")
    .select("*")
    .in("id", ids)

  if (error) {
    console.error("[enviarCampana] lectura:", error.message, error.code)
    return { ...resumen, detalle: [{ email: "", ok: false, error: error.message }] }
  }

  const seleccionados = data ?? []
  const confirmadosDelLote = seleccionados.filter((r) => r.estado === "confirmado")
  resumen.omitidosNoConfirmados = seleccionados.length - confirmadosDelLote.length

  let destinatarios = confirmadosDelLote

  // En la campaña de membresía no se invita a quien ya es miembro aprobado.
  // Es un seguro del servidor: aunque la selección venga mal, no se le manda
  // una invitación a alguien que ya está dentro.
  if (campana === "membresia") {
    const [usuarios, solicitudes] = await Promise.all([
      listAllAuthUsers(admin),
      admin.from("solicitudes_membresia").select("usuario_id, estado").eq("estado", "aprobada").limit(1000),
    ])
    const idsAprobados = new Set((solicitudes.data ?? []).map((s) => s.usuario_id))
    const emailsMiembros = new Set(
      usuarios
        .filter((u) => u.email && idsAprobados.has(u.id))
        .map((u) => u.email!.trim().toLowerCase())
    )

    // Segunda llave: nombre exacto. Hay inscripciones duplicadas con otro
    // correo (Amanda, Sachiko, Haily/Hainy) que el filtro por email no ve.
    const { data: perfiles } = idsAprobados.size
      ? await admin
          .from("perfiles")
          .select("id, nombre_completo")
          .in("id", [...idsAprobados])
      : { data: [] as { id: string; nombre_completo: string | null }[] }
    const nombrePorId = new Map((perfiles ?? []).map((p) => [p.id, p.nombre_completo]))
    const nombresMiembros = new Set(
      usuarios
        .filter((u) => idsAprobados.has(u.id))
        .map((u) => {
          const meta = u.user_metadata as Record<string, unknown> | undefined
          return claveNombre(
            nombrePorId.get(u.id) ||
              (meta?.nombre_completo as string) ||
              (meta?.full_name as string) ||
              (meta?.name as string) ||
              ""
          )
        })
        .filter(Boolean)
    )

    const antes = destinatarios.length
    destinatarios = destinatarios.filter(
      (r) =>
        !emailsMiembros.has((r.email ?? "").trim().toLowerCase()) &&
        !nombresMiembros.has(claveNombre(r.nombre))
    )
    resumen.omitidosMiembros = antes - destinatarios.length
  }

  // Quién recibió YA este mismo correo sin error en las últimas 24 horas. Se
  // compara por asunto porque los dos idiomas tienen asuntos distintos.
  if (saltarYaEnviados) {
    const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: previos } = await admin
      .schema("conferencia")
      .from("envios")
      .select("email")
      .in("asunto", [asuntoEs, asuntoEn])
      .eq("ok", true)
      .gte("created_at", desde)
    const yaTienen = new Set((previos ?? []).map((e) => (e.email ?? "").trim().toLowerCase()))
    destinatarios = destinatarios.filter((r) => !yaTienen.has((r.email ?? "").trim().toLowerCase()))
    resumen.yaEnviados = confirmadosDelLote.length - resumen.omitidosMiembros! - destinatarios.length
  }

  const { fromName, fromEmail } = await getSenderConfig(admin)
  const envios = () => admin.schema("conferencia").from("envios")

  /**
   * Anota el envío. Si la columna `plantilla` aún no existe, reintenta sin
   * ella: perder la etiqueta de campaña es molesto, pero perder el registro
   * del envío es peor.
   */
  async function anotar(registroId: string, email: string, asunto: string, ok: boolean, error?: string) {
    const fila = { registro_id: registroId, email, asunto, ok, error: error ?? null }
    const { error: errorConPlantilla } = await envios().insert({ ...fila, plantilla: campana })
    if (!errorConPlantilla) return
    const { error: errorSinPlantilla } = await envios().insert(fila)
    if (errorSinPlantilla) {
      console.error("[enviarCampana] envios:", errorSinPlantilla.message, errorSinPlantilla.code)
    }
  }

  for (const r of destinatarios) {
    const email = r.email ?? ""
    const idioma: Idioma = r.idioma === "es" || r.idioma === "en" ? r.idioma : idiomaPorPais(r.pais)
    const asunto = idioma === "es" ? asuntoEs : asuntoEn
    const cuerpo = idioma === "es" ? cuerpoEs : cuerpoEn
    const html = componerCampana(campana, cuerpo, { nombre: r.nombre ?? "", email }, idioma)

    const res = await enviarConReintento({ to: email, subject: asunto, html, fromName, fromEmail })

    if (res.ok) {
      resumen.enviados++
      resumen.detalle.push({ email, ok: true })
      await anotar(r.id, email, asunto, true)
    } else {
      resumen.fallidos++
      const error = `${res.status} ${res.cuerpo.slice(0, 120)}`
      resumen.detalle.push({ email, ok: false, error })
      await anotar(r.id, email, asunto, false, `${res.status} ${res.cuerpo.slice(0, 200)}`)

      if (res.status === 429 && /quota|daily|limit reach|exceeded your/i.test(res.cuerpo)) {
        resumen.cortadoPorCuota = true
        console.error("[enviarCampana] cuota agotada, se detiene el lote")
        break
      }
    }

    if (destinatarios.indexOf(r) < destinatarios.length - 1) await esperar(PAUSA_ENTRE_ENVIOS_MS)
  }

  return resumen
}

/**
 * Envía una prueba al correo del administrador que la pide.
 *
 * Existe porque la cuota de Resend es corta y un envío a muchas personas no se
 * deshace: mejor ver el correo antes en la propia bandeja.
 */
export async function enviarPrueba(
  campana: CampanaId,
  idioma: Idioma,
  asunto: string,
  cuerpo: string,
  destino?: string
): Promise<{ ok: boolean; error?: string; destino?: string }> {
  const guard = await requireAdmin()
  if (!guard.ok) return { ok: false, error: guard.error }

  if (!CAMPANAS.includes(campana) || !IDIOMAS.includes(idioma)) {
    return { ok: false, error: "Campaña o idioma desconocido" }
  }

  // Sin destino, la prueba va al correo de quien está logueado: así el botón
  // nunca puede escribir a un tercero por accidente.
  const para = (destino ?? "").trim() || guard.email
  if (!para) return { ok: false, error: "No se pudo determinar el correo de destino" }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(para)) {
    return { ok: false, error: `Correo de destino no válido: ${para}` }
  }

  if (!asunto.trim() || !cuerpo.trim()) return { ok: false, error: "Asunto y cuerpo son obligatorios" }

  const admin = await createAdminClient()
  const { fromName, fromEmail } = await getSenderConfig(admin)
  const html = componerCampana(campana, cuerpo, { nombre: "Prueba", email: para }, idioma)

  const res = await sendResendEmail({
    to: para,
    subject: `[PRUEBA] ${asunto}`,
    html,
    fromName,
    fromEmail,
  })

  if (res.ok) return { ok: true, destino: para }
  const body = await res.text().catch(() => "")
  return { ok: false, error: `${res.status} ${body.slice(0, 160)}` }
}

/**
 * Guarda la plantilla de una campaña en un idioma. Solo escribe las dos claves
 * que recibe, así que editar español no pisa inglés.
 */
export async function guardarCampana(
  campana: CampanaId,
  idioma: Idioma,
  asunto: string,
  cuerpo: string
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireAdmin()
  if (!guard.ok) return { ok: false, error: guard.error }

  if (!CAMPANAS.includes(campana) || !IDIOMAS.includes(idioma)) {
    return { ok: false, error: "Campaña o idioma desconocido" }
  }

  const admin = await createAdminClient()
  const prefijo = `plantilla_${campana}`
  const filas = [
    { clave: `${prefijo}_asunto_${idioma}`, valor: asunto },
    { clave: `${prefijo}_cuerpo_${idioma}`, valor: cuerpo },
  ].map((f) => ({ ...f, updated_at: new Date().toISOString() }))

  const { error } = await admin
    .schema("conferencia")
    .from("ajustes")
    .upsert(filas, { onConflict: "clave" })

  if (error) {
    console.error("[guardarCampana]", error.message, error.code)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

/**
 * Cambia el idioma de una o varias filas.
 *
 * Es una corrección manual de la suposición por país: el formulario antiguo
 * nunca guardó el idioma, así que puede haber excepciones.
 */
export async function guardarIdioma(
  ids: string[],
  idioma: Idioma
): Promise<{ ok: boolean; error?: string; actualizados?: number }> {
  const guard = await requireAdmin()
  if (!guard.ok) return { ok: false, error: guard.error }

  if (!IDIOMAS.includes(idioma)) return { ok: false, error: "Idioma desconocido" }
  if (ids.length === 0) return { ok: true, actualizados: 0 }
  if (ids.length > 500) return { ok: false, error: "Máximo 500 filas por cambio" }

  const admin = await createAdminClient()
  const { data, error } = await admin
    .schema("conferencia")
    .from("registros")
    .update({ idioma })
    .in("id", ids)
    .select("id")

  if (error) {
    console.error("[guardarIdioma]", error.message, error.code)
    const falta = error.code === "42703" || error.code === "PGRST204" || /idioma/i.test(error.message)
    return {
      ok: false,
      error: falta
        ? "Falta la columna idioma: aplica la migración 00061 en Supabase."
        : error.message,
    }
  }

  return { ok: true, actualizados: data?.length ?? 0 }
}
