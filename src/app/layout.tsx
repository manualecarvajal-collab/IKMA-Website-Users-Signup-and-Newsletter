import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import FooterWrapper from "@/components/FooterWrapper"
import NewsletterCTAWrapper from "@/components/NewsletterCTAWrapper"
import ToastContainer from "@/components/Toast"
import CookieConsent from "@/components/CookieConsent"
import LocaleSwitch from "@/components/LocaleSwitch"
import VisitorTracker from "@/components/VisitorTracker"
import IncompleteRegistrationBanner from "@/components/IncompleteRegistrationBanner"
import { createClient } from "@/lib/supabase/server"
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
  let incomplete: { tipoMiembro: number; region: string } | null = null
  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .single()
    userInfo = { email: user.email ?? "", role: perfil?.rol ?? "lector" }

    // Membership application started but never paid (estado "incompleta").
    // Never nag users who already have a paid/approved application.
    const { data: procesoCompleto } = await supabase
      .from("solicitudes_membresia")
      .select("id")
      .eq("usuario_id", user.id)
      .in("estado", ["aprobada", "pagada"])
      .limit(1)
      .maybeSingle()
    if (!procesoCompleto) {
      const { data: inc } = await supabase
        .from("solicitudes_membresia")
        .select("tipo_miembro, region")
        .eq("usuario_id", user.id)
        .eq("estado", "incompleta")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (inc) incomplete = { tipoMiembro: inc.tipo_miembro, region: inc.region }
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
              />
            )}
            <Navbar initialUser={userInfo} />
          </div>
          <main className="flex-grow">{children}</main>
          <FooterWrapper>
            <NewsletterCTAWrapper isAuthenticated={!!user} />
            <Footer />
          </FooterWrapper>
          <ToastContainer />
          <CookieConsent />
          <LocaleSwitch />
        </NextIntlClientProvider>
        <SpeedInsights />
        <VisitorTracker />
      </body>
    </html>
  )
}
