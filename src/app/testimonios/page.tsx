import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import Icon from "@/components/Icon"
import TestimonialsExplorer, { type Testimonial } from "@/components/TestimonialsExplorer"

export const metadata: Metadata = {
  title: "Testimonios - IKMA",
  description:
    "Historias de sanidad, fe y excelencia clínica de nuestra red global de profesionales de la salud.",
}

export default async function TestimoniosPage() {
  const t = await getTranslations("Testimonials")
  const locale = await getLocale()

  const supabase = await createClient()
  const { data } = await supabase
    .from("testimonios")
    .select("*")
    .eq("publicado", true)
    .order("orden", { ascending: true })
    .order("created_at", { ascending: true })

  const testimonials: Testimonial[] = (data ?? []).map((row) => ({
    name: row.nombre,
    role: (locale === "es" ? row.rol_es : row.rol_en) || "",
    quote: locale === "es" ? row.cita_es : row.cita_en,
    region: row.region as Testimonial["region"],
    image: row.imagen_url,
  }))

  return (
    <>
      <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/testimonios.jpg" alt="" className="w-full h-full object-cover" fetchPriority="high" />
          <div className="absolute inset-0 hero-vignette" />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 mb-6 bg-primary-container/70 text-on-primary font-label-bold text-label-bold rounded-full border border-primary-fixed/20 backdrop-blur-sm tracking-wider uppercase">
              {t("heroBadge")}
            </span>
            <h1 className="font-headline-lg text-headline-lg text-white mb-4 leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="font-body-lg text-body-lg text-white/90 max-w-2xl mx-auto">
              {t("heroSubtitle")}
            </p>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 animate-bounce">
          <span className="font-label-sm text-label-sm tracking-widest uppercase">{t("scroll")}</span>
          <Icon name="expand_more" />
        </div>
      </section>

      <TestimonialsExplorer testimonials={testimonials} />

      <section className="w-full py-section-padding px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-base">{t("ctaTitle")}</h2>
          <p className="font-body-lg text-body-lg text-secondary mb-margin-desktop">{t("ctaSubtitle")}</p>
          <a
            href="/membresia"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-on-primary rounded-full font-label-bold text-label-bold hover:bg-primary/90 transition-colors shadow-md"
          >
            {t("ctaButton")}
            <Icon name="arrow_forward" size={20} className="ml-2" />
          </a>
        </div>
      </section>
    </>
  )
}
