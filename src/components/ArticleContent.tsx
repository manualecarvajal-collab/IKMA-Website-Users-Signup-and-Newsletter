"use client"

import { useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/lib/useLanguage"

interface ArticleContentProps {
  contenidoHtml: string | null
  resumen: string | null
  isAuthenticated: boolean
}

export default function ArticleContent({ contenidoHtml, resumen, isAuthenticated }: ArticleContentProps) {
  const lang = useLanguage()
  const t = (en: string, es: string) => lang === "es" ? es : en
  const [showFull, setShowFull] = useState(false)

  const content = contenidoHtml || `<p>${resumen || ""}</p>`
  const firstParagraphEnd = content.indexOf("</p>") + 4
  const firstParagraph = content.slice(0, firstParagraphEnd)
  const restContent = content.slice(firstParagraphEnd)

  if (showFull || isAuthenticated) {
    return (
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <div className="relative">
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: firstParagraph }}
      />
      {restContent && (
        <div className="relative mt-4">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/60 to-surface z-10 pointer-events-none" />
          <div className="blur-sm select-none opacity-50 max-h-40 overflow-hidden">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: restContent }}
            />
          </div>
          <div className="relative z-20 -mt-8 flex flex-col items-center gap-4 pt-8 pb-12">
            <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-sm">
              {t("Register to continue reading this article and access our full library.", "Regístrate para seguir leyendo este artículo y acceder a nuestra biblioteca completa.")}
            </p>
            <Link
              href="/registro"
              className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all inline-block"
            >
              {t("Sign up for free", "Regístrate gratis")}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
