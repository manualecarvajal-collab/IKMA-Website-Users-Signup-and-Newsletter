import { createHash, randomInt, timingSafeEqual } from "crypto"
import type { createAdminClient } from "@/lib/supabase/server"

/**
 * Emisión y comprobación de los códigos de verificación.
 *
 * Vive aquí —y no dentro de las server actions— por un motivo concreto: lo usan
 * DOS caminos que tienen que comportarse igual.
 *
 *   1. el público, cuando alguien se inscribe o pide otro código en la landing;
 *   2. el del panel, cuando un administrador reenvía la verificación a quien se
 *      quedó a medias.
 *
 * Si estuviera exportado desde un fichero `"use server"`, cualquiera podría
 * llamarlo desde el navegador sin ser administrador y usar la web para inundar
 * de códigos la bandeja de un tercero. Este módulo NO es `"use server"`: es una
 * librería de servidor normal, y cada acción decide quién puede invocarla.
 */

export const CODE_DIGITS = 6
/** Cuánto vive un código. También es lo que dice el correo. */
export const CODE_TTL_MINUTES = 15
/** Intentos antes de quemar el código. */
export const MAX_ATTEMPTS = 5
/** Segundos entre dos códigos seguidos: frena el «dame otro» en bucle. */
export const RESEND_COOLDOWN_SECONDS = 60
/** Tope por hora en el camino público: es el que evita el abuso desde fuera. */
export const MAX_CODES_PER_HOUR = 5

type Admin = Awaited<ReturnType<typeof createAdminClient>>

/**
 * Hash del código con el id del registro como sal: el mismo código en dos
 * inscripciones da hashes distintos, así que no se puede precomputar una tabla.
 * En la base NUNCA vive el código en claro.
 */
export function hashCode(code: string, registroId: string): string {
  return createHash("sha256").update(`${code}:${registroId}`).digest("hex")
}

/** Comparación en tiempo constante: no se filtra por dónde falla la comparación. */
export function hashesMatch(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex")
  const bb = Buffer.from(b, "hex")
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

export function newCode(): string {
  // randomInt es criptográficamente seguro; Math.random no lo es.
  return String(randomInt(0, 10 ** CODE_DIGITS)).padStart(CODE_DIGITS, "0")
}

export type ResultadoEmision =
  | { ok: true; codigo: string }
  | { ok: false; reason: "cooldown"; retryInSeconds: number }
  | { ok: false; reason: "tooManyRequests" | "unknown" }

/**
 * Emite un código nuevo y lo guarda.
 *
 * NO envía nada: devuelve el código en claro para que quien llama componga el
 * correo que toque (el fijo del registro, o la plantilla de recordatorio).
 *
 * LIMITES. Los dos existen porque uno de los caminos es público: sin ellos,
 * cualquiera podría pedir códigos en nombre de un tercero hasta llenarle el
 * buzón. El del panel es de confianza y por eso puede saltarse el tope por hora
 * —quien lleva cinco intentos fallidos necesita que un humano le eche una mano—
 * pero conserva la espera de 60 s, que ahí también evita el doble clic.
 */
export async function emitirCodigo(
  admin: Admin,
  registroId: string,
  limites: "publico" | "admin" = "publico"
): Promise<ResultadoEmision> {
  const codigos = () => admin.schema("conferencia").from("codigos")
  const since = (ms: number) => new Date(Date.now() - ms).toISOString()

  const { data: recientes, error: errorLectura } = await codigos()
    .select("created_at")
    .eq("registro_id", registroId)
    .gte("created_at", since(60 * 60 * 1000))
    .order("created_at", { ascending: false })

  if (errorLectura) {
    console.error("[emitirCodigo] lectura:", errorLectura.message, errorLectura.code)
    return { ok: false, reason: "unknown" }
  }

  const pedidos = recientes ?? []
  if (limites === "publico" && pedidos.length >= MAX_CODES_PER_HOUR) {
    return { ok: false, reason: "tooManyRequests" }
  }

  if (pedidos.length > 0) {
    const pasado = (Date.now() - new Date(pedidos[0].created_at).getTime()) / 1000
    if (pasado < RESEND_COOLDOWN_SECONDS) {
      return {
        ok: false,
        reason: "cooldown",
        retryInSeconds: Math.ceil(RESEND_COOLDOWN_SECONDS - pasado),
      }
    }
  }

  const codigo = newCode()
  const { error: errorInsercion } = await codigos().insert({
    registro_id: registroId,
    code_hash: hashCode(codigo, registroId),
    expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString(),
  })

  if (errorInsercion) {
    console.error("[emitirCodigo] inserción:", errorInsercion.message, errorInsercion.code)
    return { ok: false, reason: "unknown" }
  }

  return { ok: true, codigo }
}
