"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { signout } from "@/lib/supabase/actions"

const aboutLinks = [
  { href: "/who-we-are", label: "Who We Are" },
  { href: "/our-purpose", label: "Our Purpose" },
  { href: "/our-objectives", label: "Our Objectives" },
]

const resourcesLinks = [
  { href: "/newsletter", label: "Newsletter" },
  { href: "/blog", label: "Blog" },
  { href: "/teachings", label: "Teachings" },
]

const memberRegions = [
  { href: "#", label: "North America / Europe / Australia" },
  { href: "#", label: "Africa / Central and South America / Asia" },
]

const memberLinks = [
  { href: "#", label: "Medical professional", sublinks: memberRegions },
  { href: "#", label: "Non-medical" },
  { href: "#", label: "Student" },
]

export default function Navbar({ initialUser }: { initialUser: { email: string; role: string } | null }) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string; role: string } | null>(initialUser)

  const isAdmin = pathname.startsWith("/admin")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [aboutExpanded, setAboutExpanded] = useState(false)
  const [resourcesExpanded, setResourcesExpanded] = useState(false)
  const [memberExpanded, setMemberExpanded] = useState(false)
  const [medProExpanded, setMedProExpanded] = useState(false)

  const [scrolled, setScrolled] = useState(false)
  const closeMobile = () => setMobileOpen(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

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

  const isAboutActive = aboutLinks.some((l) => pathname.startsWith(l.href))
  const isResourcesActive = resourcesLinks.some((l) => pathname.startsWith(l.href))

  return (
    <nav className={`top-0 sticky z-50 transition-all duration-300 md:bg-white/70 md:backdrop-blur-lg md:shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] ${
      scrolled ? "bg-white/70 backdrop-blur-lg shadow-[0_20px_20px_0_rgba(7,68,105,0.04)]" : "bg-transparent"
    } ${isAdmin ? "hidden" : ""}`}>
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
            <Link
              href="/"
              className={
                isActive("/")
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-on-surface-variant hover:text-primary transition-colors hover:bg-primary-container/10 px-2 py-1 rounded-md duration-300 ease-in-out active:scale-95"
              }
            >
              Home
            </Link>
            <div className="relative group">
              <span
                className={
                  (isAboutActive ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant group-hover:text-primary transition-colors") +
                  " flex items-center gap-0.5 cursor-default px-2 py-1 rounded-md group-hover:bg-primary-container/10 duration-300"
                }
              >
                About Us
                <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:rotate-180">
                  expand_more
                </span>
              </span>
              <div className="absolute top-full left-0 mt-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white rounded-lg shadow-lg border border-outline-variant/30 py-2 min-w-[190px]">
                  {aboutLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={
                        (pathname.startsWith(l.href)
                          ? "text-primary bg-primary-container/10"
                          : "text-on-surface-variant hover:text-primary hover:bg-primary-container/10") +
                        " block px-4 py-2.5 font-body-md transition-colors"
                      }
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative group">
              <span
                className={
                  (isResourcesActive ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant group-hover:text-primary transition-colors") +
                  " flex items-center gap-0.5 cursor-default px-2 py-1 rounded-md group-hover:bg-primary-container/10 duration-300"
                }
              >
                Resources
                <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:rotate-180">
                  expand_more
                </span>
              </span>
              <div className="absolute top-full left-0 mt-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white rounded-lg shadow-lg border border-outline-variant/30 py-2 min-w-[190px]">
                  {resourcesLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={
                        (pathname.startsWith(l.href)
                          ? "text-primary bg-primary-container/10"
                          : "text-on-surface-variant hover:text-primary hover:bg-primary-container/10") +
                        " block px-4 py-2.5 font-body-md transition-colors"
                      }
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/outreach"
              className={
                isActive("/outreach")
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-on-surface-variant hover:text-primary transition-colors hover:bg-primary-container/10 px-2 py-1 rounded-md duration-300 ease-in-out active:scale-95"
              }
            >
              Outreach
            </Link>
            {user?.role === "administrador" && (
              <Link
                href="/admin"
                className="text-primary font-label-bold flex items-center gap-1 bg-primary-container/20 px-3 py-1.5 rounded-full hover:bg-primary-container/40 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span> Admin
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-[clamp(0.25rem,0.8vw,0.75rem)]">
          {user ? (
            <>
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
          <div className="relative group hidden md:block">
            <span className="bg-primary text-on-primary font-label-bold text-xs md:text-label-bold px-4 py-1.5 md:px-6 md:py-2.5 rounded-lg hover:bg-surface hover:text-on-primary-fixed-variant transition-all duration-300 ease-in-out cursor-default shadow-sm flex items-center gap-1">
              Become a member
              <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:rotate-180">expand_more</span>
            </span>
            <div className="absolute top-full right-0 mt-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="bg-white rounded-lg shadow-lg border border-outline-variant/30 py-2 min-w-[220px]">
                {memberLinks.map((m) =>
                  m.sublinks ? (
                    <div key={m.label} className="relative group/sub">
                      <span className="flex items-center justify-between px-4 py-2.5 font-body-md text-on-surface-variant cursor-default">
                        {m.label}
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </span>
                      <div className="absolute right-full top-0 mr-2 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                        <div className="bg-white rounded-lg shadow-lg border border-outline-variant/30 py-2 min-w-[260px]">
                          {m.sublinks.map((s) => (
                            <Link
                              key={s.label}
                              href={s.href}
                              className="block px-4 py-2.5 font-body-md text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-colors whitespace-nowrap"
                            >
                              {s.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={m.label}
                      href={m.href}
                      className="block px-4 py-2.5 font-body-md text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-colors"
                    >
                      {m.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
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
          mobileOpen ? "max-h-[40rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-margin-mobile pb-6 pt-2 space-y-1 border-t border-outline-variant/20 bg-white/70 backdrop-blur-lg">
          <Link
            href="/"
            onClick={closeMobile}
            className={
              isActive("/")
                ? "flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-container/20 text-primary font-label-bold text-label-bold"
                : "flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-bold text-label-bold transition-colors"
            }
          >
            Home
          </Link>
          <div>
            <button
              onClick={() => setAboutExpanded((o) => !o)}
              className={
                (isAboutActive
                  ? "text-primary bg-primary-container/20"
                  : "text-on-surface-variant") +
                " flex items-center justify-between w-full px-4 py-3 rounded-lg font-label-bold text-label-bold transition-colors"
              }
            >
              About Us
              <span
                className={`material-symbols-outlined text-sm transition-transform duration-300 ${
                  aboutExpanded ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                aboutExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="pl-6 space-y-1">
                {aboutLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => { closeMobile(); setAboutExpanded(false) }}
                    className={
                      (pathname.startsWith(l.href)
                        ? "text-primary bg-primary-container/10"
                        : "text-on-surface-variant hover:text-primary hover:bg-surface-container") +
                      " flex items-center gap-3 px-4 py-2.5 rounded-lg font-body-md transition-colors"
                    }
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={() => setResourcesExpanded((o) => !o)}
              className={
                (isResourcesActive
                  ? "text-primary bg-primary-container/20"
                  : "text-on-surface-variant") +
                " flex items-center justify-between w-full px-4 py-3 rounded-lg font-label-bold text-label-bold transition-colors"
              }
            >
              Resources
              <span
                className={`material-symbols-outlined text-sm transition-transform duration-300 ${
                  resourcesExpanded ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                resourcesExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="pl-6 space-y-1">
                {resourcesLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => { closeMobile(); setResourcesExpanded(false) }}
                    className={
                      (pathname.startsWith(l.href)
                        ? "text-primary bg-primary-container/10"
                        : "text-on-surface-variant hover:text-primary hover:bg-surface-container") +
                      " flex items-center gap-3 px-4 py-2.5 rounded-lg font-body-md transition-colors"
                    }
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link
            href="/outreach"
            onClick={closeMobile}
            className={
              (isActive("/outreach")
                ? "text-primary bg-primary-container/20"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface") +
              " flex items-center gap-3 px-4 py-3 rounded-lg font-label-bold text-label-bold transition-colors"
            }
          >
            Outreach
          </Link>
          {user?.role === "administrador" && (
            <Link
              href="/admin"
              onClick={closeMobile}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-label-bold bg-primary-container/20"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span> Admin
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
            <button
              onClick={() => setMemberExpanded((o) => !o)}
              className="flex items-center justify-between w-full bg-primary text-on-primary font-label-bold text-label-bold px-6 py-2.5 rounded-lg transition-all shadow-sm"
            >
              Become a member
              <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${memberExpanded ? "rotate-180" : ""}`}>expand_more</span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${memberExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pl-4 space-y-1 mt-1">
                <div>
                  <button
                    onClick={() => setMedProExpanded((o) => !o)}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg font-body-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                  >
                    Medical professional
                    <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${medProExpanded ? "rotate-180" : ""}`}>expand_more</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${medProExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="pl-6 space-y-1">
                      {memberRegions.map((r) => (
                        <Link
                          key={r.label}
                          href={r.href}
                          onClick={() => { closeMobile(); setMemberExpanded(false); setMedProExpanded(false) }}
                          className="block px-4 py-2 rounded-lg font-body-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                        >
                          {r.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <Link
                  href="#"
                  onClick={() => { closeMobile(); setMemberExpanded(false) }}
                  className="block px-4 py-2.5 rounded-lg font-body-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                >
                  Non-medical
                </Link>
                <Link
                  href="#"
                  onClick={() => { closeMobile(); setMemberExpanded(false) }}
                  className="block px-4 py-2.5 rounded-lg font-body-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                >
                  Student
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
