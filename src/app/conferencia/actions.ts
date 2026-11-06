"use server"

import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/server"
import { sendResendEmail } from "@/lib/resend"
import {
  ACCESO_DIAS,
  SESION_PREF_COOKIE,
  baseDelSitio,
  emailDeCookieInscripcion,
  enlaceAcceso,
  findRegistro,
  marcarYaInscrito,
  normalizeEmail,
  opcionesCookiePreferencia,
  opcionesCookieSesion,
  preferenciaSesion,
  REGISTRO_COOKIE,
  REGISTRO_COOKIE_MAX_AGE,
  valorCookieInscripcion,
} from "@/lib/conferencia"
import { getAjustes } from "@/lib/conferencia-admin"
import { componerCorreo } from "@/lib/conferencia-plantilla"
import { buildConferenciaAccesoHtml, buildConferenciaCodigoHtml } from "@/lib/email-template"
import {
  CODE_DIGITS,
  CODE_TTL_MINUTES,
  MAX_ATTEMPTS,
  RESEND_COOLDOWN_SECONDS,
  emitirCodigo,
  hashCode,
  hashesMatch,
} from "@/lib/conferencia-codigo"
import { enVentanaDeEnlace } from "@/components/conferencia/event"

/**
 * Inscripción a la conferencia en dos pasos.
 *
 *   1. `solicitarCodigo` — guarda al inscrito con `estado = 'nuevo'` y le
 *      manda un código de 6 dígitos al correo.
 *   2. `verificarCodigo` — comprueba el código y pasa el registro a
 *      `estado = 'confirmado'`.
 *
 * `estado = 'confirmado'` es la lista de la que sale el envío del enlace de
 * Zoom, así que la verificación no es decorativa: sin código no se entra en esa
 * lista y el día de la víspera no llega nada.
 *
 * Regla de oro (conferencia.md): toda query al schema `conferencia` DEBE
 * llevar `.schema("conferencia")`. Se usa el cliente admin (service_role),
 * que ignora RLS: la tabla no tiene políticas, así que anon/authenticated no
 * pueden leer ni escribir nada.
 *
 * Nada de esto usa Supabase Auth a propósito: `auth.users` vive en el sitio
 * principal y borrar el schema `conferencia` no lo limpiaría.
 */

/** Perfil profesional: claves estables en inglés. Debe coincidir con el CHECK. */
export type PerfilProfesional =
  | "student"
  | "licensed_health_professional"
  | "resident"
  | "non_professional"

export interface RegistroInput {
  nombre: string
  email: string
  pais?: string
  perfilProfesional?: PerfilProfesional
  consentimiento: boolean
  telefono?: string
  ciudad?: string
  mensaje?: string
}

/**
 * Resultado de pedir un código.
 *
 * `alreadyRegistered` distingue "te acabas de inscribir" de "ya estabas
 * inscrito y estás volviendo" (otro navegador, cookies borradas). En los dos
 * casos se manda código, porque la única forma honesta de entrar es demostrar
 * que el buzón es tuyo.
 */
export type RequestCodeResult =
  | { ok: true; cooldownSeconds: number; alreadyRegistered: boolean }
  | { ok: false; reason: "invalid" | "notFound" | "tooManyRequests" | "sendFailed" | "unknown" }
  | { ok: false; reason: "cooldown"; retryInSeconds: number }

export type VerifyCodeResult =
  /**
   * `correoEnviado` dice si el correo de confirmación llegó a salir. Con la puerta
   * única, un correo que falla deja al usuario fuera, así que la pantalla tiene
   * que poder avisarle y ofrecerle reenviar en vez de dejarlo esperando.
   */
  | { ok: true; correoEnviado?: boolean; enlaceEnviado?: boolean }
  | { ok: false; reason: "invalid" | "notFound" | "expired" | "tooManyAttempts" | "unknown" }
  | { ok: false; reason: "wrongCode"; attemptsLeft: number }

/**
 * Lo que devuelve la emisión de un código. No incluye `alreadyRegistered`
 * porque quien emite no sabe si el registro venía confirmado: lo añade cada
 * acción que la llama.
 */
type IssueResult =
  | { ok: true; cooldownSeconds: number }
  | Exclude<RequestCodeResult, { ok: true }>

// ---------------------------------------------------------------- parámetros

/** Forma de un correo. La compartían dos validaciones; el resto de la lógica de
 * códigos se mudó a `@/lib/conferencia-codigo`. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Admin = Awaited<ReturnType<typeof createAdminClient>>

/**
 * Remitente del sitio, el mismo que usan el resto de correos (tabla
 * `app_config` del schema `public`). Es una lectura deliberada: la conferencia
 * está aislada en escritura, pero compartir el remitente evita mandar los
 * códigos desde una dirección distinta a la del sitio.
 */
async function senderConfig(admin: Admin) {
  const { data } = await admin.from("app_config").select("*")
  const config: Record<string, string> = {}
  for (const row of data ?? []) config[row.key] = row.value
  return {
    fromName: config.email_from_name || "IKMA",
    fromEmail: config.email_from_email || "onboarding@resend.dev",
  }
}

// ---------------------------------------------------------------- paso 1

/**
 * Inscribe a un asistente y le envía el código de verificación.
 *
 * Si el email ya existe con `estado = 'nuevo'` se REUTILIZA la fila en vez de
 * fallar: con OTP, que a alguien se le caduque el código y vuelva a empezar es
 * el camino normal, y el índice único sobre `lower(email)` lo rechazaría con
 * 23505. Un registro ya `confirmado` no corta el paso —se le manda código
 * igual— pero sus datos no se tocan. Ver el comentario más abajo.
 */
export async function solicitarCodigo(input: RegistroInput): Promise<RequestCodeResult> {
  try {
    const email = normalizeEmail(input.email)
    if (!input.nombre?.trim() || !EMAIL_RE.test(email) || !input.consentimiento) {
      return { ok: false, reason: "invalid" }
    }

    const admin = await createAdminClient()
    const registros = () => admin.schema("conferencia").from("registros")

    const existing = await findRegistro(admin, email)
    const alreadyRegistered = existing?.estado === "confirmado"

    // Un email ya confirmado NO se rechaza: se le manda código igual.
    //
    // Antes se devolvía "ya estás inscrito" y ahí se acababa todo, lo que
    // dejaba sin salida a quien ya se había inscrito y volvía desde otro
    // navegador o con las cookies borradas: el formulario le rechazaba el
    // correo y la única forma de entrar (la cookie) se pone al verificar un
    // código, así que nunca podía llegar a ella. Ahora vuelve a demostrar que
    // el buzón es suyo y entra.
    //
    // No se toca `estado`: si ya estaba confirmado, sigue estándolo.

    const { perfilProfesional, ...rest } = input
    const payload = {
      ...rest,
      email,
      perfil_profesional: perfilProfesional ?? null,
      consentimiento_at: input.consentimiento ? new Date().toISOString() : null,
    }

    let registroId: string
    if (existing) {
      registroId = existing.id

      // Un registro YA CONFIRMADO no se toca.
      //
      // Esta acción es pública y no pide nada para llegar hasta aquí, así que
      // actualizar sus datos dejaría a cualquiera que sepa un correo inscrito
      // reescribir el nombre, el país, el perfil y el consentimiento de esa
      // persona. No concedería acceso —`estado` no está en el payload— pero sí
      // corrompería justo la lista con la que se va a invitar a la membresía y
      // al newsletter.
      //
      // A quien vuelve desde otro navegador solo le hace falta el código, así
      // que eso es lo único que se le da.
      if (existing.estado !== "confirmado") {
        const { error } = await registros().update(payload).eq("id", existing.id)
        if (error) {
          console.error("[solicitarCodigo] update:", error.message, error.code)
          return { ok: false, reason: "unknown" }
        }
      }
    } else {
      const { data, error } = await registros().insert(payload).select("id").single()
      if (error || !data) {
        console.error("[solicitarCodigo] insert:", error?.message, error?.code)
        return { ok: false, reason: "unknown" }
      }
      registroId = data.id
    }

    const sent = await emitirYEnviarCodigo(admin, registroId, email, input.nombre.trim())
    return sent.ok ? { ...sent, alreadyRegistered } : sent
  } catch (e) {
    console.error("[solicitarCodigo]", e)
    return { ok: false, reason: "unknown" }
  }
}

/**
 * Reenvía el código a un email ya inscrito (el "no me ha llegado").
 * No toca los datos del registro.
 */
export async function reenviarCodigo(rawEmail: string): Promise<RequestCodeResult> {
  try {
    const email = normalizeEmail(rawEmail)
    if (!EMAIL_RE.test(email)) return { ok: false, reason: "invalid" }

    const admin = await createAdminClient()
    const registro = await findRegistro(admin, email)

    if (!registro || registro.estado === "cancelado") {
      return { ok: false, reason: "notFound" }
    }
    // Un registro confirmado también puede pedir otro código: es el caso de
    // volver desde otro navegador. Ver el comentario de `solicitarCodigo`.

    const sent = await emitirYEnviarCodigo(admin, registro.id, email, registro.nombre ?? "")
    return sent.ok
      ? { ...sent, alreadyRegistered: registro.estado === "confirmado" }
      : sent
  } catch (e) {
    console.error("[reenviarCodigo]", e)
    return { ok: false, reason: "unknown" }
  }
}

/**
 * Emite un código y manda el correo con ese código.
 *
 * El trabajo fino —límites, hash, caducidad— está en `@/lib/conferencia-codigo`,
 * compartido con el panel. Aquí solo se compone el correo, que en este camino es
 * fijo a propósito: la plantilla editable del panel no puede tocar el correo que
 * alguien necesita para entrar.
 */
async function emitirYEnviarCodigo(
  admin: Admin,
  registroId: string,
  email: string,
  nombre: string
): Promise<IssueResult> {
  const emision = await emitirCodigo(admin, registroId, "publico")
  if (!emision.ok) return emision as IssueResult

  const { fromName, fromEmail } = await senderConfig(admin)
  const res = await sendResendEmail({
    to: email,
    subject: "Your confirmation code — IKMA Conference",
    html: buildConferenciaCodigoHtml({
      nombre,
      codigo: emision.codigo,
      minutos: CODE_TTL_MINUTES,
    }),
    fromName,
    fromEmail,
  })

  if (!res.ok) {
    // El código ya está guardado, así que si el correo falla el usuario puede
    // pedir otro con "reenviar". Se registra el detalle para diagnosticar.
    const cuerpo = await res.text().catch(() => "")
    console.error("[emitirYEnviarCodigo] resend:", res.status, cuerpo.slice(0, 300))
    return { ok: false, reason: "sendFailed" }
  }

  return { ok: true, cooldownSeconds: RESEND_COOLDOWN_SECONDS }
}

// ---------------------------------------------------------------- paso 2

/**
 * Comprueba el código y confirma la inscripción.
 *
 * Un código caducado no cuenta como intento: si contara, se podría agotar el
 * límite probando contra un código ya muerto y dejar al usuario sin salida
 * hasta pedir otro.
 */
export async function verificarCodigo(
  rawEmail: string,
  rawCode: string
): Promise<VerifyCodeResult> {
  try {
    const email = normalizeEmail(rawEmail)
    const code = rawCode.replace(/\D/g, "")

    if (!EMAIL_RE.test(email)) return { ok: false, reason: "notFound" }
    if (code.length !== CODE_DIGITS) return { ok: false, reason: "invalid" }

    const admin = await createAdminClient()
    const registro = await findRegistro(admin, email)

    if (!registro) return { ok: false, reason: "notFound" }

    // NO hay atajo para un registro ya confirmado. Antes esto devolvía
    // `{ ok: true }` sin mirar el código: declaraba una verificación exitosa
    // sin ninguna prueba. En ese momento no concedía nada porque la cookie se
    // escribe más abajo, pero era una puerta abierta en cuanto alguien moviera
    // esa línea. Ahora un email confirmado también tiene que pasar por el
    // código (se lo pide `solicitarCodigo` / `reenviarCodigo`).

    const codigos = () => admin.schema("conferencia").from("codigos")
    const { data: row } = await codigos()
      .select("id, code_hash, expires_at, intentos")
      .eq("registro_id", registro.id)
      .is("consumido_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!row) return { ok: false, reason: "notFound" }

    if (new Date(row.expires_at).getTime() < Date.now()) {
      return { ok: false, reason: "expired" }
    }

    if (row.intentos >= MAX_ATTEMPTS) {
      return { ok: false, reason: "tooManyAttempts" }
    }

    if (!hashesMatch(hashCode(code, registro.id), row.code_hash)) {
      const intentos = row.intentos + 1
      await codigos().update({ intentos }).eq("id", row.id)
      return intentos >= MAX_ATTEMPTS
        ? { ok: false, reason: "tooManyAttempts" }
        : { ok: false, reason: "wrongCode", attemptsLeft: MAX_ATTEMPTS - intentos }
    }

    const now = new Date().toISOString()
    const { error: verifyError } = await admin
      .schema("conferencia")
      .from("registros")
      .update({
        estado: "confirmado",
        // `verificado_at` es la PRIMERA verificación: si alguien vuelve desde
        // otro navegador y confirma otra vez, no se reescribe. Se conserva el
        // dato original para poder auditar cuándo se verificó de verdad.
        ...(registro.verificado_at ? {} : { verificado_at: now }),
      })
      .eq("id", registro.id)

    if (verifyError) {
      console.error("[verificarCodigo] update registro:", verifyError.message, verifyError.code)
      return { ok: false, reason: "unknown" }
    }

    await codigos().update({ consumido_at: now }).eq("id", row.id)

    // Correo. Dos caminos, y el segundo es el que importa cuando se inscribe
    // alguien a última hora:
    //
    //   · normal      → la plantilla de confirmación, que anuncia que el enlace
    //                   llega el 13 de noviembre.
    //   · dentro de las 24 h previas (y durante el evento) → **el enlace, ya**.
    //                   Esperar al envío manual del día antes dejaría a esa
    //                   persona fuera de la reunión sin que nadie se diera
    //                   cuenta, que es el fallo más caro posible aquí.
    //
    // Si todavía no hay enlace configurado se manda la confirmación igual: es
    // preferible un correo que llega a destiempo que ninguno.
    //
    // Nada de esto puede tumbar la verificación: el registro ya está confirmado
    // y el código consumido, así que si Resend falla se registra y se sigue.
    let correoEnviado = false
    let enlaceEnviado = false
    try {
      const { plantillas, urlEnlace } = (await getAjustes(admin)).data
      const { fromName, fromEmail } = await senderConfig(admin)

      const urgente = enVentanaDeEnlace() && urlEnlace !== ""
      const idPlantilla = urgente ? ("recordatorio" as const) : ("confirmacion" as const)
      const plantilla = plantillas[idPlantilla]
      const asunto = plantilla.asunto
      const html = componerCorreo(idPlantilla, plantilla.cuerpo, {
        nombre: registro.nombre ?? "",
        email,
        enlace: urlEnlace,
      })

      const envio = await sendResendEmail({ to: email, subject: asunto, html, fromName, fromEmail })
      if (urgente) enlaceEnviado = envio.ok
      else correoEnviado = envio.ok

      if (!envio.ok) {
        const cuerpo = await envio.text().catch(() => "")
        console.error("[verificarCodigo] correo:", envio.status, cuerpo.slice(0, 300))
      }

      // Segundo correo: el del ACCESO, con el enlace firmado que sirve para
      // volver a entrar desde cualquier navegador. Va aparte —y con su propia
      // plantilla editable— porque es otra cosa: la confirmación cuenta el
      // estado de la inscripción, esto entrega la llave. Así, si alguien pierde
      // la cookie, la llave está en su buzón desde el primer día.
      //
      // Si falla, la verificación NO se cae: se registra y se sigue.
      try {
        const plantillaAcceso = plantillas.acceso
        const enlace = enlaceAcceso(email, await baseDelSitio())
        const envioAcceso = await sendResendEmail({
          to: email,
          subject: plantillaAcceso.asunto,
          html: componerCorreo("acceso", plantillaAcceso.cuerpo, {
            nombre: registro.nombre ?? "",
            email,
            acceso: enlace,
          }),
          fromName,
          fromEmail,
        })
        await admin
          .schema("conferencia")
          .from("envios")
          .insert({
            registro_id: registro.id,
            email,
            asunto: plantillaAcceso.asunto,
            ok: envioAcceso.ok,
            error: envioAcceso.ok ? null : String(envioAcceso.status),
          })
        if (!envioAcceso.ok) {
          const cuerpo = await envioAcceso.text().catch(() => "")
          console.error("[verificarCodigo] acceso:", envioAcceso.status, cuerpo.slice(0, 300))
        }
      } catch (e) {
        console.error("[verificarCodigo] acceso:", e instanceof Error ? e.message : e)
      }

      // Se apunta en `envios`, que es la tabla que el panel usa para saber
      // cuántos correos ha recibido cada uno. Si esta escritura falla no pasa
      // nada: solo se pierde la anotación, no el correo.
      const { error: errorEnvio } = await admin
        .schema("conferencia")
        .from("envios")
        .insert({
          registro_id: registro.id,
          email,
          asunto,
          ok: envio.ok,
          error: envio.ok ? null : String(envio.status),
        })
      if (errorEnvio) console.error("[verificarCodigo] envios:", errorEnvio.message, errorEnvio.code)
    } catch (e) {
      console.error("[verificarCodigo] correo:", e instanceof Error ? e.message : e)
    }

    // Este navegador queda marcado como inscrito: no vuelve a ver el formulario
    // y el marco del riel le dice a qué correo va a llegar el enlace de Zoom.
    // No protege nada —no hay nada protegido— y la base manda igualmente:
    // `emailConfirmado()` comprueba el estado en cada visita.
    // Si ya contestó al aviso de «mantener la sesión», se respeta; si no, se
    // entra como persistente y se le pregunta en la landing.
    const preferencia = await preferenciaSesion()
    const jar = await cookies()
    jar.set(
      REGISTRO_COOKIE,
      valorCookieInscripcion(email),
      await opcionesCookieSesion(preferencia !== "sesion")
    )
    // Marca que sobrevive a la sesión: si algún día la pierde, la landing se lo
    // dirá en vez de ofrecerle el formulario otra vez.
    await marcarYaInscrito(jar)

    return { ok: true, correoEnviado, enlaceEnviado }
  } catch (e) {
    console.error("[verificarCodigo]", e)
    return { ok: false, reason: "unknown" }
  }
}

// ---------------------------------------------------------------- iniciar sesión

/**
 * Asunto con el que se registran los envíos de acceso en `envios`.
 *
 * Es el asunto POR DEFECTO de la plantilla, y se usa solo para contar los
 * reenvíos recientes: si alguien edita el asunto en el panel, el límite de un
 * enlace por minuto se apoya igualmente en las filas de `envios` con ese asunto
 * guardado en el momento del envío… por eso se compara contra el que tenía la
 * plantilla al enviar, no contra el actual.
 */
const ASUNTO_ACCESO_POR_DEFECTO = "Your sign-in link — IKMA Conference"

export type AccesoResult =
  | { ok: true }
  | { ok: false; reason: "noRegistrado" | "espera" | "fallo"; retryInSeconds?: number }

/**
 * «Iniciar sesión» sin contraseña.
 *
 * POR QUÉ EXISTE. La sesión vive en una cookie de ESE navegador: quien se
 * inscribió en el móvil y abre la web en el portátil veía el formulario otra vez
 * y volvía a inscribirse. Esto le da una puerta de vuelta sin pedirle una
 * contraseña que no tiene.
 *
 * QUÉ NO HACE. No crea cuentas ni toca `auth.users`: solo comprueba que el
 * correo esté en `conferencia.registros` con `estado = confirmado` —es decir,
 * que ya demostró que el buzón es suyo— y le manda un enlace firmado que marca
 * ese navegador como inscrito.
 *
 * SI EL CORREO NO ESTÁ, SE DICE. Se podría responder siempre «ok» para no
 * revelar quién está inscrito, pero eso deja al usuario esperando un correo que
 * no va a llegar: aquí interesa más que sepa que tiene que inscribirse.
 */
export async function solicitarAcceso(rawEmail: string): Promise<AccesoResult> {
  try {
    const email = normalizeEmail(rawEmail)
    if (!EMAIL_RE.test(email)) return { ok: false, reason: "noRegistrado" }

    const admin = await createAdminClient()
    const registro = await findRegistro(admin, email)
    if (!registro || registro.estado !== "confirmado") {
      return { ok: false, reason: "noRegistrado" }
    }

    const { plantillas } = (await getAjustes(admin)).data
    const plantilla = plantillas.acceso
    const asuntoActual = plantilla.asunto.trim() || ASUNTO_ACCESO_POR_DEFECTO

    // Un enlace cada 60 s por persona: sin esto, el formulario es un grifo
    // abierto para llenarle el buzón a cualquiera cuyo correo esté en la lista.
    const desde = new Date(Date.now() - 60_000).toISOString()
    const { data: reciente } = await admin
      .schema("conferencia")
      .from("envios")
      .select("created_at")
      .eq("registro_id", registro.id)
      .eq("asunto", asuntoActual)
      .gte("created_at", desde)
      .limit(1)

    if (reciente && reciente.length > 0) {
      const pasado = (Date.now() - new Date(reciente[0].created_at).getTime()) / 1000
      return { ok: false, reason: "espera", retryInSeconds: Math.max(1, Math.ceil(60 - pasado)) }
    }

    const { fromName, fromEmail } = await senderConfig(admin)
    const enlace = enlaceAcceso(email, await baseDelSitio())
    const envio = await sendResendEmail({
      to: email,
      subject: plantilla.asunto,
      html: componerCorreo("acceso", plantilla.cuerpo, {
        nombre: registro.nombre ?? "",
        email,
        acceso: enlace,
      }),
      fromName,
      fromEmail,
    })

    await admin
      .schema("conferencia")
      .from("envios")
      .insert({
        registro_id: registro.id,
        email,
        asunto: asuntoActual,
        ok: envio.ok,
        error: envio.ok ? null : String(envio.status),
      })

    if (!envio.ok) {
      const cuerpo = await envio.text().catch(() => "")
      console.error("[solicitarAcceso] resend:", envio.status, cuerpo.slice(0, 300))
      return { ok: false, reason: "fallo" }
    }

    return { ok: true }
  } catch (e) {
    console.error("[solicitarAcceso]", e instanceof Error ? e.message : e)
    return { ok: false, reason: "fallo" }
  }
}

// ---------------------------------------------------------------- la sesión

/**
 * Guarda lo que la persona conteste en el aviso de «mantener la sesión» y
 * reescribe la cookie en consecuencia.
 *
 *   · «mantener»      → cookie con 180 días de vida.
 *   · «solo esta vez» → la misma cookie SIN `maxAge`, que es lo que la convierte
 *                       en cookie de sesión: el navegador la borra al cerrarse.
 *
 * La preferencia se guarda aparte para no volver a preguntar en cada visita.
 */
export async function elegirPermanencia(permanecer: boolean): Promise<{ ok: boolean }> {
  const jar = await cookies()
  const email = emailDeCookieInscripcion(jar.get(REGISTRO_COOKIE)?.value ?? "")
  if (!email) return { ok: false }

  jar.set(REGISTRO_COOKIE, valorCookieInscripcion(email), await opcionesCookieSesion(permanecer))
  // La preferencia va con el MISMO dominio que la sesión: si fuera host-only,
  // al entrar por el otro hostname no se vería y volveríamos a preguntar.
  jar.set(
    SESION_PREF_COOKIE,
    permanecer ? "persistente" : "sesion",
    await opcionesCookiePreferencia()
  )
  await marcarYaInscrito(jar)

  return { ok: true }
}
