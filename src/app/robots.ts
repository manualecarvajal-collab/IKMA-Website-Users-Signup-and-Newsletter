import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/auth/"],
    },
    // Host canónico con www: el apex responde 308 y no debe declararse aquí.
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
