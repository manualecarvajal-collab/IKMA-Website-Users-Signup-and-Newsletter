"use server"

import { createAdminClient, createClient } from "@/lib/supabase/server"
import { sendResendEmail } from "@/lib/resend"
import { getSenderConfig } from "@/lib/conferencia"
import { componerCorreo, type PlantillaId } from "@/lib/conferencia-plantilla"

/**
 * Acciones del panel de la conferencia.
 *
 * Este panel es interno (va bajo `/admin`, que ya exige rol administrador en
 * `src/app/admin/layout.tsx`), pero aun así nada se fía del cliente: los
 * destinatarios se vuelven a leer de la base a partir de los ids recibidos.
 */

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
  /** Se paró porque Resend devolvió 429 (cuota agotada). */
  cortadoPorCuota: boolean
  detalle: EnvioDetalle[]
}

/** Tope de seguridad por envío: evita disparar cientos por un clic accidental. */
const MAX_POR_ENVIO = 50

/**
 * Envía la invitación a los registros seleccionados.
 *
 * Solo se escribe a quien tiene `estado = 'confirmado'`. Un email en `nuevo`
 * no está verificado: pudo escribirlo cualquiera, incluso con la dirección de
 * otra persona, así que mandarle correo sería escribir a un tercero que nunca
 * dio señales. Los omitidos se devuelven contados para poder decirlo.
 */
export async function enviarInvitacion(
  ids: string[],
  asunto: string,
  cuerpo: string,
  plantilla: PlantillaId
): Promise<EnvioResumen> {
  const resumen: EnvioResumen = {
    enviados: 0,
    fallidos: 0,
    omitidosNoConfirmados: 0,
    cortadoPorCuota: false,
    detalle: [],
  }

  if (!asunto.trim() || !cuerpo.trim() || ids.length === 0) return resumen
  if (ids.length > MAX_POR_ENVIO) {
    return { ...resumen, detalle: [{ email: "", ok: false, error: `Máximo ${MAX_POR_ENVIO} por envío` }] }
  }

  const admin = await createAdminClient()
  const { data, error } = await admin
    .schema("conferencia")
    .from("registros")
    .select("id, nombre, email, estado")
    .in("id", ids)

  if (error) {
    console.error("[enviarInvitacion] lectura:", error.message, error.code)
    return { ...resumen, detalle: [{ email: "", ok: false, error: error.message }] }
  }

  const seleccionados = data ?? []
  const destinatarios = seleccionados.filter((r) => r.estado === "confirmado")
  resumen.omitidosNoConfirmados = seleccionados.length - destinatarios.length

  const { fromName, fromEmail } = await getSenderConfig(admin)
  const envios = () => admin.schema("conferencia").from("envios")

  for (const r of destinatarios) {
    const email = r.email ?? ""
    const html = componerCorreo(plantilla, cuerpo, { nombre: r.nombre ?? "", email })

    const res = await sendResendEmail({ to: email, subject: asunto, html, fromName, fromEmail })

    if (res.ok) {
      resumen.enviados++
      resumen.detalle.push({ email, ok: true })
      await envios().insert({ registro_id: r.id, email, asunto, ok: true })
      continue
    }

    const body = await res.text().catch(() => "")
    resumen.fallidos++
    resumen.detalle.push({ email, ok: false, error: `${res.status}` })
    await envios().insert({
      registro_id: r.id,
      email,
      asunto,
      ok: false,
      error: `${res.status} ${body.slice(0, 200)}`,
    })

    // 429 = cuota agotada. Seguir intentando solo gasta tiempo y llena el
    // registro de fallos idénticos, y lo que hay que saber es que se cortó.
    if (res.status === 429) {
      resumen.cortadoPorCuota = true
      console.error("[enviarInvitacion] cuota agotada, se detiene el lote")
      break
    }
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
  asunto: string,
  cuerpo: string,
  plantilla: PlantillaId
): Promise<{ ok: boolean; error?: string; destino?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return { ok: false, error: "No se pudo determinar tu correo" }
  if (!asunto.trim() || !cuerpo.trim()) return { ok: false, error: "Asunto y cuerpo son obligatorios" }

  const admin = await createAdminClient()
  const { fromName, fromEmail } = await getSenderConfig(admin)
  const html = componerCorreo(plantilla, cuerpo, { nombre: "Prueba", email: user.email })

  const res = await sendResendEmail({
    to: user.email,
    subject: `[PRUEBA] ${asunto}`,
    html,
    fromName,
    fromEmail,
  })

  if (res.ok) return { ok: true, destino: user.email }
  const body = await res.text().catch(() => "")
  return { ok: false, error: `${res.status} ${body.slice(0, 160)}` }
}

/**
 * Guarda los ajustes del panel. Solo escribe las claves que recibe.
 *
 * Cada plantilla tiene su propio par de claves, así que hay que decir CUÁL se
 * está guardando: si no, editar el recordatorio pisaría la invitación.
 */
export async function guardarAjustes(entrada: {
  directoUrl?: string
  directoEmbed?: string
  plantillaId?: PlantillaId
  asunto?: string
  cuerpo?: string
}): Promise<{ ok: boolean; error?: string }> {
  const filas: { clave: string; valor: string }[] = []
  if (entrada.directoUrl !== undefined) filas.push({ clave: "directo_url", valor: entrada.directoUrl.trim() })
  if (entrada.directoEmbed !== undefined)
    filas.push({ clave: "directo_embed", valor: entrada.directoEmbed.trim() })

  if (entrada.plantillaId) {
    const prefijo = `plantilla_${entrada.plantillaId}`
    if (entrada.asunto !== undefined) filas.push({ clave: `${prefijo}_asunto`, valor: entrada.asunto })
    if (entrada.cuerpo !== undefined) filas.push({ clave: `${prefijo}_cuerpo`, valor: entrada.cuerpo })
  }

  if (filas.length === 0) return { ok: true }

  const admin = await createAdminClient()
  const { error } = await admin
    .schema("conferencia")
    .from("ajustes")
    .upsert(filas.map((f) => ({ ...f, updated_at: new Date().toISOString() })), { onConflict: "clave" })

  if (error) {
    console.error("[guardarAjustes]", error.message, error.code)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
