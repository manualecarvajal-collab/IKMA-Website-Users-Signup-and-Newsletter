import type { Metadata } from "next"
import { pageSeo } from "@/lib/seo"
import DonateForm from "./DonateForm"

/**
 * Página de servidor: antes era `"use client"` y por eso no podía exportar
 * metadata, de modo que heredaba el título y la descripción de la home y
 * competía con ella como contenido duplicado.
 */
export const metadata: Metadata = pageSeo({
  title: "Donate - IKMA",
  description:
    "Support IKMA's mission of advancing health equity, education, and holistic transformation. Your gift helps provide medical care and hope to communities worldwide.",
  path: "/donate",
})

export default function DonatePage() {
  return (
    <section className="py-section-padding bg-surface">
      <div className="max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-8">
          <h1 className="font-headline-lg text-headline-md text-primary mb-2">
            Support This Mission
          </h1>
        </div>
        <DonateForm />
      </div>
    </section>
  )
}
