import type { Metadata } from "next"
import { promises as fs } from "fs"
import path from "path"
import { getTranslations } from "next-intl/server"

export const metadata: Metadata = {
  title: "Venezuela Communities - Outreach - IKMA",
  description:
    "Multidisciplinary healthcare deployment in Venezuelan communities.",
}

export default async function CommunitiesPage() {
  const t = await getTranslations("OutreachCommunities")
  const imagesDir = path.join(process.cwd(), "public", "outreach", "communities")
  const files = await fs.readdir(imagesDir)
  const images = files
    .filter((f) => f.endsWith(".webp"))
    .sort((a, b) => b.localeCompare(a))

  return (
    <>
      <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={`/outreach/communities/${images[0]}`}
            alt=""
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 hero-vignette" />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <span className="inline-block px-4 py-1 mb-6 bg-primary-container/70 text-on-primary font-label-bold text-label-bold rounded-full border border-primary-fixed/20 backdrop-blur-sm tracking-wider uppercase">
            {t("badge")}
          </span>
          <h1 className="font-headline-lg text-headline-lg text-white mb-4 leading-tight">
            {t("title")}
          </h1>
        </div>
      </section>

      <section className="py-section-padding bg-surface-bright">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6 text-on-surface-variant">
              <p className="font-body-lg text-body-lg leading-relaxed">
                {t("paragraph1")}
              </p>
              <p className="font-body-lg text-body-lg leading-relaxed">
                {t("paragraph2")}
              </p>
              <p className="font-body-lg text-body-lg leading-relaxed">
                {t("paragraph3")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {images.length > 1 && (
        <section className="pb-section-padding bg-surface-bright">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.slice(1).map((img) => (
                <div key={img} className="rounded-xl overflow-hidden bg-surface-container">
                  <img
                    src={`/outreach/communities/${img}`}
                    alt=""
                    className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
