import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  findRegistro,
  emailDeEnlace,
  valorCookieInscripcion,
  opcionesCookieSesion,
  preferenciaSesion,
  REGISTRO_COOKIE,
} from "@/lib/conferencia"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * Canjea el enlace del correo y deja la sesión iniciada.
 *
 * Es una RUTA y no una página por un motivo técnico: las páginas no pueden
 * escribir cookies en Next (solo lo permiten las server actions y las rutas), y
 * aquí lo único que hay que hacer es eso —marcar este navegador— para luego
 * mandar al usuario a la landing ya en estado de sesión iniciada.
 *
 * Tres comprobaciones, en este orden:
 *   1. que el enlace venga firmado por nosotros y no haya caducado;
 *   2. que ese correo exista y esté CONFIRMADO en la base — una firma válida de
 *      un correo sin confirmar no vale;
 *   3. solo entonces se escribe la cookie (firmada también, con su propio HMAC).
 *
 * Si algo falla se vuelve al formulario de acceso con un motivo, en vez de
 * dejar al usuario en una página en blanco sin saber qué pasó.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("t") ?? ""
  const email = emailDeEnlace(token)

  const volver = (motivo: string) =>
    NextResponse.redirect(new URL(`/conferencia/acceso?error=${motivo}`, url.origin))

  if (!email) return volver("enlace")

  const registro = await findRegistro(await createAdminClient(), email)
  if (!registro || registro.estado !== "confirmado") return volver("registro")

  // Las MISMAS opciones que usan la verificación y el aviso de permanencia: si
  // esta ruta escribiera una cookie «host-only», conviviría con la de dominio y
  // cerrar sesión volvería a dejar una viva.
  const destino = NextResponse.redirect(new URL("/conferencia", url.origin))
  destino.cookies.set(
    REGISTRO_COOKIE,
    valorCookieInscripcion(email),
    await opcionesCookieSesion((await preferenciaSesion()) !== "sesion")
  )
  return destino
}
