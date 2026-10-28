import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
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
function emailDeCookieInscripcion(valor: string): string | null {
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
