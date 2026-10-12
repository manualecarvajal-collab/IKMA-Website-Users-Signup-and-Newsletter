import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies, headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/server"
import { esEstadoDirecto, type EstadoDirecto } from "@/components/conferencia/directo"

/**
 * Utilidades de servidor para la inscripción a la conferencia.
 *
 * Este módulo NO es `"use server"`: son funciones normales que solo se pueden
 * usar en el servidor (usa `next/headers`, que falla si se importa desde un
 * componente de cliente).
 */

/**
 * Cookie que recuerda qué correo está dentro EN ESTE navegador.
 *
 * SOLO la escribe una cosa: abrir el enlace que llega al correo
 * (`/conferencia/entrar`). Meter el código de verificación ya NO marca el
 * navegador —solo confirma que el correo es de quien lo metió—, y es a
 * propósito: así hay una única forma de entrar y es la misma que funciona en
 * cualquier dispositivo. Ver `enlaceAcceso`.
 */
export const REGISTRO_COOKIE = "conf_registro"

/** 180 días: cubre de sobra el ciclo de vida de la landing. */
export const REGISTRO_COOKIE_MAX_AGE = 60 * 60 * 24 * 180

/**
 * Hasta cuándo sirve el enlace de acceso.
 *
 * Un mes después de la conferencia: el recordatorio de la pantalla de
 * confirmación dice que "ese mismo enlace" sirve el día del evento, así que no
 * puede caducar antes. Pasada esta fecha deja de valer, para no dejar una llave
 * abierta para siempre.
 */
export const ENLACE_HASTA = "2026-12-14"

/**
 * Secreto para firmar los enlaces de acceso.
 *
 * Se prefiere uno propio, pero si no está configurado se usa la clave de
 * servicio de Supabase, que ya es un secreto de servidor: así el enlace funciona
 * sin obligar a configurar nada nuevo. La consecuencia, dicha clara: rotar esa
 * clave invalida los enlaces ya enviados.
 */
function secretoEnlace(): string {
  return (
    process.env.CONFERENCIA_LINK_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  )
}

function firmar(payload: string): string {
  return createHmac("sha256", secretoEnlace()).update(payload).digest("base64url")
}

/**
 * Enlace de acceso que viaja en el correo de bienvenida.
 *
 * Es una llave, no una dirección bonita: lleva el correo y la fecha tope
 * firmados con un HMAC. Sin el secreto no se puede fabricar uno, y abrirlo es lo
 * único que marca el navegador como "dentro".
 *
 * El dominio va escrito a mano por el mismo motivo que en el correo: en local
 * `NEXT_PUBLIC_SITE_URL` vale `localhost` y el enlace llegaría roto a una
 * bandeja de verdad.
 */
export function enlaceAcceso(email: string, base: string): string {
  const payload = `${normalizeEmail(email)}|${ENLACE_HASTA}`
  const token = `${Buffer.from(payload, "utf8").toString("base64url")}.${firmar(payload)}`
  return `${base}/conferencia/entrar?t=${token}`
}

/**
 * Dónde vive ESTE servidor: la base de los enlaces que se mandan por correo.
 *
 * Aquí NO vale fijar el dominio de producción a mano, y el motivo es la firma:
 * el enlace se firma con el secreto del entorno que lo genera, así que uno hecho
 * en local no vale en producción —producción no reconoce su firma— ni al revés.
 * Si el enlace apuntara siempre a producción, probar el flujo en local mandaría
 * correos con enlaces rotos, que es exactamente lo que pasó: un 404.
 *
 * Por eso la base sale de la propia petición: en producción es
 * `www.ikmaglobal.com` y en local `localhost:3000`, y cada uno valida lo suyo.
 *
 * La lista blanca no es decorativa: sin ella, un `Host` manipulado en la petición
 * haría que el correo llevara un enlace al dominio de otro. Si el host no es de
 * confianza, se cae al canónico de producción.
 */
const HOSTS_DE_CONFIANZA = [
  "www.ikmaglobal.com",
  "ikmaglobal.com",
  "localhost:3000",
  "127.0.0.1:3000",
]

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
 * Correo de un enlace de acceso, o `null` si el enlace no vale.
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

  const esperada = firmar(payload)
  const a = Buffer.from(firmaRecibida)
  const b = Buffer.from(esperada)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  const [email, hasta] = payload.split("|")
  if (!email || !hasta) return null

  // Comparar fechas ISO como texto es válido y no arrastra zonas horarias.
  const hoy = new Date().toISOString().slice(0, 10)
  if (hoy > hasta) return null

  return normalizeEmail(email)
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

type Admin = Awaited<ReturnType<typeof createAdminClient>>

export interface RegistroEncontrado {
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
 * base antes de darla por buena. **El acceso a la transmisión nunca debe
 * fiarse de esta cookie**: el estado real siempre sale de
 * `conferencia.registros.estado`.
 */
export async function emailConfirmado(): Promise<string | null> {
  const raw = (await cookies()).get(REGISTRO_COOKIE)?.value
  if (!raw) return null

  let email: string
  try {
    email = normalizeEmail(decodeURIComponent(raw))
  } catch {
    return null // cookie corrupta: se ignora en vez de reventar la página
  }
  if (!email) return null

  const admin = await createAdminClient()
  const registro = await findRegistro(admin, email)
  return registro?.estado === "confirmado" ? email : null
}

/**
 * Cómo está el directo ahora mismo.
 *
 * `estado` lo decide un administrador desde el panel (clave `directo_estado`
 * en `conferencia.ajustes`), no el reloj: la fecha del evento puede moverse y
 * la hora real de cada momento la sabe quien da al botón. Los cuatro estados y
 * su significado están en `components/conferencia/directo.ts`.
 */
export interface Directo {
  estado: EstadoDirecto
  /** Enlace de Zoom. No se puede incrustar, así que se abre como botón. */
  url: string
  /** URL incrustable (YouTube Live, Vimeo, HLS). Tiene prioridad sobre `url`. */
  embed: string
}

/**
 * Solo `http(s)`.
 *
 * El valor lo escribe un administrador, así que la amenaza es remota, pero
 * acaba dentro de un `href` y de un `src` de iframe: un `javascript:` ahí
 * sería XSS servido por nosotros. Validarlo cuesta una línea y es un límite de
 * confianza real, que es justo donde no se puede ser vago.
 */
function safeUrl(raw: string | undefined): string {
  const v = (raw ?? "").trim()
  return /^https?:\/\//i.test(v) ? v : ""
}

/**
 * Lee la configuración del directo.
 *
 * Devuelve el enlace aunque quien pregunte no esté inscrito: quien decide si
 * eso llega al navegador es `page.tsx`, que es donde el límite se ve. Filtrarlo
 * aquí a escondidas enterraría la decisión de seguridad dentro de una lib.
 */
export async function getDirecto(admin: Admin): Promise<Directo> {
  const { data } = await admin
    .schema("conferencia")
    .from("ajustes")
    .select("clave, valor")
    .in("clave", ["directo_estado", "directo_url", "directo_embed"])

  const mapa: Record<string, string> = {}
  for (const row of data ?? []) mapa[row.clave] = row.valor ?? ""

  return {
    // `ajustes` es clave/valor, así que el estado llega como texto libre y
    // puede ser cualquier cosa. Se valida aquí: un valor que no reconocemos
    // cae a `antes`, que no enseña nada a nadie.
    estado: esEstadoDirecto(mapa.directo_estado) ? mapa.directo_estado : "antes",
    url: safeUrl(mapa.directo_url),
    embed: safeUrl(mapa.directo_embed),
  }
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
