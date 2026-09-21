/**
 * Fuente única de verdad para el dominio y la identidad del sitio.
 *
 * El host canónico es `www.ikmaglobal.com`: Vercel fuerza un 308 desde el apex,
 * y Supabase Auth ya redirige ahí tras la confirmación de email. Todo el SEO
 * (metadataBase, canonical, sitemap, robots, JSON-LD) debe apuntar aquí para no
 * declarar URLs que redirigen.
 *
 * No usar `NEXT_PUBLIC_SITE_URL` para metadatos SEO: esa variable existe para
 * redirects de auth y Stripe y su valor cambia entre local y producción.
 */
export const SITE_URL = "https://www.ikmaglobal.com"

export const SITE_NAME = "IKMA"

export const SITE_LEGAL_NAME = "International Kingdom Medical Association"

/** Título por defecto y plantilla de `<title>` para el resto de páginas. */
export const SITE_TITLE = "IKMA - International Kingdom Medical Association"

export const SITE_DESCRIPTION =
  "Healing through faith and excellence. A mission-driven medical association dedicated to providing accessible, high-quality healthcare and funding to those in need."

/** Construye una URL absoluta canónica a partir de una ruta interna. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString()
}
