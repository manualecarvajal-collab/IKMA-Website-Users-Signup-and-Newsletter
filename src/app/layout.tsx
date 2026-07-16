import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ToastContainer from "@/components/Toast"
import CookieConsent from "@/components/CookieConsent"
import TranslateButton from "@/components/TranslateButton"
import VisitorTracker from "@/components/VisitorTracker"
import { createClient } from "@/lib/supabase/server"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { headers } from "next/headers"

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userInfo: { email: string; role: string } | null = null
  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .single()
    userInfo = { email: user.email ?? "", role: perfil?.rol ?? "lector" }
  }

  const headersList = await headers()
  const pathname = headersList.get("x-invoke-path") || headersList.get("x-pathname") || ""
  const isAdminPage = pathname.startsWith("/admin")

  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/webp" href="/favicon.webp" />
        <link rel="preload" as="image" href="/images/Ap Bonny 2.webp" fetchPriority="high" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container">
        <Navbar initialUser={userInfo} />
        <main className="flex-grow">{children}</main>
        <Footer hide={isAdminPage} />
        <ToastContainer />
        <CookieConsent />
        <TranslateButton />
        <SpeedInsights />
        <VisitorTracker />
      </body>
    </html>
  )
}
