import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us - IKMA",
  description: "Healing Through Faith & Excellence. Learn about the International Kingdom Medical Association's mission, core values, and leadership.",
}

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-12 md:py-section-padding px-margin-mobile md:px-margin-desktop bg-surface-container-low">
        <div className="max-w-container-max md:max-w-[80vw] mx-auto grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
          <div className="space-y-6">
            <span className="font-label-bold text-label-bold text-tertiary uppercase tracking-widest">Our Foundation</span>
            <h1 className="font-headline-xl text-headline-xl text-primary">Healing Through Faith &amp; Excellence</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              The International Kingdom Medical Association (IKMA) was established on the principle that compassionate
              medical care and unwavering faith are inseparable. We provide essential medical funding and support systems,
              guided by a higher calling to serve those in their most vulnerable moments.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-[0_20px_40px_0_rgba(7,68,105,0.08)]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvB1sgU5lKy5NAqtGe_8Zqxkqvld9g4j8MSmgk3rIdV5ZwQ3oyERXGORkrJi1LtfvN96-IqYhk5iWxE5z0yBVuDShQd9P77VoA1iMKxSG6eu1O1yLhKpWDH3OzlKKXwTNJF7LqiF0o2AqXbaGnJRMJkyrUxYzfkZ6lJbrYgaC4qXIg45PQdlzmNyFl-4Xr0Plqgpe_PEVHYWg1pOOd4okybtmHM2cAbJVGr0zefe2viy_6jAJN-S7n7TjFPF09mSXVIjbFfMOjl5E"
              alt="Medical professionals working together"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-12 md:py-section-padding px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max md:max-w-[80vw] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Our Core Values</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              The pillars that guide our medical funding program and daily operations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {[
              { icon: "favorite", title: "Compassionate Care", desc: "We approach every medical funding request with empathy, recognizing the profound human element behind every application." },
              { icon: "verified", title: "Medical Excellence", desc: "We partner exclusively with verified professionals and institutions to ensure the highest standard of care is funded." },
              { icon: "volunteer_activism", title: "Faith-Driven Mission", desc: "Our actions are rooted in Christian stewardship, managing resources wisely to maximize our impact on healing." },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest p-8 rounded-xl border border-surface-variant hover:shadow-[0_20px_40px_0_rgba(7,68,105,0.06)] transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center mb-6 text-primary">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-background mb-3">{item.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
