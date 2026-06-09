"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { signout } from "@/lib/supabase/actions"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/doctores", label: "Doctors" },
  { href: "/revista", label: "Newsletter" },
  { href: "/contacto", label: "Contact" },
]

export default function Navbar({ initialUser }: { initialUser: { email: string; role: string } | null }) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string; role: string } | null>(initialUser)
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from("perfiles").select("rol").eq("id", session.user.id).single().then(({ data: perfil }) => {
          setUser({ email: session.user.email ?? "", role: perfil?.rol ?? "lector" })
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: perfil } = await supabase
          .from("perfiles")
          .select("rol")
          .eq("id", session.user.id)
          .single()
        setUser({ email: session.user.email ?? "", role: perfil?.rol ?? "lector" })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signout()
    setUser(null)
    window.location.href = "/"
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-white/70 backdrop-blur-lg shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] top-0 sticky z-50 transition-all duration-300">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-between items-center h-20">
        <div className="flex items-center gap-[clamp(0.75rem,2vw,1.5rem)]">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="IKMA Logo"
              width={160}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <div className="hidden md:flex items-center font-body-md text-[clamp(0.75rem,1.2vw,1rem)] gap-[clamp(0.5rem,1.5vw,1rem)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive(link.href)
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-on-surface-variant hover:text-primary transition-colors hover:bg-primary-container/10 px-2 py-1 rounded-md duration-300 ease-in-out active:scale-95"
                }
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "administrador" && (
              <Link
                href="/admin"
                className="text-primary font-label-bold flex items-center gap-1 bg-primary-container/20 px-3 py-1.5 rounded-full hover:bg-primary-container/40 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span> CMS
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-[clamp(0.25rem,0.8vw,0.75rem)]">
          {user ? (
            <>
              <span className="hidden md:inline font-body-md text-body-md text-on-surface-variant truncate max-w-[150px]">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="hidden md:inline-block bg-white border border-outline-variant text-on-surface font-label-bold text-xs md:text-label-bold rounded-lg hover:bg-surface-container transition-all px-3 py-1.5 md:px-5 md:py-2.5 cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline-block bg-white border border-outline-variant text-on-surface font-label-bold text-xs md:text-label-bold rounded-lg hover:bg-surface-container transition-all duration-300 ease-in-out active:scale-95 px-3 py-1.5 md:px-5 md:py-2.5"
              >
                Log in
              </Link>
              <Link
                href="/registro"
                className="hidden md:inline-block bg-surface-container-high text-on-surface font-label-bold text-xs md:text-label-bold rounded-lg hover:bg-surface-container-highest transition-all duration-300 ease-in-out active:scale-95 px-3 py-1.5 md:px-5 md:py-2.5"
              >
                Sign up
              </Link>
            </>
          )}
          <span className="w-px h-6 bg-outline-variant hidden md:block" />
          <button className="hidden md:inline-block bg-primary text-on-primary font-label-bold text-xs md:text-label-bold px-4 py-1.5 md:px-6 md:py-2.5 rounded-lg hover:bg-primary-fixed-variant hover:text-on-primary-fixed-variant transition-all duration-300 ease-in-out active:scale-95 shadow-sm cursor-pointer">
            Support Now
          </button>
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-2xl text-on-surface">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-margin-mobile pb-6 pt-2 space-y-1 border-t border-outline-variant/20 bg-white/70 backdrop-blur-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className={
                isActive(link.href)
                  ? "flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-container/20 text-primary font-label-bold text-label-bold"
                  : "flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-bold text-label-bold transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "administrador" && (
            <Link
              href="/admin"
              onClick={closeMobile}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-label-bold bg-primary-container/20"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span> CMS
            </Link>
          )}
          <hr className="my-3 border-outline-variant/30" />
          {user ? (
            <div className="px-4 space-y-3">
              <p className="font-body-md text-body-md text-on-surface-variant truncate">{user.email}</p>
              <button
                onClick={handleSignOut}
                className="w-full bg-white border border-outline-variant text-on-surface font-label-bold text-label-bold rounded-lg hover:bg-surface-container transition-all px-5 py-2.5 cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="px-4 space-y-3">
              <Link
                href="/login"
                onClick={closeMobile}
                className="block w-full text-center bg-white border border-outline-variant text-on-surface font-label-bold text-label-bold rounded-lg hover:bg-surface-container transition-all px-5 py-2.5"
              >
                Log in
              </Link>
              <Link
                href="/registro"
                onClick={closeMobile}
                className="block w-full text-center bg-surface-container-high text-on-surface font-label-bold text-label-bold rounded-lg hover:bg-surface-container-highest transition-all px-5 py-2.5"
              >
                Sign up
              </Link>
            </div>
          )}
          <div className="px-4 pt-2">
            <button className="w-full bg-primary text-on-primary font-label-bold text-label-bold px-6 py-2.5 rounded-lg hover:bg-primary-fixed-variant hover:text-on-primary-fixed-variant transition-all shadow-sm cursor-pointer">
              Support Now
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
