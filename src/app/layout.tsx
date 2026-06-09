import type { Metadata } from "next"
import { Manrope, Public_Sans } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600", "700"],
})

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "IKMA - International Kingdom Medical Association",
  description:
    "Healing through faith and excellence. A mission-driven medical association dedicated to providing accessible, high-quality healthcare and funding to those in need.",
  openGraph: {
    title: "IKMA - International Kingdom Medical Association",
    description:
      "Healing through faith and excellence. A mission-driven medical association dedicated to providing accessible, high-quality healthcare and funding to those in need.",
    type: "website",
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
      className={`${manrope.variable} ${publicSans.variable} h-full antialiased`}
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
      </body>
    </html>
  )
}
