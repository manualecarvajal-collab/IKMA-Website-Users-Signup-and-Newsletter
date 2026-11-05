import { NextResponse } from "next/server"
import { REGISTRO_COOKIE } from "@/lib/conferencia"

/**
 * Cerrar sesión.
 *
 * POR QUÉ ES UNA RUTA Y NO UNA SERVER ACTION. La cookie de sesión se escribe con
 * `Domain=.ikmaglobal.com` (para que valga en el dominio y en su www), pero una
 * acción no puede emitir dos `Set-Cookie` del mismo nombre: el tarro de cookies
 * de Next está indexado por nombre y el segundo pisa al primero. Y hacen falta
 * DOS borrados, porque en el navegador pueden convivir dos cookies con el mismo
 * nombre y distinto ámbito:
 *
 *   · la de dominio, que es la que escribimos ahora;
 *   · la «host-only» antigua, de antes de añadir el `Domain`.
 *
 * Si solo se borra una, la otra sigue viva y el usuario sigue dentro aunque
 * pulse «cerrar sesión» — que es exactamente el fallo que había: se borraba sin
 * `Domain` y la cookie de dominio sobrevivía. Aquí se emiten los dos
 * `Set-Cookie` a mano, con `headers.append`, que sí admite repetir cabecera.
 *
 * Y como es un GET normal, funciona aunque el JavaScript falle.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const host = (request.headers.get("host") ?? "").toLowerCase()
  const esDominioReal = host === "ikmaglobal.com" || host === "www.ikmaglobal.com"

  const respuesta = NextResponse.redirect(new URL("/conferencia", url.origin))

  // Atributos comunes a los dos borrados. `Secure` solo en producción: en local
  // el navegador descartaría la cookie y no se podría probar nada.
  const atributos =
    `Path=/; Max-Age=0; HttpOnly; SameSite=Lax` +
    (process.env.NODE_ENV === "production" ? "; Secure" : "")

  // 1 · la cookie de dominio (la que escribe el código actual).
  if (esDominioReal) {
    respuesta.headers.append(
      "set-cookie",
      `${REGISTRO_COOKIE}=; ${atributos}; Domain=.ikmaglobal.com; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    )
  }

  // 2 · la host-only, con y sin dominio real: cubre a quien tenga la vieja.
  respuesta.headers.append(
    "set-cookie",
    `${REGISTRO_COOKIE}=; ${atributos}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  )

  // La preferencia de sesión (conf_sesion) NO se borra: es una decisión del
  // usuario, no una sesión. Si no, se le volvería a preguntar en cada entrada.

  return respuesta
}
