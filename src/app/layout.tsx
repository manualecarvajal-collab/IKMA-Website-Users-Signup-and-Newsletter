import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import { cookies } from "next/headers"
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
import { createClient } from "@/lib/supabase/server"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://ikmaglobal.com"),
  title: "IKMA - International Kingdom Medical Association",
  description:
    "Healing through faith and excellence. A mission-driven medical association dedicated to providing accessible, high-quality healthcare and funding to those in need.",
  openGraph: {
    title: "IKMA - International Kingdom Medical Association",
    description:
      "Healing through faith and excellence. A mission-driven medical association dedicated to providing accessible, high-quality healthcare and funding to those in need.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IKMA - International Kingdom Medical Association",
      },
    ],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userInfo: { email: string; role: string } | null = null
  let incomplete: { tipoMiembro: number | null; region: string | null; paso: number } | null = null
  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .single()
    userInfo = { email: user.email ?? "", role: perfil?.rol ?? "lector" }

    // Reminder banner for anyone who abandoned the membership process at any
    // step. Never nag users who already have a paid/approved application.
    const { data: procesoCompleto } = await supabase
      .from("solicitudes_membresia")
      .select("id")
      .eq("usuario_id", user.id)
      .in("estado", ["aprobada", "pagada"])
      .limit(1)
      .maybeSingle()
    if (!procesoCompleto) {
      // Submitted form without paying → the DB record knows the step.
      const { data: solicitud } = await supabase
        .from("solicitudes_membresia")
        .select("estado, tipo_miembro, region")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (solicitud?.estado === "incompleta") {
        incomplete = { tipoMiembro: solicitud.tipo_miembro, region: solicitud.region, paso: 3 }
      } else if (!solicitud && perfil?.rol !== "administrador") {
        // Before submission the form tracks the last step reached in a cookie.
        const cookie = (await cookies()).get("membresia_proceso")?.value
        if (cookie) {
          const [paso, tipo, region] = cookie.split("|")
          incomplete = {
            tipoMiembro: Number(tipo) || null,
            region: region || null,
            paso: Math.min(Number(paso) || 1, 3),
          }
        }
      }
    }
  }

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/webp" href="/favicon.webp" />
        <link rel="preload" as="image" href="/images/Ap Bonny 2.webp" fetchPriority="high" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="sticky top-0 z-50">
            {incomplete && (
              <IncompleteRegistrationBanner
                tipoMiembro={incomplete.tipoMiembro}
                region={incomplete.region}
                paso={incomplete.paso}
              />
            )}
            <Navbar initialUser={userInfo} />
          </div>
          <main className="flex-grow">{children}</main>
          <FooterWrapper>
            <NewsletterCTAVisibility>
              <NewsletterCTA isAuthenticated={!!user} />
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
