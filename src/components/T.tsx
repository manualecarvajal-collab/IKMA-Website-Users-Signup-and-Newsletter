"use client"

import { useLanguage } from "@/lib/useLanguage"
import type { ReactNode } from "react"

export function T({ en, es, className }: { en: ReactNode; es: ReactNode; className?: string }) {
  const lang = useLanguage()
  return <span className={`notranslate ${className || ""}`}>{lang === "es" ? es : en}</span>
}
