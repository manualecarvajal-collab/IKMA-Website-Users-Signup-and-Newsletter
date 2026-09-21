import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import FooterWrapper from "@/components/FooterWrapper"
import NewsletterCTA from "@/components/NewsletterCTA"
import NewsletterCTAVisibility from "@/components/NewsletterCTAVisibility"
import ToastContainer from "@/components/Toast"
import CookieConsent from "@/components/CookieConsent"
import LocaleSwitch from "@/components/LocaleSwitch"
import VisitorTracker from "@/components/VisitorTracker"
import IncompleteRegistrationBanner from "@/components/IncompleteRegistrationBanner"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import JsonLd from "@/components/JsonLd"
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site"
import { organizationSchema, websiteSchema, jsonLdGraph } from "@/lib/structured-data"

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

/**
 * `metadataBase` apunta al host canónico con www: Vercel fuerza un 308 desde el
 * apex, así que declarar el apex aquí haría que cada URL relativa de Open Graph
 * y cada canonical resolviera a una redirección.
 *
 * Ojo: aquí NO se define `alternates.canonical`. Next.js lo heredaría a toda
 * página que no lo sobrescriba, y una página olvidada se declararía canónica de
 * la home. El canonical se pone explícitamente en cada página con `pageSeo()`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "IKMA",
  /**
   * Verificación de propiedad para buscadores.
   *
   * El método recomendado para este sitio es la propiedad de dominio (DNS TXT),
   * porque el DNS lo gestiona Vercel: cubre apex, www y todos los subdominios,
   * y no necesita desplegar. Estas etiquetas son el plan B (propiedad de
   * prefijo de URL) para cuando se prefiera verificar por meta.
   *
   * Se leen de entorno para que verificar sea configuración y no un cambio de
   * código. Verificado en local: al ser el sitio renderizado en servidor bajo
   * demanda, `process.env` se resuelve en RUNTIME y el valor NO queda inlineado
   * en el build. Aun así Vercel inyecta las variables al desplegar, de modo que
   * definirla en el panel exige un nuevo despliegue para que surta efecto.
   */
  ...(process.env.GOOGLE_SITE_VERIFICATION || process.env.BING_SITE_VERIFICATION
    ? {
        verification: {
          ...(process.env.GOOGLE_SITE_VERIFICATION
            ? { google: process.env.GOOGLE_SITE_VERIFICATION }
            : {}),
          ...(process.env.BING_SITE_VERIFICATION
            ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
            : {}),
        },
      }
    : {}),
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "IKMA",
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_ES"],
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
}

/**
 * El grafo Organization + WebSite es constante para todo el sitio, así que se
 * serializa una vez por proceso en lugar de en cada request (todas las páginas
 * son dinámicas).
 */
const SITE_JSON_LD = jsonLdGraph(organizationSchema(), websiteSchema())

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/webp" href="/favicon.webp" />
        <JsonLd data={SITE_JSON_LD} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="sticky top-0 z-50">
            <IncompleteRegistrationBanner />
            <Navbar />
          </div>
          <main className="flex-grow">{children}</main>
          <FooterWrapper>
            <NewsletterCTAVisibility>
              <NewsletterCTA />
            </NewsletterCTAVisibility>
            <Footer />
          </FooterWrapper>
          <ToastContainer />
          <CookieConsent />
          <LocaleSwitch />
        </NextIntlClientProvider>
        <SpeedInsights />
        <Analytics />
        <VisitorTracker />
      </body>
    </html>
  )
}
