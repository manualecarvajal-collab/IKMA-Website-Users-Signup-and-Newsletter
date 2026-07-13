import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Outreach - IKMA",
  description:
    "The impact of our work: community healthcare initiatives and medical missions in Venezuela.",
}

export default function OutreachPage() {
  return (
    <>
      <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=1920"
            alt="Healthcare community outreach"
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 hero-vignette" />
        </div>

        <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block px-4 py-1 mb-6 bg-primary-container/70 text-on-primary font-label-bold text-label-bold rounded-full border border-primary-fixed/20 backdrop-blur-sm tracking-wider uppercase">
              Our Outreach 
            </span>
            <h1 className="font-headline-lg text-headline-lg text-white mb-4 leading-tight">
              The Impact of Our Work: Care with Purpose
            </h1>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 animate-bounce">
          <span className="font-label-sm text-label-sm tracking-widest uppercase">Scroll</span>
          <span className="material-symbols-outlined">expand_more</span>
        </div>
      </section>

      <section className="py-section-padding bg-surface-bright">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-7">
              <h2 className="font-headline-md text-headline-md text-primary mb-6 border-l-4 border-primary pl-6">
                Healing Beyond Borders
              </h2>
              <div className="space-y-6">
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  Our community deployments and healthcare initiatives in Venezuela go far
                  beyond conventional medical assistance. We firmly believe in a holistic care
                  approach, where physical health, emotional well-being, and the spiritual
                  dimension intertwine to completely transform lives.
                </p>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  By mobilizing multidisciplinary teams—comprising general practitioners,
                  specialists, therapists, and dedicated volunteers—we move directly into the
                  heart of the communities that need it most. Each outreach event is a living
                  manifestation of compassion and service, designed not only to heal bodies
                  but also to plant faith, restore hope, and strengthen the family fabric in
                  every corner we visit.
                </p>
              </div>

              <div className="pt-8 mt-12 border-t border-outline-variant">
                <p className="font-body-md text-body-md text-on-surface-variant italic">
                  Below, we share the chronicles of our most recent interventions—testimonies
                  of an unwavering commitment to the well-being of our people.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white p-8 md:p-10 rounded-xl border border-outline-variant/30 custom-shadow relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                <div className="text-primary mb-6">
                  <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: '"FILL" 1' }}>format_quote</span>
                </div>
                <blockquote className="font-body-lg text-body-lg text-primary leading-snug italic mb-6">
                  &ldquo;Beyond numbers and diagnoses, the true success of our mission is
                  measured in the stories of transformation, the restored smiles, and the
                  lives deeply impacted in every consultation.&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-0.5 bg-primary" />
                  <span className="font-label-bold text-label-bold text-primary tracking-wider uppercase">Our Vision</span>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-3xl text-on-primary">volunteer_activism</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                    Impact Goal
                  </p>
                  <p className="font-body-lg text-body-lg text-primary font-semibold">
                    Community Restoration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-section-padding">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-16">
            <span className="material-symbols-outlined text-primary text-5xl mb-4">clinical_notes</span>
            <h3 className="font-headline-md text-headline-md text-primary">Mission Chronicles</h3>
            <div className="w-24 h-1 bg-primary mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                img: "/outreach/communities/722754014_122226599486056158_2300381472205760622_n.webp",
                date: "General deployment",
                title: "Venezuela Communities",
                desc: "Multidisciplinary healthcare deployment across Venezuelan communities.",
                href: "/outreach/communities",
              },
              {
                img: "/outreach/zumurucuare/705891641_122224595906056158_2670985528843388643_n.webp",
                date: "May 2025",
                title: "Outreach in Zumurucuare",
                desc: "Comprehensive care outreach in the Zumurucuare sector of Coro.",
                href: "/outreach/zumurucuare",
              },
            ].map((card, i) => (
              <a
                key={i}
                href={card.href}
                className="block bg-white rounded-xl overflow-hidden border border-outline-variant/30 custom-shadow group hover:border-primary transition-colors flex flex-col"
              >
                <div className="h-48 bg-surface-container relative overflow-hidden flex-shrink-0">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary text-on-primary font-label-sm text-label-sm rounded-full">
                      {card.date}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h4 className="font-body-lg text-body-lg text-primary font-semibold mb-2">
                    {card.title}
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant flex-1">
                    {card.desc}
                  </p>
                  <span className="inline-flex items-center gap-2 text-primary font-label-bold text-label-bold group-hover:gap-3 transition-all">
                    View Details
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
