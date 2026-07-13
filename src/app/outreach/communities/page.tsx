import type { Metadata } from "next"
import { promises as fs } from "fs"
import path from "path"

export const metadata: Metadata = {
  title: "Venezuela Communities - Outreach - IKMA",
  description:
    "Multidisciplinary healthcare deployment in Venezuelan communities.",
}

export default async function CommunitiesPage() {
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
            alt="Venezuela Communities outreach"
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 hero-vignette" />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <span className="inline-block px-4 py-1 mb-6 bg-primary-container/70 text-on-primary font-label-bold text-label-bold rounded-full border border-primary-fixed/20 backdrop-blur-sm tracking-wider uppercase">
            Mission Chronicle
          </span>
          <h1 className="font-headline-lg text-headline-lg text-white mb-4 leading-tight">
            Venezuela Communities
          </h1>
        </div>
      </section>

      <section className="py-section-padding bg-surface-bright">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6 text-on-surface-variant">
              <p className="font-body-lg text-body-lg leading-relaxed">
                The deployment of our doctors in the communities of Venezuela has become one
                of the most powerful and positive experiences for our organization.
              </p>
              <p className="font-body-lg text-body-lg leading-relaxed">
                This is not just a multidisciplinary deployment of healthcare professionals
                from different specialties (dentistry, physical therapy, general medicine,
                pediatrics...); it is the living manifestation of God&apos;s love through
                each healthcare professional.
              </p>
              <p className="font-body-lg text-body-lg leading-relaxed">
                Beyond the numbers, the true result is measured in lives. Men, women,
                children, and adolescents have been completely transformed in every
                consultation.
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
