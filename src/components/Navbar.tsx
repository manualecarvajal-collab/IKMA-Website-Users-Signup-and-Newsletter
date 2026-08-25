"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useTranslations } from "next-intl"
import Icon from "@/components/Icon"
import LoadingOverlay from "@/components/LoadingOverlay"

export default function Navbar({ initialUser }: { initialUser?: { email: string; role: string } | null }) {
  const t = useTranslations("Navbar")

  const aboutLinks = [
    { href: "/who-we-are", label: t("whoWeAre") },
    { href: "/our-purpose", label: t("ourPurpose") },
    { href: "/our-objectives", label: t("ourObjectives") },
  ]

  const resourcesLinks = [
    { href: "/newsletter", label: t("magazine") },
    { href: "/blog", label: "Blog" },
    { href: "/teachings", label: t("teachings") },
  ]
  const outreachLinks = [
    { href: "/outreach", label: t("outreach") },
    { href: "/testimonios", label: t("testimonials") },
  ]
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string; role: string } | null>(initialUser ?? null)

  const isAdmin = pathname.startsWith("/admin")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [aboutExpanded, setAboutExpanded] = useState(false)
  const [resourcesExpanded, setResourcesExpanded] = useState(false)
  const [outreachExpanded, setOutreachExpanded] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const closeMobile = () => setMobileOpen(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    window.location.href = "/"
  }

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

    // ponytail: no await inside this callback. supabase-js awaits every
    // onAuthStateChange handler during client init (_recoverAndRefresh ->
    // _notifyAllSubscribers), and a query here calls getSession() which waits
    // on the same pending initializePromise -> circular deadlock that poisons
    // the shared client (login page stuck on "checking session" after signout).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        void supabase
          .from("perfiles")
          .select("rol")
          .eq("id", session.user.id)
          .single()
          .then(({ data: perfil }) => {
            setUser({ email: session.user.email ?? "", role: perfil?.rol ?? "lector" })
          })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const isAboutActive = aboutLinks.some((l) => pathname.startsWith(l.href))
  const isResourcesActive = resourcesLinks.some((l) => pathname.startsWith(l.href))
  const isOutreachActive = outreachLinks.some((l) => pathname.startsWith(l.href))

  return (
    <>
    {signingOut && <LoadingOverlay message={t("signingOut")} />}
    <nav className={`top-0 sticky z-50 transition-all duration-300 md:bg-white/70 md:backdrop-blur-lg md:shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] ${
      scrolled ? "bg-white/70 backdrop-blur-lg shadow-[0_20px_20px_0_rgba(7,68,105,0.04)]" : "bg-transparent"
    } ${isAdmin ? "hidden" : ""}`}>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex items-center h-20">
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src="/logo.webp"
            alt="IKMA Logo"
            width={94}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>
        <div className="hidden md:flex items-center justify-center gap-4 flex-1 font-body-md text-[clamp(0.75rem,1.2vw,1rem)]">
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
              href="/events"
              className={
                (isActive("/events")
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-on-surface-variant hover:text-primary transition-colors hover:bg-primary-container/10 px-2 py-1 rounded-md duration-300 ease-in-out active:scale-95") +
                " cursor-default"
              }
            >
              {t("events")}
            </Link>
            <div className="relative group">
              <span
                className={
                  (isOutreachActive ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant group-hover:text-primary transition-colors") +
                  " flex items-center gap-0.5 cursor-default px-2 py-1 rounded-md group-hover:bg-primary-container/10 duration-300"
                }
              >
                {t("outreach")}
                <Icon name="expand_more" size={14} className="transition-transform duration-300 group-hover:rotate-180" />
              </span>
              <div className="absolute top-full left-0 mt-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white rounded-lg shadow-lg border border-outline-variant/30 py-2 min-w-[190px]">
                  {outreachLinks.map((l) => (
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
              href="/contact-us"
              className={
                isActive("/contact-us")
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-on-surface-variant hover:text-primary transition-colors hover:bg-primary-container/10 px-2 py-1 rounded-md duration-300 ease-in-out active:scale-95"
              }
            >
              {t("contact")}
            </Link>
          </div>
        <div className="flex items-center gap-[clamp(0.25rem,0.8vw,0.75rem)] flex-shrink-0 ml-auto">
          {user ? (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="inline-flex items-center gap-1 bg-white border border-outline-variant text-on-surface font-label-bold text-xs md:text-label-bold rounded-lg hover:bg-surface-container transition-all px-3 py-1.5 md:px-5 md:py-2.5 cursor-pointer"
              >
                {t("myProfile")}
                <Icon name="expand_more" size={16} className={`transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 z-50 w-48 bg-surface rounded-lg shadow-lg border border-outline-variant/30 py-2">
                    <Link
                      href="/perfil"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2.5 font-body-md text-on-surface hover:bg-surface-container transition-colors"
                    >
                      {t("myProfile")}
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="block w-full text-left px-4 py-2.5 font-body-md text-error hover:bg-error-container/10 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {signingOut ? t("signingOut") : t("signOut")}
                    </button>
                  </div>
                </>
              )}
            </div>
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
            href={user ? "/donate" : "/membresia"}
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
            href="/events"
            onClick={closeMobile}
            className={
              (isActive("/events")
                ? "text-primary bg-primary-container/20"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface") +
              " flex items-center gap-3 px-4 py-3 rounded-lg font-label-bold text-label-bold transition-colors cursor-default"
            }
          >
            {t("events")}
          </Link>
          <div>
            <button
              onClick={() => setOutreachExpanded((o) => !o)}
              className={
                (isOutreachActive
                  ? "text-primary bg-primary-container/20"
                  : "text-on-surface-variant") +
                " flex items-center justify-between w-full px-4 py-3 rounded-lg font-label-bold text-label-bold transition-colors"
              }
            >
              {t("outreach")}
              <Icon name="expand_more" size={14} className={`transition-transform duration-300 ${outreachExpanded ? "rotate-180" : ""}`} />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                outreachExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="pl-6 space-y-1">
                {outreachLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => { closeMobile(); setOutreachExpanded(false) }}
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
            href="/contact-us"
            onClick={closeMobile}
            className={
              (isActive("/contact-us")
                ? "text-primary bg-primary-container/20"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface") +
              " flex items-center gap-3 px-4 py-3 rounded-lg font-label-bold text-label-bold transition-colors"
            }
          >
            {t("contact")}
          </Link>
          <hr className="my-3 border-outline-variant/30" />
          {user ? (
            <div className="px-4 space-y-3">
              <p className="font-body-md text-body-md text-on-surface-variant truncate">{user.email}</p>
              <Link
                href="/perfil"
                onClick={closeMobile}
                className="block w-full text-center bg-white border border-outline-variant text-on-surface font-label-bold text-label-bold rounded-lg hover:bg-surface-container transition-all px-5 py-2.5"
              >
                {t("myProfile")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  closeMobile()
                  handleSignOut()
                }}
                disabled={signingOut}
                className="block w-full text-center text-error font-label-bold text-label-bold rounded-lg hover:bg-error-container/10 transition-all px-5 py-2.5 disabled:opacity-50 cursor-pointer"
              >
                {signingOut ? t("signingOut") : t("signOut")}
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
            href={user ? "/donate" : "/membresia"}
            onClick={closeMobile}
            className="block w-full text-center bg-primary text-on-primary font-label-bold text-label-bold px-6 py-2.5 rounded-lg transition-all shadow-sm"
          >
            {user ? t("supportMission") : t("becomeMember")}
          </Link>
        </div>
      </div>
    </nav>
    {user?.role === "administrador" && !isAdmin && (
      <Link
        href="/admin"
        className={`fixed bottom-6 right-6 z-50 bg-primary text-on-primary font-label-bold text-label-bold px-6 py-4 rounded-2xl shadow-[0_8px_30px_0_rgba(7,68,105,0.3)] hover:bg-primary/90 hover:shadow-[0_8px_40px_0_rgba(7,68,105,0.4)] transition-all duration-300 active:scale-95 flex items-center gap-2 ${
          scrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <Icon name="dashboard" size={20} /> Admin
      </Link>
    )}
    </>
  )
}
