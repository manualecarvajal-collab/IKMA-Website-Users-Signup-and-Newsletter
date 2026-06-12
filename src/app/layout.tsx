import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ToastContainer from "@/components/Toast"
import { createClient } from "@/lib/supabase/server"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const dynamic = "force-dynamic"

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://ikma-website.vercel.app"),
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

  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container">
        <Navbar initialUser={userInfo} />
        <main className="flex-grow">{children}</main>
        <Footer />
        <ToastContainer />
        <SpeedInsights />
      </body>
    </html>
  )
}
