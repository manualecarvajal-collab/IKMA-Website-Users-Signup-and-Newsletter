"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import Icon from "./Icon"

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
]

export default function LocaleSwitch() {
  const locale = useLocale()
  const [open, setOpen] = useState(false)

  const currentLocale = locale === "es" ? "es" : "en"

  const switchLocale = (code: string) => {
    if (code === currentLocale) { setOpen(false); return }
    document.cookie = `googtrans=/en/${code}; path=/; max-age=31536000`
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`
    window.location.reload()
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-primary text-on-primary shadow-lg hover:bg-primary/90 transition-all pl-3 pr-4 py-2.5 cursor-pointer"
        aria-label="Switch language"
      >
        <Icon name="translate" size={20} />
        <span className="text-sm font-medium uppercase">{currentLocale}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-3 bg-white rounded-xl shadow-xl border border-outline-variant/30 py-2 min-w-[120px] z-50">
            {LANGUAGES.map((l) => {
              const active = l.code === currentLocale
              return (
                <button
                  key={l.code}
                  onClick={() => switchLocale(l.code)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-surface-container-low ${
                    active ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {l.label}
                  {active && <Icon name="check" size={14} />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
