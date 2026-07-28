"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { signout } from "@/lib/supabase/actions"
import { useTranslations } from "next-intl"
import Icon from "@/components/Icon"

export default function Navbar({ initialUser }: { initialUser: { email: string; role: string } | null }) {
  const t = useTranslations("Navbar")

  const aboutLinks = [
    { href: "/who-we-are", label: t("whoWeAre") },
    { href: "/our-purpose", label: t("ourPurpose") },
  ]

  const resourcesLinks = [
    { href: "/newsletter", label: t("magazine") },
    { href: "/blog", label: "Blog" },
    { href: "/teachings", label: t("teachings") },
  ]
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string; role: string } | null>(initialUser)

  const isAdmin = pathname.startsWith("/admin")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [aboutExpanded, setAboutExpanded] = useState(false)
  const [resourcesExpanded, setResourcesExpanded] = useState(false)
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
        <div className="flex items-center justify-between gap-[clamp(0.75rem,2vw,1.5rem)] flex-1">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.webp"
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
              {t("home")}
            </Link>
            <div className="relative group">
              <span
                className={
                  (isAboutActive ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant group-hover:text-primary transition-colors") +
                  " flex items-center gap-0.5 cursor-default px-2 py-1 rounded-md group-hover:bg-primary-container/10 duration-300"
                }
              >
                {t("aboutUs")}
                <Icon name="expand_more" size={14} className="transition-transform duration-300 group-hover:rotate-180" />
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
                {t("resources")}
                <Icon name="expand_more" size={14} className="transition-transform duration-300 group-hover:rotate-180" />
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
              {t("outreach")}
            </Link>
            <Link
              href="#"
              className="text-on-surface-variant hover:text-primary transition-colors hover:bg-primary-container/10 px-2 py-1 rounded-md duration-300 ease-in-out active:scale-95"
            >
              {t("events")}
            </Link>
            {user?.role === "administrador" && (
              <Link
                href="/admin"
                className="text-primary font-label-bold flex items-center gap-1 bg-primary-container/20 px-3 py-1.5 rounded-full hover:bg-primary-container/40 transition-colors"
              >
                <Icon name="dashboard" size={14} /> Admin
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
                {t("signOut")}
              </button>
            </>
          ) : null}
          <span className="w-px h-6 bg-outline-variant hidden md:block" />
          {!user && (
            <Link
              href="/login"
              className="hidden md:inline-block text-primary font-label-bold text-xs md:text-label-bold px-2 py-1.5 md:px-3 md:py-2.5 hover:underline transition-all duration-300 ease-in-out active:scale-95"
            >
              {t("logIn")}
            </Link>
          )}
          <Link
            href={user ? "/donate" : "/registro"}
            className="hidden md:inline-block bg-primary text-on-primary font-label-bold text-xs md:text-label-bold px-4 py-1.5 md:px-6 md:py-2.5 rounded-lg hover:bg-surface hover:text-on-primary-fixed-variant transition-all duration-300 ease-in-out active:scale-95 shadow-sm"
          >
            {user ? t("supportMission") : t("becomeMember")}
          </Link>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Icon name={mobileOpen ? "close" : "menu"} size={24} className="text-on-surface" />
          </button>
        </div>
      </div>
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
              {t("aboutUs")}
              <Icon name="expand_more" size={14} className={`transition-transform duration-300 ${aboutExpanded ? "rotate-180" : ""}`} />
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
              {t("resources")}
              <Icon name="expand_more" size={14} className={`transition-transform duration-300 ${resourcesExpanded ? "rotate-180" : ""}`} />
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
            {t("outreach")}
          </Link>
          <Link
            href="#"
            onClick={closeMobile}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-bold text-label-bold transition-colors"
          >
            {t("events")}
          </Link>
          {user?.role === "administrador" && (
            <Link
              href="/admin"
              onClick={closeMobile}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-label-bold bg-primary-container/20"
            >
              <Icon name="dashboard" size={14} /> Admin
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
                {t("signOut")}
              </button>
            </div>
          ) : null}
          {!user && (
            <Link
              href="/login"
              onClick={closeMobile}
              className="block w-full text-center text-primary font-label-bold text-label-bold px-6 py-2.5 hover:underline transition-all"
            >
              {t("logIn")}
            </Link>
          )}
          <Link
            href={user ? "/donate" : "/registro"}
            onClick={closeMobile}
            className="block w-full text-center bg-primary text-on-primary font-label-bold text-label-bold px-6 py-2.5 rounded-lg transition-all shadow-sm"
          >
            {user ? t("supportMission") : t("becomeMember")}
          </Link>
        </div>
      </div>
    </nav>
  )
}
