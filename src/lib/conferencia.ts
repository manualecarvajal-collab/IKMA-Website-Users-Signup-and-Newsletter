import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies, headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * Utilidades de servidor para la inscripción a la conferencia.
 *
 * Este módulo NO es `"use server"`: son funciones normales que solo se pueden
 * usar en el servidor (usa `next/headers`, que falla si se importa desde un
 * componente de cliente).
 *
 * QUÉ YA NO HAY AQUÍ, Y POR QUÉ. La conferencia se transmite por Zoom y el
 * enlace de la reunión se manda por correo 24 horas antes; la landing solo
 * recoge inscripciones. Con eso desaparecieron el enlace de acceso firmado
 * (`/conferencia/entrar`), la cookie cosmética de "confirmado pero sin abrir el
 * enlace", el estado del directo y la lectura de sus URLs: no hay nada que
 * desbloquear, así que no hace falta ninguna llave.
 */

/**
 * Cookie que recuerda qué correo se inscribió EN ESTE navegador.
 *
 * La escribe el código de verificación: meter los 6 dígitos que llegaron al
 * buzón es la prueba de que el correo es de quien lo metió, y con eso basta.
 * No da acceso a nada —no hay nada protegido— así que solo se usa para no
 * volver a enseñarle el formulario a quien ya se inscribió.
 */
export const REGISTRO_COOKIE = "conf_registro"

/** 180 días: cubre de sobra el ciclo de vida de la landing. */
export const REGISTRO_COOKIE_MAX_AGE = 60 * 60 * 24 * 180

/**
 * Cookie con la PREFERENCIA de sesión: «persistente» o «sesion».
 *
 * Es lo que contesta el aviso que sale al entrar por primera vez. Se guarda
 * aparte de `conf_registro` porque sobrevive a ella: cuando la sesión caduque o
 * se cierre, la preferencia sigue ahí para no volver a preguntar.
 */
export const SESION_PREF_COOKIE = "conf_sesion"
export type PreferenciaSesion = "persistente" | "sesion"

/**
 * Marca de «aquí ya se inscribió alguien».
 *
 * NO da acceso a nada y sobrevive a propósito a la sesión: sirve para que, si la
 * persona vuelve y su sesión se perdió —navegador nuevo, webview de Instagram,
 * cookies borradas—, la landing se lo diga («¿ya te habías inscrito? entra con
 * tu correo») en vez de ofrecerle el formulario vacío y empujarla a inscribirse
 * por segunda vez, que es el problema que estamos persiguiendo.
 */
export const YA_INSCRITO_COOKIE = "conf_ya_inscrito"

/**
 * Opciones de la cookie de sesión, iguales en todos los sitios que la escriben.
 *
 * DOS COSAS QUE ARREGLAN FALLOS REALES:
 *
 *  1. EL DOMINIO. Sin `domain`, la cookie es «host-only»: la que se escribe en
 *     `www.ikmaglobal.com` NO vale en `ikmaglobal.com` y al revés. Como el sitio
 *     responde en los dos (uno redirige al otro), alguien podía inscribirse en
 *     un hostname y «perder» la sesión al volver por el otro. Con
 *     `domain=.ikmaglobal.com` vale en ambos.
 *  2. LA DURACIÓN. Si la persona eligió «solo esta vez», la cookie va SIN
 *     `maxAge`: el navegador la borra al cerrarse. Si no, 180 días.
 *
 * En local NO se pone `domain`: una cookie de dominio para localhost no vale y
 * rompería el flujo de pruebas.
 */
export async function opcionesCookieSesion(permanente: boolean) {
  const opciones: {
    httpOnly: boolean
    sameSite: "lax"
    secure: boolean
    path: string
    maxAge?: number
    domain?: string
  } = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  }

  if (permanente) opciones.maxAge = REGISTRO_COOKIE_MAX_AGE

  const host = ((await headers()).get("host") ?? "").toLowerCase()
  if (host === "ikmaglobal.com" || host === "www.ikmaglobal.com") {
    opciones.domain = ".ikmaglobal.com"
  }

  return opciones
}

/**
 * Opciones de la cookie de PREFERENCIA.
 *
 * Las mismas que la de sesión pero siempre de larga duración: la preferencia es
 * una decisión, no una sesión. Y con el mismo `domain`: si se escribiera
 * host-only, al entrar por el otro hostname no se vería y volveríamos a
 * preguntar lo mismo una y otra vez.
 */
export async function opcionesCookiePreferencia() {
  const { maxAge: _ignorado, ...resto } = await opcionesCookieSesion(true)
  void _ignorado
  return { ...resto, maxAge: REGISTRO_COOKIE_MAX_AGE }
}

/**
 * Deja la marca de «ya inscrito» en este navegador. Sin ella no hay forma de
 * distinguir a un visitante nuevo de alguien que perdió la sesión.
 */
export async function marcarYaInscrito(
  jar: Awaited<ReturnType<typeof cookies>>
): Promise<void> {
  jar.set(YA_INSCRITO_COOKIE, "1", await opcionesCookiePreferencia())
}

/** ¿Este navegador ya tuvo una sesión de la conferencia? */
export async function huboSesionPrevia(): Promise<boolean> {
  return (await cookies()).get(YA_INSCRITO_COOKIE)?.value === "1"
}

/** Qué contestó la persona en el aviso de «mantener la sesión», si contestó. */
export async function preferenciaSesion(): Promise<PreferenciaSesion | null> {
  const valor = (await cookies()).get(SESION_PREF_COOKIE)?.value
  return valor === "persistente" || valor === "sesion" ? valor : null
}

/**
 * Secreto para firmar el valor de la cookie.
 *
 * Se prefiere uno propio, pero si no está configurado se usa la clave de
 * servicio de Supabase, que ya es un secreto de servidor: así funciona sin
 * obligar a configurar nada nuevo. La consecuencia, dicha clara: rotar esa
 * clave invalida las cookies ya entregadas (la gente tendría que inscribirse
 * otra vez, que es molesto pero no rompe nada).
 */
function secretoFirma(): string {
  return process.env.CONFERENCIA_LINK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ""
}

function firmar(payload: string): string {
  return createHmac("sha256", secretoFirma()).update(payload).digest("base64url")
}

/**
 * Valor firmado que se guarda en la cookie de inscripción.
 *
 * POR QUÉ NO VALE SOLO EL CORREO. La cookie la escribe el navegador de quien la
 * recibe, así que cualquiera puede escribir la suya a mano. Mientras el valor
 * fue el correo a secas, bastaba con saber el correo de alguien ya confirmado
 * para que el servidor lo tratara como esa persona: comprobado. Ahora el valor
 * lleva el correo MÁS una firma HMAC con el secreto del servidor, y sin ese
 * secreto no se puede fabricar.
 *
 * El correo va codificado para que quepa en una cookie sin caracteres raros, y
 * la firma es base64url, que no lleva puntos: por eso se puede partir por el
 * ÚLTIMO punto sin ambigüedad.
 */
export function valorCookieInscripcion(email: string): string {
  const limpio = normalizeEmail(email)
  return `${encodeURIComponent(limpio)}.${firmar(`inscripcion:${limpio}`)}`
}

/**
 * Correo que hay dentro de una cookie de inscripción, o `null` si el valor no
 * está firmado por nosotros. No consulta la base: eso lo hace quien llama.
 */
export function emailDeCookieInscripcion(valor: string): string | null {
  const corte = valor.lastIndexOf(".")
  if (corte <= 0) return null

  let email: string
  try {
    email = normalizeEmail(decodeURIComponent(valor.slice(0, corte)))
  } catch {
    return null // cookie corrupta: se ignora en vez de reventar la página
  }
  if (!email) return null

  const a = Buffer.from(valor.slice(corte + 1))
  const b = Buffer.from(firmar(`inscripcion:${email}`))
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  return email
}

/* ------------------------------------------------------------------ acceso */

/**
 * Cuánto vale el enlace de acceso.
 *
 * Un mes: cubre de sobra el ciclo de la conferencia y evita que alguien tenga
 * que pedir otro la víspera. Pasado ese plazo deja de valer, para no dejar una
 * llave abierta para siempre.
 */
export const ACCESO_DIAS = 30

/** El enlace de acceso caduca el día que se cumple el plazo, en ISO corto. */
function fechaLimite(ahora = Date.now()): string {
  return new Date(ahora + ACCESO_DIAS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

/**
 * Enlace que entra en la cuenta SIN CONTRASEÑA.
 *
 * Es el corazón del «iniciar sesión»: quien lo abre en cualquier navegador
 * queda marcado como inscrito. Por eso lleva el correo y la fecha tope firmados
 * con un HMAC del servidor — sin el secreto no se puede fabricar uno, y por
 * tanto no se puede entrar como otra persona sabiendo su correo.
 *
 * El dominio sale de `baseDelSitio()`: en local tiene que apuntar a localhost y
 * en producción al dominio real, porque la firma la valida el entorno que la
 * generó.
 */
export function enlaceAcceso(email: string, base: string): string {
  const payload = `${normalizeEmail(email)}|${fechaLimite()}`
  const token = `${Buffer.from(payload, "utf8").toString("base64url")}.${firmar(payload)}`
  return `${base}/conferencia/acceso/validar?t=${token}`
}

/**
 * De dónde cuelga ESTE servidor, para armar los enlaces que van por correo.
 *
 * No se puede fijar el dominio de producción a mano: en local el enlace tiene
 * que apuntar a localhost, porque la firma la valida el entorno que la generó.
 * La lista blanca no es decorativa: sin ella, un `Host` manipulado haría que el
 * correo llevara un enlace al dominio de otro. Si el host no es de confianza se
 * cae al canónico de producción.
 */
const HOSTS_DE_CONFIANZA = ["www.ikmaglobal.com", "ikmaglobal.com", "localhost:3000", "127.0.0.1:3000"]

export async function baseDelSitio(): Promise<string> {
  const host = ((await headers()).get("host") ?? "").toLowerCase()

  // Los despliegues de Vercel (preview incluidos) también son de confianza: son
  // los únicos donde se puede probar el enlace de verdad antes de publicarlo.
  if (host.endsWith(".vercel.app")) return `https://${host}`

  if (HOSTS_DE_CONFIANZA.includes(host)) {
    const local = host.startsWith("localhost") || host.startsWith("127.")
    return `${local ? "http" : "https"}://${host}`
  }

  return "https://www.ikmaglobal.com"
}

/**
 * Correo de un enlace de acceso, o `null` si no vale.
 *
 * Comprueba tres cosas y en este orden: que venga la firma, que la firma sea la
 * nuestra (comparada en tiempo constante, como el código OTP) y que no hayamos
 * pasado la fecha tope.
 */
export function emailDeEnlace(token: string): string | null {
  const [cuerpo, firmaRecibida] = token.split(".")
  if (!cuerpo || !firmaRecibida) return null

  let payload: string
  try {
    payload = Buffer.from(cuerpo, "base64url").toString("utf8")
  } catch {
    return null
  }

  const a = Buffer.from(firmaRecibida)
  const b = Buffer.from(firmar(payload))
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  const [email, hasta] = payload.split("|")
  if (!email || !hasta) return null

  // Comparar fechas ISO como texto es válido y no arrastra zonas horarias.
  if (new Date().toISOString().slice(0, 10) > hasta) return null

  return normalizeEmail(email)
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

type Admin = Awaited<ReturnType<typeof createAdminClient>>

interface RegistroEncontrado {
  id: string
  nombre: string | null
  email: string | null
  estado: string
  verificado_at: string | null
}

/**
 * Busca la inscripción de un email.
 *
 * Filtra en la base con `ilike` (insensible a mayúsculas, que es como está
 * definido el índice único sobre `lower(email)`) y después compara **exacto**
 * en JS.
 *
 * El doble paso hace falta de verdad: en SQL `_` y `%` son comodines, así que
 * un correo como `ana_lopez@x.com` haría coincidir también `anaXlopez@x.com`
 * y podríamos acabar modificando la inscripción de otra persona. El filtro de
 * la base es solo un superconjunto; la comparación que decide es la de JS.
 */
export async function findRegistro(
  admin: Admin,
  email: string
): Promise<RegistroEncontrado | null> {
  const { data } = await admin
    .schema("conferencia")
    .from("registros")
    .select("id, nombre, email, estado, verificado_at")
    .ilike("email", email)

  return (data ?? []).find((r) => (r.email ?? "").toLowerCase() === email) ?? null
}

/**
 * Email confirmado en este navegador, o `null`.
 *
 * OJO: el valor de la cookie NO se cree por sí solo. Una cookie la puede
 * escribir cualquiera desde el navegador, así que aquí se comprueba contra la
 * base antes de darla por buena (firma válida + `estado = confirmado`).
 *
 * Se usa para decidir qué pinta la landing —formulario o "ya estás dentro"—,
 * nunca como permiso para nada delicado.
 */
export async function emailConfirmado(): Promise<string | null> {
  const raw = (await cookies()).get(REGISTRO_COOKIE)?.value
  if (!raw) return null

  // Sin firma no hay nada que comprobar: es una cookie inventada o de antes de
  // que existiera la firma, y en los dos casos se trata como si no estuviera.
  const email = emailDeCookieInscripcion(raw)
  if (!email) return null

  // Y aun con firma válida, manda la base.
  const admin = await createAdminClient()
  const registro = await findRegistro(admin, email)
  return registro?.estado === "confirmado" ? email : null
}

/**
 * Enlace de la reunión de Zoom, tal como lo pega un administrador en el panel
 * (clave `plantilla_recordatorio_url` de `conferencia.ajustes`).
 *
 * OJO CON QUIÉN LO PIDE. Esta función devuelve el enlace a quien pregunte; el
 * límite está en `page.tsx`, que solo lo pide para un inscrito y solo dentro de
 * la ventana del evento. Esconderlo aquí a escondidas enterraría la decisión de
 * seguridad dentro de una lib, que es justo donde no se puede ser vago.
 *
 * Se filtra a `http(s)`: el valor acaba en un `href`, y un `javascript:` ahí
 * sería XSS servido por nosotros.
 */
export async function getEnlaceReunion(admin: Admin): Promise<string> {
  const { data } = await admin
    .schema("conferencia")
    .from("ajustes")
    .select("valor")
    .eq("clave", "plantilla_recordatorio_url")
    .maybeSingle()

  const valor = (data?.valor ?? "").trim()
  return /^https?:\/\//i.test(valor) ? valor : ""
}

/**
 * Remitente del sitio, el mismo que usan el resto de correos (tabla
 * `app_config` del schema `public`).
 *
 * Es una lectura deliberada: la conferencia está aislada en escritura, pero
 * compartir el remitente evita mandar correos desde una dirección distinta a
 * la del sitio.
 */
export async function getSenderConfig(admin: Admin) {
  const { data } = await admin.from("app_config").select("*")
  const config: Record<string, string> = {}
  for (const row of data ?? []) config[row.key] = row.value
  return {
    fromName: config.email_from_name || "IKMA",
    fromEmail: config.email_from_email || "onboarding@resend.dev",
  }
}
