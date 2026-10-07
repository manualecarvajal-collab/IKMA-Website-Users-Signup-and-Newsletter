import { NextResponse } from "next/server"
import { emailConfirmado, getDirecto } from "@/lib/conferencia"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * Estado del directo, para que la landing se entere de los cambios sin que el
 * visitante recargue.
 *
 * La landing se renderiza en el servidor, así que cambiar el estado desde el
 * panel no llegaba a quien ya tenía la página abierta: había que recargar a
 * mano. Esto es lo único que consulta `DirectoVivo` cada 20 s.
 *
 * Devuelve SOLO el estado y, si hay inscripción confirmada en esta cookie, los
 * dos enlaces. Es la misma regla que aplica `page.tsx` al renderizar: si las
 * URLs viajaran en este sondeo, la pantalla de bloqueo sería decorativa —
 * bastaría con mirar la respuesta de red.
 */
export const dynamic = "force-dynamic"

export async function GET() {
  const [confirmado, directo] = await Promise.all([
    emailConfirmado(),
    getDirecto(await createAdminClient()),
  ])

  return NextResponse.json(
    {
      estado: directo.estado,
      url: confirmado ? directo.url : "",
      embed: confirmado ? directo.embed : "",
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
