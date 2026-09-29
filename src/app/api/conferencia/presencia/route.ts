import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * Latido de presencia de la landing de la conferencia.
 *
 * OJO CON LO QUE MIDE: cuenta gente **con la página abierta**, no gente
 * viendo. El directo todavía no existe. Cuando haya reproductor habrá que
 * atar esto a que esté reproduciendo de verdad.
 *
 * No guarda nada personal: solo un identificador de sesión anónimo que genera
 * el navegador y la última vez que dio señales.
 */

/** Los ids son aleatorios del navegador; se exige forma para no meter basura. */
const ID_RE = /^[A-Za-z0-9_-]{8,64}$/

/** Un latido más viejo que esto ya no cuenta como conectado. */
const VIDA_MINUTOS = 10

export async function POST(req: Request) {
  let sesion: unknown
  try {
    ;({ sesion } = await req.json())
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (typeof sesion !== "string" || !ID_RE.test(sesion)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  try {
    const admin = await createAdminClient()
    const tabla = () => admin.schema("conferencia").from("presencia")

    await tabla().upsert(
      { sesion_id: sesion, last_seen: new Date().toISOString() },
      { onConflict: "sesion_id" }
    )

    // Autolimpieza: el endpoint es público, así que la tabla no puede crecer
    // sin control. Borrar lo viejo en cada latido es barato (índice por
    // last_seen) y evita tener que montar un cron solo para esto.
    const limite = new Date(Date.now() - VIDA_MINUTOS * 60 * 1000).toISOString()
    await tabla().delete().lt("last_seen", limite)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[presencia]", e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
