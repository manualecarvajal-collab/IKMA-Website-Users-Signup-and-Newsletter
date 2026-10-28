"use server"

import { createAdminClient, createClient } from "@/lib/supabase/server"
import { sendResendEmail } from "@/lib/resend"
import { getSenderConfig } from "@/lib/conferencia"
import { componerCorreo, type PlantillaId } from "@/lib/conferencia-plantilla"
import { getAjustes } from "@/lib/conferencia-admin"

/**
 * Acciones del panel de la conferencia.
 *
 * Nada se fía del cliente, y eso incluye QUIÉN llama: cada acción pasa por
 * `requireAdmin()`. El `layout.tsx` de `/admin` protege la PÁGINA, no la
 * acción —una server action es un endpoint POST y se puede invocar sin pasar
 * por esa página—, así que el rol se comprueba aquí dentro. Los destinatarios
 * también se vuelven a leer de la base a partir de los ids recibidos.
 */

/**
 * Comprueba que quien invoca es administrador y devuelve su correo.
 *
 * Cuesta una consulta a `perfiles` por llamada, y es el precio correcto:
 * `enviarInvitacion` manda correos reales a personas reales y
 * `guardarAjustes` reescribe la configuración del directo. Ninguna de las dos
 * debería depender de dónde esté montado el componente que las llama.
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

  const guard = await requireAdmin()
  if (!guard.ok) {
    return { ...resumen, detalle: [{ email: "", ok: false, error: guard.error }] }
  }

  // Faltar la plantilla no puede parecer "no había a quién escribir".
  //
  // Antes esto devolvía el resumen en ceros y el panel pintaba "0 enviados, 0
  // fallidos" sin más, que se lee como que no había destinatarios. Es el mismo
  // fallo que ya se corrigió en `getRegistros` —callar el error— y engaña
  // igual: si el asunto o el cuerpo están vacíos (una clave sin sembrar, por
  // ejemplo) hay que decirlo.
  if (!asunto.trim() || !cuerpo.trim()) {
    return {
      ...resumen,
      detalle: [{ email: "", ok: false, error: "Faltan el asunto o el cuerpo de la plantilla" }],
    }
  }

  if (ids.length === 0) return resumen
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

  // El enlace de la reunión solo lo usa la plantilla de la víspera, y se lee una
  // vez para todo el lote: es el mismo para todos.
  const { urlEnlace } = (await getAjustes(admin)).data

  for (const r of destinatarios) {
    const email = r.email ?? ""
    const html = componerCorreo(plantilla, cuerpo, { nombre: r.nombre ?? "", email, enlace: urlEnlace })

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
  plantilla: PlantillaId,
  destino?: string,
  enlace?: string
): Promise<{ ok: boolean; error?: string; destino?: string }> {
  const guard = await requireAdmin()
  if (!guard.ok) return { ok: false, error: guard.error }

  // Sin destino, la prueba va al correo de quien está logueado: así el botón
  // nunca puede escribir a un tercero por accidente. Con destino, se comprueba
  // que sea un correo con forma de correo —es texto libre de un formulario—.
  const para = (destino ?? "").trim() || guard.email
  if (!para) return { ok: false, error: "No se pudo determinar el correo de destino" }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(para)) {
    return { ok: false, error: `Correo de destino no válido: ${para}` }
  }

  if (!asunto.trim() || !cuerpo.trim()) return { ok: false, error: "Asunto y cuerpo son obligatorios" }

  const admin = await createAdminClient()
  const { fromName, fromEmail } = await getSenderConfig(admin)
  const html = componerCorreo(plantilla, cuerpo, { nombre: "Prueba", email: para, enlace })

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
 * Guarda los ajustes del panel. Solo escribe las claves que recibe.
 *
 * Cada plantilla tiene su propio par de claves, así que hay que decir CUÁL se
 * está guardando: si no, editar el recordatorio pisaría la invitación.
 */
export async function guardarAjustes(entrada: {
  plantillaId?: PlantillaId
  asunto?: string
  cuerpo?: string
  /** Enlace de Zoom. Solo lo usa la plantilla de la víspera. */
  urlEnlace?: string
}): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireAdmin()
  if (!guard.ok) return { ok: false, error: guard.error }

  const filas: { clave: string; valor: string }[] = []

  if (entrada.urlEnlace !== undefined) {
    // Solo http(s): este valor acaba dentro de un `href`, y un `javascript:`
    // ahí sería un enlace envenenado enviado por correo a los inscritos.
    const url = entrada.urlEnlace.trim()
    if (url && !/^https?:\/\//i.test(url)) {
      return { ok: false, error: "El enlace de Zoom tiene que empezar por https://" }
    }
    filas.push({ clave: "plantilla_recordatorio_url", valor: url })
  }

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
