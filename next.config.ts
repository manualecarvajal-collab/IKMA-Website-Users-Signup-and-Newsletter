import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  /**
   * La landing de la conferencia 2026 se retiró al terminar el evento y ya no
   * enlaza desde ninguna parte del sitio. Los enlaces viejos que sigan vivas
   * por ahí (correos enviados, grupos de WhatsApp, marcadores) caen aquí y van
   * al inicio en vez de dar un 404.
   *
   * `permanent: false` a propósito: es un retiro "por ahora", y un 308 se queda
   * cacheado en los navegadores para siempre. El día que haya congreso con
   * landing propia se quita esta regla y ya está.
   *
   * Cubre también las subrutas: `/conferencia/speakers`, `/conferencia/acceso`,
   * `/conferencia/acceso/validar?t=…` y `/conferencia/salir`.
   */
  async redirects() {
    return [
      {
        source: "/conferencia/:path*",
        destination: "/",
        permanent: false,
      },
    ]
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
}

export default withNextIntl(nextConfig)
