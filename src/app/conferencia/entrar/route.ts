import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import {
  REGISTRO_COOKIE,
  REGISTRO_COOKIE_MAX_AGE,
  emailDeEnlace,
  findRegistro,
  valorCookieInscripcion,
} from "@/lib/conferencia"

/**
 * La puerta de entrada: `/conferencia/entrar?t=<credencial>`.
 *
 * Aquí, y solo aquí, un navegador pasa a estar "dentro". El enlace llega en el
 * correo de bienvenida, que se manda al confirmar el código. Meter el código ya
 * no marca nada: sirve para demostrar que el correo es de quien lo metió.
 *
 * El porqué de dejarlo en una sola puerta: es la única forma de entrar que
 * funciona igual en el celular que en la laptop. Una cookie no viaja entre
 * navegadores, pero el correo sí lo tiene la persona.
 *
 * No se fía ni del enlace ni de la cookie: comprueba la firma del enlace y,
 * además, que en la base la inscripción esté CONFIRMADA. Si alguien se inventara
 * un enlace válido para un correo sin confirmar, aquí se quedaría fuera.
 *
 * Los fallos vuelven a la landing con un motivo en la dirección
 * (`?enlace=novale` / `?enlace=sinconfirmar`), que el formulario enseña. Un
 * enlace caducado no puede dejar al usuario en una pantalla en blanco.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t") ?? ""
  const email = emailDeEnlace(token)

  const volver = (motivo: string) =>
    NextResponse.redirect(new URL(`/conferencia?enlace=${motivo}`, request.url))

  if (!email) return volver("novale")

  const registro = await findRegistro(await createAdminClient(), email)
  if (registro?.estado !== "confirmado") return volver("sinconfirmar")

  // Se entra a la página de PONENTES, que es el sitio que se decidió para esto:
  // el enlace del correo deja al usuario ahí, con el navegador ya marcado, y
  // desde esa misma página tiene el botón "Ver la conferencia" para entrar a la
  // transmisión (que es lo que el correo promete para el día del evento).
  const respuesta = NextResponse.redirect(
    new URL("/conferencia/speakers", request.url)
  )

  respuesta.cookies.set(REGISTRO_COOKIE, valorCookieInscripcion(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: REGISTRO_COOKIE_MAX_AGE,
  })

  return respuesta
}
