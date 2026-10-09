"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { CONTACT } from "./contact"

/**
 * Nav de la conferencia, calcada del prototipo de Figma.
 *
 * Es UNA sola píldora que se morph-ea: los grupos laterales van en `absolute`
 * y se desvanecen mientras el `max-width` se encoge; el logo va en el flujo,
 * así que queda centrado durante todo el encogido (no es un cruce de dos
 * píldoras).
 *
 * Se expande al pasar el cursor (o recibir foco de teclado) y también al
 * llegar con el scroll a la sección de inscripción, donde se queda abierta
 * y estable, como en el prototipo.
 */
/** Sección a la que apunta "Sign Up Now": al llegar, la píldora queda abierta. */
const FORM_SECTION_ID = "registro"

export default function ConferenciaNav() {
  const t = useTranslations("Conferencia.nav")
  const [hovered, setHovered] = useState(false)
  const [atForm, setAtForm] = useState(false)

  // La píldora se abre al llegar al formulario y SE QUEDA abierta: no se vuelve
  // a cerrar al subir, solo cuando se llega otra vez arriba del todo.
  useEffect(() => {
    const onScroll = () => {
      const section = document.getElementById(FORM_SECTION_ID)
      if (!section) return
      const reachedForm = section.getBoundingClientRect().top <= 4
      setAtForm((prev) => {
        if (reachedForm) return true
        return window.scrollY <= 8 ? false : prev
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  const expanded = hovered || atForm

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className={`pointer-events-auto relative mx-auto flex w-full items-center justify-center overflow-hidden rounded-full border border-black/5 bg-white/90 shadow-[0_4px_24px_rgba(7,68,105,0.10)] backdrop-blur-md transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          expanded ? "max-w-[1120px] px-6 py-2.5" : "max-w-[132px] px-5 py-2"
        }`}
      >
        {/* Izquierda: web + redes */}
        <div
          className={`absolute left-6 hidden items-center gap-4 md:flex text-[13px] text-[#3A3A3C] transition-all duration-500 motion-reduce:transition-none ${
            expanded
              ? "translate-x-0 opacity-100"
              : "pointer-events-none -translate-x-3 opacity-0"
          }`}
        >
          <a
            href={CONTACT.websiteUrl}
            className="whitespace-nowrap rounded transition-colors hover:text-[#0435CF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0435CF]"
          >
            {CONTACT.website}
          </a>
          <span className="flex items-center gap-2 text-[#0435CF]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3-.04-1.3-.13-2.45-.13-2.4 0-4.05 1.47-4.05 4.17V9.9H7.5V13h2.7v8h3.3Z" />
            </svg>
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
            </svg>
          </span>
        </div>

        {/* Logo (en el flujo: queda centrado mientras la píldora se encoge) */}
        <img
          src="/logo.webp"
          alt="IKMA"
          className={`w-auto shrink-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            expanded ? "h-8 md:h-9" : "h-6"
          }`}
        />

        {/* Derecha: contacto */}
        <div
          className={`absolute right-6 hidden items-center gap-5 md:flex text-[13px] text-[#3A3A3C] transition-all duration-500 motion-reduce:transition-none ${
            expanded
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-3 opacity-0"
          }`}
        >
          <a
            href={`mailto:${CONTACT.email}`}
            className="whitespace-nowrap rounded transition-colors hover:text-[#0435CF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0435CF]"
          >
            {CONTACT.email}
          </a>
          {/* El teléfono sólo aparece cuando IKMA confirme el número real;
              hasta entonces no se inventa un dato de contacto. */}
          {CONTACT.phone && (
            <a
              href={`tel:${CONTACT.phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-2 whitespace-nowrap rounded transition-colors hover:text-[#0435CF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0435CF]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-[#0435CF]"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2Z" />
              </svg>
              {t("callUs")}
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
