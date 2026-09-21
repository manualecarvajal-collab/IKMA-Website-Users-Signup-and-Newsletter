import type { Metadata } from "next"
import { SITE_NAME, absoluteUrl } from "./site"

interface PageSeoOptions {
  title: string
  description: string
  /**
   * Ruta interna canónica, empezando por `/`. Se resuelve contra `metadataBase`
   * (el host www) para producir la URL absoluta.
   *
   * IMPORTANTE: nunca poner un `canonical` en el root layout. Next.js lo hereda
   * a toda página que no lo sobrescriba, de modo que una página olvidada se
   * declararía canónica de la home y Google la sacaría del índice.
   */
  path: string
  /** Imagen social. Por defecto la tarjeta Open Graph del sitio. */
  image?: string | null
  /** `true` solo para páginas de conversión o utilidad, nunca para contenido. */
  noindex?: boolean
  /** `article` para entradas de blog; `website` por defecto. */
  type?: "website" | "article"
}

const DEFAULT_OG_IMAGE = "/og-image.png"
const DEFAULT_OG_WIDTH = 1200
const DEFAULT_OG_HEIGHT = 630

/**
 * Construye los metadatos de una página con canonical, Open Graph y Twitter Card
 * completos y coherentes con el host canónico.
 */
export function pageSeo({ title, description, path, image, noindex, type = "website" }: PageSeoOptions): Metadata {
  const url = absoluteUrl(path)
  const isDefaultImage = !image
  const ogImage = image ?? absoluteUrl(DEFAULT_OG_IMAGE)

  const ogImageEntry = isDefaultImage
    ? { url: ogImage, width: DEFAULT_OG_WIDTH, height: DEFAULT_OG_HEIGHT, alt: title }
    : { url: ogImage, alt: title }

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en_US",
      alternateLocale: ["es_ES"],
      images: [ogImageEntry],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  }
}

/**
 * Metadatos para rutas que no deben aparecer en el índice: autenticación,
 * agradecimientos de conversión, páginas privadas y pasarelas de pago.
 *
 * Se emite `noindex` pero NO `nofollow`: queremos que desaparezcan del índice
 * sin cortar el flujo de enlaces internos.
 *
 * Importante: estas rutas no deben ir en `Disallow` de robots.txt. Si se
 * bloquea el rastreo, Google no puede leer el `noindex` y la URL puede seguir
 * apareciendo en resultados (sin fragmento) si alguien la enlaza.
 */
export function noindexSeo(title: string, description?: string): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
    robots: { index: false, follow: true },
  }
}
