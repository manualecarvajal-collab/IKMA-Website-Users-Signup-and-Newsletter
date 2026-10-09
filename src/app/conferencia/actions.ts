"use server"

import { createHash, randomInt, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/server"
import { sendResendEmail } from "@/lib/resend"
import {
  findRegistro,
  normalizeEmail,
  REGISTRO_COOKIE,
  REGISTRO_COOKIE_MAX_AGE,
} from "@/lib/conferencia"

/**
 * Inscripción a la conferencia en dos pasos.
 *
 *   1. `solicitarCodigo` — guarda al inscrito con `estado = 'nuevo'` y le
 *      manda un código de 6 dígitos al correo.
 *   2. `verificarCodigo` — comprueba el código y pasa el registro a
 *      `estado = 'confirmado'`.
 *
 * `estado` es la PUERTA DE ACCESO a la transmisión: sin `confirmado` no hay
 * acceso. Por eso la verificación no es decorativa.
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
  | { ok: true }
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

const CODE_DIGITS = 6
const CODE_TTL_MINUTES = 15
const MAX_ATTEMPTS = 5
const RESEND_COOLDOWN_SECONDS = 60
const MAX_CODES_PER_HOUR = 5

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Admin = Awaited<ReturnType<typeof createAdminClient>>

// ---------------------------------------------------------------- utilidades

function hashCode(code: string, registroId: string): string {
  // El id del registro hace de sal: el mismo código en dos inscripciones da
  // hashes distintos, así que no se puede precomputar una tabla.
  return createHash("sha256").update(`${code}:${registroId}`).digest("hex")
}

function hashesMatch(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex")
  const bb = Buffer.from(b, "hex")
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

function newCode(): string {
  // randomInt es criptográficamente seguro; Math.random no lo es.
  return String(randomInt(0, 10 ** CODE_DIGITS)).padStart(CODE_DIGITS, "0")
}

function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  )
}

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

function codeEmailHtml(name: string, code: string): string {
  return `
  <div style="font-family:Inter,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto">
    <div style="background:#0068B6;padding:28px 32px">
      <p style="margin:0;color:#fff;font-size:20px;font-weight:700">IKMA</p>
      <p style="margin:4px 0 0;color:rgba(255,255,255,.85);font-size:13px">2026 Conference</p>
    </div>
    <div style="padding:32px">
      <p style="margin:0 0 12px;font-size:16px;color:#1a1a1a">Hi ${escapeHtml(name)},</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#444">
        Use this code to confirm your registration for the conference:
      </p>
      <p style="margin:0 0 24px;font-size:34px;font-weight:700;letter-spacing:.18em;color:#0068B6">${code}</p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#777">
        It expires in ${CODE_TTL_MINUTES} minutes. If you didn't request
        this registration, you can ignore this message.
      </p>
    </div>
  </div>`
}

/**
 * Correo de bienvenida, tras confirmar la inscripción.
 *
 * Mismo aspecto que el del código —los correos quedaron fuera del rediseño— y en
 * inglés, como el resto.
 *
 * El botón lleva al LANDING, no al enlace de la transmisión. El enlace del
 * directo lo sirve la propia página y solo a quien tiene la inscripción
 * confirmada; mandarlo por correo sería abrir esa puerta por escrito, y
 * reenviar un correo es trivial.
 */
function welcomeEmailHtml(name: string): string {
  // El dominio real, escrito a mano y no leído del entorno.
  //
  // Este enlace sale en un correo: si depende de `NEXT_PUBLIC_SITE_URL`, en
  // local esa variable vale `http://localhost:3000` y el botón llegaba roto a
  // una bandeja de verdad. Fijarlo aquí hace imposible ese fallo en cualquier
  // entorno. `ikmaglobal.com` sin `www` responde 308 hacia esta misma URL, así
  // que esta es la forma canónica.
  const SITIO = "https://www.ikmaglobal.com"
  const landing = `${SITIO}/conferencia`
  const saludo = name.trim() ? `Hi ${escapeHtml(name.trim())},` : "Hi,"
  return `
    <div style="font-family:Inter,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto">
      <div style="background:#0068B6;padding:28px 32px">
        <p style="margin:0;color:#fff;font-size:20px;font-weight:700">IKMA</p>
        <p style="margin:4px 0 0;color:rgba(255,255,255,.85);font-size:13px">2026 Conference</p>
      </div>
      <div style="padding:32px">
        <p style="margin:0 0 12px;font-size:16px;color:#1a1a1a">${saludo}</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444">
          Your place at <strong>IKMA Forward</strong> is confirmed. We are glad
          to have you with us.
        </p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#444">
          <strong>Saturday, November 14, 2026 &middot; 9:00 AM (EST)</strong>
        </p>
        <p style="margin:0 0 28px">
          <a href="${landing}" style="display:inline-block;background:#0068B6;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:999px">
            Go to the conference
          </a>
        </p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#777">
          Keep this email. On the day, the live stream opens from that same page
          and only for registered attendees.
        </p>
      </div>
    </div>`
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

    const sent = await issueCode(admin, registroId, email, input.nombre.trim())
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

    const sent = await issueCode(admin, registro.id, email, registro.nombre ?? "")
    return sent.ok
      ? { ...sent, alreadyRegistered: registro.estado === "confirmado" }
      : sent
  } catch (e) {
    console.error("[reenviarCodigo]", e)
    return { ok: false, reason: "unknown" }
  }
}

/**
 * Emite y envía un código, aplicando cooldown y tope por hora.
 *
 * Los dos límites existen porque el formulario es público: sin ellos,
 * cualquiera podría usar la landing para inundar de correos la bandeja de un
 * tercero pidiendo códigos en su nombre.
 */
async function issueCode(
  admin: Admin,
  registroId: string,
  email: string,
  nombre: string
): Promise<IssueResult> {
  const codigos = () => admin.schema("conferencia").from("codigos")
  const since = (ms: number) => new Date(Date.now() - ms).toISOString()

  const { data: recent, error: readError } = await codigos()
    .select("created_at")
    .eq("registro_id", registroId)
    .gte("created_at", since(60 * 60 * 1000))
    .order("created_at", { ascending: false })

  if (readError) {
    console.error("[issueCode] read:", readError.message, readError.code)
    return { ok: false, reason: "unknown" }
  }

  const asked = recent ?? []
  if (asked.length >= MAX_CODES_PER_HOUR) return { ok: false, reason: "tooManyRequests" }

  if (asked.length > 0) {
    const elapsed = (Date.now() - new Date(asked[0].created_at).getTime()) / 1000
    if (elapsed < RESEND_COOLDOWN_SECONDS) {
      return {
        ok: false,
        reason: "cooldown",
        retryInSeconds: Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed),
      }
    }
  }

  const code = newCode()
  const { error: insertError } = await codigos().insert({
    registro_id: registroId,
    code_hash: hashCode(code, registroId),
    expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString(),
  })

  if (insertError) {
    console.error("[issueCode] insert:", insertError.message, insertError.code)
    return { ok: false, reason: "unknown" }
  }

  const { fromName, fromEmail } = await senderConfig(admin)
  const res = await sendResendEmail({
    to: email,
    subject: "Your confirmation code — IKMA Conference",
    html: codeEmailHtml(nombre, code),
    fromName,
    fromEmail,
  })

  if (!res.ok) {
    // El código ya está guardado, así que si el correo falla el usuario puede
    // pedir otro con "reenviar". Se registra el detalle para diagnosticar.
    const body = await res.text().catch(() => "")
    console.error("[issueCode] resend:", res.status, body.slice(0, 300))
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

    // Correo de bienvenida. NO puede tumbar la verificación: el registro ya está
    // confirmado y el código consumido, así que si Resend falla se registra y se
    // sigue. Dejar a alguien sin inscripción por un correo sería mucho peor que
    // no recibirlo.
    try {
      const { fromName, fromEmail } = await senderConfig(admin)
      const bienvenida = await sendResendEmail({
        to: email,
        subject: "You're in — IKMA Conference",
        html: welcomeEmailHtml(registro.nombre ?? ""),
        fromName,
        fromEmail,
      })
      if (!bienvenida.ok) {
        const cuerpo = await bienvenida.text().catch(() => "")
        console.error("[verificarCodigo] bienvenida:", bienvenida.status, cuerpo.slice(0, 300))
      }
    } catch (e) {
      console.error("[verificarCodigo] bienvenida:", e instanceof Error ? e.message : e)
    }


    // Se recuerda en el navegador para que al recargar no vuelva a salir el
    // formulario. Es solo comodidad: el estado que de verdad manda sigue
    // estando en la base, y al leerlo se vuelve a comprobar (emailConfirmado
    // nunca se fía de la cookie).
    ;(await cookies()).set(REGISTRO_COOKIE, encodeURIComponent(email), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: REGISTRO_COOKIE_MAX_AGE,
    })

    return { ok: true }
  } catch (e) {
    console.error("[verificarCodigo]", e)
    return { ok: false, reason: "unknown" }
  }
}

/**
 * Olvida la inscripción recordada en este navegador.
 *
 * Hace falta para el caso de un equipo compartido: sin esto, quien se inscribe
 * primero deja al siguiente viendo "ya estás dentro" y sin manera de
 * registrarse con su propio correo. No borra nada de la base.
 */
export async function olvidarRegistro(): Promise<void> {
  ;(await cookies()).delete(REGISTRO_COOKIE)
}
