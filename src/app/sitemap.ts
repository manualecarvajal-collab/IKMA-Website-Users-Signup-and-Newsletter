import type { MetadataRoute } from "next"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ikmaglobal.com"

  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/who-we-are`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/our-purpose`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/our-objectives`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/teachings`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/doctores`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/outreach`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/membresia`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/newsletter`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ]

  try {
    const { createAdminClient } = await import("@/lib/supabase/server")
    const admin = await createAdminClient()

    const { data: articulos } = await admin
      .from("articulos")
      .select("slug, updated_at, created_at")
      .eq("publicado", true)

    const articulosUrls = (articulos ?? []).map((a: { slug: string; updated_at: string | null; created_at: string | null }) => ({
      url: `${baseUrl}/blog/${a.slug}`,
      lastModified: new Date(a.updated_at || a.created_at || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))

    const { data: grupos } = await admin
      .from("grupos")
      .select("slug")

    const gruposUrls = (grupos ?? []).map((g: { slug: string }) => ({
      url: `${baseUrl}/teachings/${g.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }))

    return [...staticUrls, ...articulosUrls, ...gruposUrls]
  } catch {
    return staticUrls
  }
}
