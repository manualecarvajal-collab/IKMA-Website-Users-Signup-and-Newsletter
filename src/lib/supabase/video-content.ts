import { createAdminClient } from "@/lib/supabase/server"

// Acceso al embed de un video, que desde la migración 00045 vive en
// `videos_contenido`: una tabla que no pueden leer `anon` ni los usuarios
// autenticados.
//
// Se lee con el service role y SIEMPRE desde el servidor, después de que la
// página haya decidido que este visitante puede ver el video. Es el mismo patrón
// que ya usan los PDF privados de las revistas.
//
// Compatibilidad: si la tabla todavía no existe (código nuevo desplegado antes de
// aplicar la migración), se devuelve el valor heredado que reciba el llamador,
// de modo que el despliegue funciona en cualquier orden.

type AdminClient = Awaited<ReturnType<typeof createAdminClient>>

function esTablaAusente(error: { code?: string } | null): boolean {
  // PGRST205 = PostgREST no encuentra la tabla; 42P01 = Postgres tampoco.
  return error?.code === "PGRST205" || error?.code === "42P01"
}

/** URL de reproducción de un video, o el valor heredado si no hay nada guardado. */
export async function getEmbedUrl(videoId: string, heredado?: string | null): Promise<string | null> {
  const admin = await createAdminClient()
  const { data, error } = await admin
    .from("videos_contenido")
    .select("embed_url")
    .eq("video_id", videoId)
    .maybeSingle()

  if (error) {
    if (!esTablaAusente(error)) {
      console.error("[video-content] no se pudo leer el embed:", error.message)
    }
    return heredado ?? null
  }
  return data?.embed_url ?? heredado ?? null
}

/** Igual que getEmbedUrl, para varios videos (tabla de administración). */
export async function getEmbedUrls(videoIds: string[]): Promise<Map<string, string>> {
  const mapa = new Map<string, string>()
  if (!videoIds.length) return mapa

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from("videos_contenido")
    .select("video_id, embed_url")
    .in("video_id", videoIds)

  if (error) {
    if (!esTablaAusente(error)) {
      console.error("[video-content] no se pudieron leer los embeds:", error.message)
    }
    return mapa
  }
  for (const fila of data ?? []) mapa.set(fila.video_id, fila.embed_url)
  return mapa
}

/**
 * Guarda el embed de un video.
 *
 * Escribe en `videos_contenido`; si la tabla aún no existe, cae a la columna
 * antigua para no perder el contenido antes de aplicar la migración.
 */
export async function guardarEmbedUrl(
  admin: AdminClient,
  videoId: string,
  embedUrl: string | null
): Promise<void> {
  const url = embedUrl?.trim() || null
  if (!url) return

  const { error } = await admin
    .from("videos_contenido")
    .upsert({ video_id: videoId, embed_url: url, updated_at: new Date().toISOString() }, { onConflict: "video_id" })

  if (!error) return

  if (esTablaAusente(error)) {
    // Despliegue antes de migrar: se mantiene el comportamiento anterior.
    const { error: errorColumna } = await admin.from("videos").update({ embed_url: url }).eq("id", videoId)
    if (errorColumna) console.error("[video-content] fallback embed_url:", errorColumna.message)
    return
  }
  console.error("[video-content] no se pudo guardar el embed:", error.message)
}
