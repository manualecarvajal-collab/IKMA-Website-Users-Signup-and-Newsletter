import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { pageSeo } from "@/lib/seo"

export const metadata: Metadata = pageSeo({
  title: "Events - IKMA",
  description: "IKMA events: conferences, teachings and community activities.",
  path: "/events",
})

export default async function EventsPage() {
  const t = await getTranslations("Events")

  return (
    <section className="min-h-[60vh] flex items-center justify-center py-section-padding bg-surface-bright">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
        {/* Encabezado principal de la página: antes era un h2 y /events no tenía h1. */}
        <h1 className="font-headline-md text-headline-md text-on-surface mb-8 max-w-2xl mx-auto leading-snug">
          {t("emptyTitle")}
        </h1>
        <Link
          href="/teachings"
          className="inline-block bg-primary text-on-primary font-label-bold text-label-bold px-8 py-4 rounded-lg hover:bg-primary/90 transition-all duration-300 active:scale-95 shadow-sm"
        >
          {t("viewTeachings")}
        </Link>
      </div>
    </section>
  )
}
