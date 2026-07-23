"use client"

import { useEffect, useState } from "react"
import Icon from "@/components/Icon"

declare global {
  interface Window {
    googleTranslateElementInit: () => void
    google?: {
      translate: {
        TranslateElement: new (
          config: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
          elementId: string,
        ) => void
      }
    }
  }
}

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
]

export default function TranslateButton() {
  const [currentLang, setCurrentLang] = useState("en")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/[a-z-]+\/([a-z-]{2,5})/)
    if (match) setCurrentLang(match[1])

    if (document.getElementById("google-translate-script")) return

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement({
          pageLanguage: "en",
          includedLanguages: "en,es,fr,pt",
          autoDisplay: false,
        }, "google_translate_element")
      }
    }

    const script = document.createElement("script")
    script.id = "google-translate-script"
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true
    document.head.appendChild(script)
  }, [])

  const switchLanguage = (code: string) => {
    if (code === currentLang) { setOpen(false); return }
    document.cookie = `googtrans=/en/${code}; path=/; max-age=31536000`
    window.location.reload()
  }

  const current = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0]

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-primary text-on-primary shadow-lg hover:bg-primary/90 transition-all pl-3 pr-4 py-2.5 cursor-pointer"
        aria-label="Translate language"
      >
        <Icon name="translate" size={20} />
        <span className="text-sm font-medium">{currentLang === "es" ? "Lenguaje" : "Languages"}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-3 bg-white rounded-xl shadow-xl border border-outline-variant/30 py-2 min-w-[170px] z-50">
            {LANGUAGES.map(l => {
              const active = l.code === currentLang
              return (
                <button
                  key={l.code}
                  onClick={() => switchLanguage(l.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-surface-container-low ${
                    active ? "text-primary font-semibold" : "text-on-surface-variant"
                  }`}
                >
                  <span className="text-base leading-none">{l.flag}</span>
                  {l.label}
                  {active && <span className="ml-auto text-xs text-primary">✓</span>}
                </button>
              )
            })}
          </div>
        </>
      )}

      <div id="google_translate_element" className="absolute -left-[9999px]" />
    </div>
  )
}
