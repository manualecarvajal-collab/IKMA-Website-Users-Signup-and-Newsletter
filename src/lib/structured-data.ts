/**
 * Constructores de JSON-LD (schema.org) para el sitio.
 *
 * Reglas de este módulo:
 *  - Solo se emite lo que existe en la base de datos. Nunca se inventan fechas,
 *    perfiles sociales ni acciones de búsqueda.
 *  - Todo `@id` se deriva de `SITE_URL` para que las entidades se enlacen entre sí
 *    (Organization <- WebSite <- BlogPosting) y Google construya el grafo.
 */

import { SITE_URL, SITE_NAME, SITE_LEGAL_NAME, SITE_DESCRIPTION, absoluteUrl } from "./site"

export type JsonLd = Record<string, unknown>

/** Contacto público real de la organización (único verificado en el código). */
const ORG_EMAIL = "ikma@emmint.com"

export const ORGANIZATION_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`

/**
 * Organización matriz. Se emite en el layout raíz para que toda página herede
 * la entidad de marca.
 *
 * `@type` deliberadamente limitado a Organization + MedicalOrganization.
 * NO se emite `NGO` ni `nonprofitStatus`: las páginas legales del sitio
 * (`/donate`, `/donor-rights`, `/privacy-policy`) declaran que la entidad es
 * "IKMA LLC, a for-profit limited liability company", no reconocida como
 * exenta bajo la Sección 501(c)(3). En schema.org `NGO` es por definición una
 * organización sin ánimo de lucro, así que declararlo sería marcado falso.
 *
 * NOTA: falta `sameAs`. El sitio no enlaza ningún perfil social propio de IKMA
 * (el único Facebook del código es de una organización partner). Añadir aquí
 * las URLs reales de sus redes cuando existan es la mejora de mayor impacto
 * para el panel de entidad de Google.
 */
export function organizationSchema(): JsonLd {
  return {
    "@type": ["Organization", "MedicalOrganization"],
    "@id": ORGANIZATION_ID,
    name: SITE_LEGAL_NAME,
    legalName: "IKMA LLC",
    alternateName: [SITE_NAME, "International Kingdom Medical Association"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo.webp"),
    },
    image: absoluteUrl("/og-image.png"),
    description: SITE_DESCRIPTION,
    email: ORG_EMAIL,
  }
}

/**
 * Sitio web. `inLanguage` se fija a "en" porque el idioma se resuelve por cookie
 * y el crawler siempre recibe la versión inglesa (localeDetection: false).
 *
 * Sin `potentialAction`/SearchAction: el sitio no tiene buscador interno.
 */
export function websiteSchema(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: `${SITE_NAME} - ${SITE_LEGAL_NAME}`,
    description: SITE_DESCRIPTION,
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "en",
  }
}

export interface ArticleInput {
  slug: string
  title: string
  description: string | null
  imageUrl: string | null
  datePublished: string | null
  dateModified: string | null
  authorName: string | null
  locale: string
  /** `true` cuando el artículo completo está tras el muro de pago. */
  isPaywalled: boolean
}

/** Artículo del blog. `@type` BlogPosting con `isAccessibleForFree` honesto. */
export function articleSchema(input: ArticleInput): JsonLd {
  const url = absoluteUrl(`/blog/${input.slug}`)
  const author = input.authorName
    ? { "@type": "Person", name: input.authorName }
    : { "@id": ORGANIZATION_ID }

  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: input.title,
    ...(input.description ? { description: input.description } : {}),
    ...(input.imageUrl ? { image: [input.imageUrl] } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    author,
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: input.locale === "es" ? "es" : "en",
    isAccessibleForFree: !input.isPaywalled,
  }
}

export interface PhysicianInput {
  id: string | number
  name: string
  specialty: string | null
  description: string | null
  imageUrl: string | null
  hospital: string | null
  languages: string[] | null
}

/**
 * Perfil de doctor. `Physician` (subtipo de MedicalBusiness/Person) es lo que
 * Google espera para contenido médico YMYL.
 *
 * No se emite `aggregateRating` aunque la UI muestre estrellas: el rating es
 * contenido editorial de la ficha, no reseñas verificables de usuarios.
 */
export function physicianSchema(input: PhysicianInput): JsonLd {
  return {
    "@type": "Physician",
    "@id": `${absoluteUrl(`/doctores/${input.id}`)}#physician`,
    name: input.name,
    ...(input.specialty ? { medicalSpecialty: input.specialty } : {}),
    ...(input.description ? { description: input.description.slice(0, 300) } : {}),
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    ...(input.hospital ? { affiliation: { "@type": "Hospital", name: input.hospital } } : {}),
    ...(input.languages?.length
      ? { knowsLanguage: input.languages.map((l) => ({ "@type": "Language", name: l })) }
      : {}),
    memberOf: { "@id": ORGANIZATION_ID },
  }
}

export interface Crumb {
  name: string
  /** Ruta interna (`/blog`) o `null` para el último elemento, que es la página actual. */
  path: string | null
}

/** Migas de pan. El último elemento se emite sin `item` según la spec. */
export function breadcrumbSchema(crumbs: Crumb[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.path ? { item: absoluteUrl(c.path) } : {}),
    })),
  }
}

/** Envuelve uno o varios nodos en un `@graph` listo para `<script type="application/ld+json">`. */
export function jsonLdGraph(...nodes: JsonLd[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes })
}
