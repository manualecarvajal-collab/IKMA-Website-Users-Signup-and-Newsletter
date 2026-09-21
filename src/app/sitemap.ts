import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

/**
 * Se regenera cada hora en vez de en cada petición (`force-dynamic`). El listado
 * de artículos sale de Supabase, así que no puede ser puramente estático, pero
 * tampoco necesita consultarse en cada visita de un crawler.
 */
export const revalidate = 3600

type Entry = MetadataRoute.Sitemap[number]

/**
 * Rutas estáticas.
 *
 * Sin `lastModified`: no llevamos registro de cuándo cambió cada página y
 * `new Date()` devolvía la hora de la petición, de modo que cada URL declaraba
 * haberse modificado hacía segundos en cada visita. Un `lastmod` poco fiable
 * hace que Google deje de usarlo como señal de rastreo; omitirlo es preferible.
 *
 * `/revista` no aparece: responde 308 hacia `/blog`, y un sitemap no debe
 * contener redirecciones.
 */
function staticUrls(): Entry[] {
  const entries: Array<[string, Entry["changeFrequency"], number]> = [
    ["/", "daily", 1],
    ["/blog", "weekly", 0.9],
    ["/who-we-are", "monthly", 0.8],
    ["/our-purpose", "monthly", 0.8],
    ["/our-objectives", "monthly", 0.7],
    ["/membresia", "monthly", 0.7],
    ["/teachings", "weekly", 0.7],
    ["/donate", "monthly", 0.7],
    ["/doctores", "monthly", 0.6],
    ["/outreach", "monthly", 0.6],
    ["/newsletter", "monthly", 0.6],
    ["/contact-us", "yearly", 0.6],
    ["/events", "monthly", 0.6],
    ["/testimonios", "monthly", 0.6],
    ["/outreach/communities", "monthly", 0.5],
    ["/outreach/zumurucuare", "monthly", 0.5],
    ["/privacy-policy", "yearly", 0.3],
    ["/terms-of-service", "yearly", 0.3],
    ["/donor-rights", "yearly", 0.3],
    ["/donation-policy", "yearly", 0.3],
    ["/cookies", "yearly", 0.2],
  ]

  return entries.map(([path, changeFrequency, priority]) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency,
    priority,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/server")
    const admin = await createAdminClient()

    const { data: articulos } = await admin
      .from("articulos")
      .select("slug, updated_at, created_at")
      .eq("publicado", true)

    // Aquí `lastModified` sí es real: viene de la fila en base de datos.
    const articulosUrls: Entry[] = (
      articulos ?? []
    ).map((a: { slug: string; updated_at: string | null; created_at: string | null }) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      lastModified: new Date(a.updated_at || a.created_at || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))

    const { data: grupos } = await admin.from("grupos").select("slug")

    const gruposUrls: Entry[] = (grupos ?? []).map((g: { slug: string }) => ({
      url: `${SITE_URL}/teachings/${g.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }))

    return [...staticUrls(), ...articulosUrls, ...gruposUrls]
  } catch {
    return staticUrls()
  }
}
