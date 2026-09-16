// Validación del embed de un video.
//
// Vivía dentro de la página del reproductor, donde no se podía probar. Es la
// última barrera entre un valor guardado (por un admin, pero también heredado de
// datos antiguos) y un <iframe> en el navegador del miembro, así que merece
// pruebas propias.

export const DOMINIOS_EMBED_PERMITIDOS = [
  "www.youtube.com",
  "youtube.com",
  "youtu.be",
  "player.vimeo.com",
  "subsplash.com",
]

/**
 * Devuelve la URL lista para un <iframe>, o null si no es utilizable.
 *
 * Acepta tanto una URL suelta como el bloque `<iframe src="...">` completo que
 * los admins pegan desde el proveedor.
 */
export function embedSrcSeguro(value: string | null | undefined): string | null {
  if (!value) return null
  const src = value.match(/src="([^"]+)"/)?.[1] ?? value
  try {
    const u = new URL(src)
    if (u.protocol !== "https:") return null
    return DOMINIOS_EMBED_PERMITIDOS.includes(u.hostname) ? u.toString() : null
  } catch {
    return null
  }
}

/**
 * Extrae la URL del `src` para guardarla, sin validar el dominio: el admin puede
 * añadir un proveedor nuevo y no queremos que el guardado lo rechace (el
 * reproductor aplica la lista permitida al mostrar).
 */
export function extraerEmbedSrc(value: string): string {
  return value.match(/src="([^"]+)"/)?.[1] ?? value
}
