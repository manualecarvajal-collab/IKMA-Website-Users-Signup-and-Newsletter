"use client"

import { useState, useEffect } from "react"

export function useLanguage() {
  const [lang, setLang] = useState("en")

  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/[a-z-]+\/([a-z-]{2,5})/)
    setLang(match ? match[1] : "en")
  }, [])

  return lang
}
