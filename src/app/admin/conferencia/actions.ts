"use server"

import { createAdminClient, createClient } from "@/lib/supabase/server"
import { sendResendEmail } from "@/lib/resend"
import { getSenderConfig } from "@/lib/conferencia"
import { componerCorreo, type PlantillaId } from "@/lib/conferencia-plantilla"
import { getAjustes } from "@/lib/conferencia-admin"
import { CODE_TTL_MINUTES, emitirCodigo } from "@/lib/conferencia-codigo"
import { baseDelSitio, enlaceAcceso } from "@/lib/conferencia"

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
  plantilla: PlantillaId,
  /** Enlace de Zoom tal como está en el campo del panel. Si falta, se usa el guardado. */
  enlaceDelPanel?: string
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
  // vez para todo el lote: es el mismo para todos. Manda el que está en el campo
  // del panel —lo que se ve en la vista previa es lo que se manda— y si viene
  // vacío se usa el guardado.
  const { urlEnlace: enlaceGuardado } = (await getAjustes(admin)).data
  const urlEnlace = (enlaceDelPanel ?? "").trim() || enlaceGuardado

  // Y si aun así no hay enlace, NO se manda: un correo que dice «este es tu
  // enlace» con el enlace vacío es peor que no enviarlo, porque el inscrito se
  // queda esperando y ya no vuelve a mirar.
  if (plantilla === "recordatorio" && !urlEnlace) {
    return {
      ...resumen,
      detalle: [{ email: "", ok: false, error: "Falta el enlace de Zoom: pégalo antes de enviar." }],
    }
  }

  // La plantilla de ACCESO lleva un enlace FIRMADO distinto para cada persona:
  // no se puede reutilizar el de otro ni mandarlo vacío, así que se genera aquí
  // uno por destinatario.
  const base = plantilla === "acceso" ? await baseDelSitio() : ""

  for (const r of destinatarios) {
    const email = r.email ?? ""
    const html = componerCorreo(plantilla, cuerpo, {
      nombre: r.nombre ?? "",
      email,
      enlace: urlEnlace,
      acceso: plantilla === "acceso" ? enlaceAcceso(email, base) : undefined,
    })

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
  if (plantilla === "recordatorio" && !(enlace ?? "").trim()) {
    return { ok: false, error: "Falta el enlace de Zoom: pégalo antes de enviar la prueba." }
  }

  const admin = await createAdminClient()
  const { fromName, fromEmail } = await getSenderConfig(admin)
  // Con la plantilla de acceso, la prueba lleva un enlace de verdad para el
  // correo de destino: así se puede pulsar y comprobar que entra.
  const enlacePrueba = plantilla === "acceso" ? enlaceAcceso(para, await baseDelSitio()) : undefined
  const html = componerCorreo(plantilla, cuerpo, {
    nombre: "Prueba",
    email: para,
    enlace,
    acceso: enlacePrueba,
  })

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
 * Reenvía la verificación a quien se inscribió y no terminó.
 *
 * NO es un recordatorio cualquiera: el código caduca a los 15 minutos y en la
 * base solo vive su hash, así que no se puede «volver a mandar el mismo». Aquí
 * se EMITE UNO NUEVO (misma maquinaria que la landing, en
 * `@/lib/conferencia-codigo`) y se manda con la plantilla `verificacion`, que es
 * editable desde el panel.
 *
 * Solo toca registros en `nuevo`: a quien ya confirmó no se le manda un código
 * que no necesita, y a quien está cancelado tampoco.
 *
 * Cada envío queda anotado en `envios`, igual que los demás.
 */
export async function enviarVerificacion(ids: string[]): Promise<EnvioResumen> {
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
    console.error("[enviarVerificacion] lectura:", error.message, error.code)
    return { ...resumen, detalle: [{ email: "", ok: false, error: error.message }] }
  }

  const { plantillas } = (await getAjustes(admin)).data
  const plantilla = plantillas.verificacion
  const { fromName, fromEmail } = await getSenderConfig(admin)
  const envios = () => admin.schema("conferencia").from("envios")

  for (const r of data ?? []) {
    const email = r.email ?? ""
    if (r.estado !== "nuevo") {
      resumen.omitidosNoConfirmados++
      resumen.detalle.push({
        email,
        ok: false,
        error: "Ya está confirmado: no necesita código",
      })
      continue
    }

    if (!plantilla.asunto.trim() || !plantilla.cuerpo.trim()) {
      resumen.fallidos++
      resumen.detalle.push({ email, ok: false, error: "La plantilla de verificación está vacía" })
      continue
    }

    const emision = await emitirCodigo(admin, r.id, "admin")
    if (!emision.ok) {
      resumen.fallidos++
      resumen.detalle.push({
        email,
        ok: false,
        error:
          emision.reason === "cooldown"
            ? `Espera ${emision.retryInSeconds} s: se le acaba de enviar otro código`
            : "No se pudo emitir el código",
      })
      continue
    }

    const html = componerCorreo("verificacion", plantilla.cuerpo, {
      nombre: r.nombre ?? "",
      email,
      codigo: emision.codigo,
      minutos: String(CODE_TTL_MINUTES),
    })

    const res = await sendResendEmail({
      to: email,
      subject: plantilla.asunto,
      html,
      fromName,
      fromEmail,
    })

    if (res.ok) {
      resumen.enviados++
      resumen.detalle.push({ email, ok: true })
      await envios().insert({ registro_id: r.id, email, asunto: plantilla.asunto, ok: true })
      continue
    }

    const cuerpo = await res.text().catch(() => "")
    resumen.fallidos++
    resumen.detalle.push({ email, ok: false, error: `${res.status}` })
    await envios().insert({
      registro_id: r.id,
      email,
      asunto: plantilla.asunto,
      ok: false,
      error: `${res.status} ${cuerpo.slice(0, 200)}`,
    })

    if (res.status === 429) {
      resumen.cortadoPorCuota = true
      console.error("[enviarVerificacion] cuota agotada, se detiene el lote")
      break
    }
  }

  return resumen
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
