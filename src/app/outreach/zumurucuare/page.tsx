import type { Metadata } from "next"
import { promises as fs } from "fs"
import path from "path"

export const metadata: Metadata = {
  title: "Zumurucuare Outreach - IKMA",
  description:
    "Comprehensive care outreach in the Zumurucuare sector of Coro, Venezuela.",
}

export default async function ZumurucuarePage() {
  const imagesDir = path.join(process.cwd(), "public", "outreach", "zumurucuare")
  const files = await fs.readdir(imagesDir)
  const images = files
    .filter((f) => f.endsWith(".jpg"))
    .sort((a, b) => b.localeCompare(a))

  return (
    <>
      <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={`/outreach/zumurucuare/${images[0]}`}
            alt="Zumurucuare outreach"
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
            Outreach in Zumurucuare
          </h1>
          <p className="font-body-lg text-body-lg text-white/80">May 2025</p>
        </div>
      </section>

      <section className="py-section-padding bg-surface-bright">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6 text-on-surface-variant">
              <p className="font-body-lg text-body-lg leading-relaxed">
                Recently, we held a comprehensive care outreach in the Zumurucuare sector of
                Coro, where a multidisciplinary team was deployed to bring hope and
                well-being to our community.
              </p>
              <p className="font-body-lg text-body-lg leading-relaxed">
                As part of the IKMA organization&apos;s plan, our purpose goes beyond
                medicine; we seek to provide holistic care founded on the principles of the
                Kingdom of God, offering care and compassion to every patient who walked
                through our doors.
              </p>
              <p className="font-body-lg text-body-lg leading-relaxed">
                Thanks to the hard work of general practitioners, mental health specialists,
                physical therapists, veterinarians, pediatricians, and volunteers, we were
                able to serve <strong>222 people</strong> with dedication and excellence.
              </p>
              <div className="pt-6 border-t border-outline-variant">
                <p className="font-body-lg text-body-lg text-primary font-semibold">
                  Thank you to every professional who joined this call to service. We
                  continue to move forward!
                </p>
              </div>
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
                    src={`/outreach/zumurucuare/${img}`}
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
