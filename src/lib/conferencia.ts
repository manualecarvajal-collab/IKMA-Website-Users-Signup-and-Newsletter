import { cookies } from "next/headers"
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
 * Cookie que recuerda qué correo quedó confirmado en ESTE navegador.
 *
 * Existe porque sin ella, al recargar la página el formulario volvía a
 * aparecer aunque el usuario ya estuviera inscrito: el paso del formulario
 * solo vivía en memoria.
 */
export const REGISTRO_COOKIE = "conf_registro"

/** 180 días: cubre de sobra el ciclo de vida de la landing. */
export const REGISTRO_COOKIE_MAX_AGE = 60 * 60 * 24 * 180

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
