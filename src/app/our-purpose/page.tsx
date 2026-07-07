import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Purpose, Mission and Values - IKMA",
  description:
    "Discover the purpose, mission, and core values that drive the International Kingdom Medical Association.",
}

const pillars = [
  {
    icon: "medical_services",
    title: "Clinical Care and Community Partnership",
    label: "We strive to:",
    items: [
      "Deliver holistic healthcare that respects both the physical and spiritual dimensions of well-being.",
      "Collaborate with multidisciplinary healthcare professionals to provide comprehensive, patient-centered care.",
      "Partner with faith-based and community organizations to strengthen health outreach and support services.",
      "Expand access to quality healthcare through the development of outpatient clinics and community-based services.",
      "Serve underserved, disadvantaged, and rural populations where access to healthcare remains limited.",
    ],
  },
  {
    icon: "school",
    title: "Education and Empowerment",
    label: "We are committed to:",
    items: [
      "Providing accessible, evidence-based medical education for healthcare professionals, patients, and communities.",
      "Developing targeted educational programs that address specific health needs, knowledge gaps, and practical challenges.",
      "Empowering individuals and communities with the knowledge needed to make informed health decisions.",
    ],
  },
  {
    icon: "public",
    title: "Public and Global Health Engagement",
    label: "We seek to:",
    items: [
      "Contribute to initiatives that improve public health and enhance population well-being locally and globally.",
      "Promote awareness and advocate for policies that support equitable, effective, and sustainable healthcare systems.",
      "Work alongside humanitarian and relief organizations to deliver coordinated healthcare support.",
      "Extend assistance to vulnerable communities both locally and internationally, particularly in underserved regions.",
    ],
  },
  {
    icon: "science",
    title: "Research and Scientific Advancement",
    label: "We are dedicated to:",
    items: [
      "Conducting and supporting research that explores innovative approaches to prevention, diagnosis, and treatment.",
      "Advancing laboratory, diagnostic, and clinical technologies through scientific investigation.",
      "Securing funding and resources to support impactful and innovative healthcare projects.",
      "Evaluating the safety, effectiveness, and reproducibility of medical interventions and methodologies.",
      "Publishing and sharing research findings to promote transparency, accountability, and the advancement of medical knowledge.",
    ],
  },
]

const tickerImages = [
  "https://lh3.googleusercontent.com/aida/AP1WRLu6AkRRhmvUNao3FlmVHVTlqfLdyfyI3nr8eEz9AhyNmwCq7ns-oL5fDmRpJ72wy3B5sHyhDWNV38xPp4EzBSyJuRCO5UVfuQ2GadSM34eTi8ounElaNIqyTgsRWmhlXMt4DwlX7jSbpwLrFrZP8GDnyCkCMa2DJH4MyGnxVsTsfD6v7e-vIR_8u9MK_WFd6SHPfmxQk2ss6fe7vCgrDMe0NudAP7u2XSkP4SBahIYTtXaFX6LBSZX7iw",
  "https://lh3.googleusercontent.com/aida/AP1WRLuCDdOzD-xkX3SXGNikP54XkXcXVpreWdrniwvZuHrBo2JRCl2R2_hHBw6qNzR3S60AqqsDyQvJfN2S9SvM4J2dUdKDZfjEHiF96KzE35Nn1n3NXL7e6zopHnoW002otida20w2bkUzPRyaqlLjQhbHw1iQAR-NQhdmUBYz0x19oDLVeELM_nflcRUjurdkufSq_bA-sq8BQpn7gs6R1asRzunlDrXuwl3l64sORyezUltHVKBg5pS2mg",
  "https://lh3.googleusercontent.com/aida/AP1WRLtRTvIzLr__tCca171OvF5aloy1QJWqhUAs4FBdtmwY89aMnn2HXLwQocRvBoPXMAGP2KZZ9m6Vjnv42B9U9CKMSR8qlVlPtrI_niHaHh4NwWe0PXQdP1l2d-x_6FfYeLstKR2_BK8xnFzxhhmh9JBKmIGXhXFYMH8orqTzTh4uJy5Df6u-YPcDmNmEPAa4oX8_5SDI62HgmEQuPoop2wLNa-sh184gcvoizogOLIX3KnOBIkP-A1Cd9g",
  "https://lh3.googleusercontent.com/aida/AP1WRLvVNZYFIT4XXfVeoMcbySrAxvfuapp5WCZpGJJePLHwU17kBPVM9FzzbMiV_0niwI-tOsf2uQlWeXJZIJMe1Q-9DwLztpZZcWjo5nbOks7HknDSqN3Rrj3pZPUfdijrV9OMwJg45QXrHC8nVBGNPJseftwaXH6rznos5QWj7UggtMNMe1j711UCx5BQPdOpnjCoTGN-VJdqTJSVC-1pZxJ1t-XBRD7lFiNcoYGvMAdyI8HHvYP-xdEEjA",
  "https://lh3.googleusercontent.com/aida/AP1WRLu1Pg0nqB_dMcIi8iXqzzr038eTLWxah_3cvHt-1BI04IM1CxMxRiclGz_FYvUx6UAMGSy1wrVDWwxtHI23zl2EGC7FQNReFdDxwY7DfkTWuJR6atDzSaE-K3uD0YFGg7WWWnPTK9DGfPzOLjQ6nWMQfw8ppJJOEbeJbaIOEyR-Jhh0nt9mb1cCAmIjspZvz5dXbleCeaE_2qNkw2xS-K4--6MwdiHvSaWFG3J6PgRs-3SWthAeH7le",
  "https://lh3.googleusercontent.com/aida/AP1WRLu2xhbwVPaLCzI9OtH2VvW_4KPGhKbxI5I-bzVAwZPUj8AWWrVt7fsbJOYRz-3FAKJnm3hkgv11uKLJZ5jSsn7Gn0-Vp5BaUaNd3_SI5jm7fWsdqpDuh1JPvbmF2yuNRZ45mm0JmjTFI6n1gdBBwU5xQlShdSfoIjcryEkh5rVW9VkPjwpqi5-3Flnfw5fsY7bThJ6aci4NQikFp4_pL6wCEszWy4evKfQ1mAUkpMiIi0QsFHEdzy0a",
]

export default function OurPurposePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary pt-20 pb-32 md:pt-32 md:pb-48">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay">
          <img
            src={tickerImages[5]}
            alt=""
            className="w-full h-full object-cover"
            style={{ maskImage: "linear-gradient(to right, black 0%, black 30%, transparent 100%)" }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{ backdropFilter: "blur(8px)", maskImage: "linear-gradient(to left, transparent 0%, transparent 30%, black 100%)" }}
        />
        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-4xl">
            <h1 className="font-headline-lg text-headline-md text-white mb-12">
              Our Purpose, Mission, and Values
            </h1>
            <div className="space-y-8 text-white/90 font-body-lg text-body-md leading-relaxed">
              <p>
                We are a collective of medically trained professionals who believe we have been called and entrusted with a purpose by God (Elohim). Guided by the principles reflected in Romans 8:29–30, we view our work as more than a profession—it is a calling to serve others with integrity, humility, compassion, and excellence.
              </p>
              <p>
                We believe that God has equipped us with the capacity for discipline, innovation, critical thinking, and scientific discovery. These gifts enable us to pursue excellence in healthcare, advance medical knowledge, and develop responsible solutions that address the needs of individuals and communities.
              </p>
              <p>
                Our mission is to integrate faith, science, and service in ways that promote healing, dignity, and lasting well-being. We are committed to delivering ethical, evidence-based, and impactful solutions through the following areas of focus:
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto -mt-16 md:-mt-24 relative z-20 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="bg-white rounded-lg shadow-[0_4px_20px_rgba(26,77,109,0.08)] p-8 md:p-10 border border-surface-variant h-full flex flex-col hover:border-primary-container transition-colors duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                    {pillar.icon}
                  </span>
                </div>
                <h2 className="font-headline-md text-body-lg text-primary">
                  {pillar.title}
                </h2>
              </div>
              <p className="font-label-bold text-label-bold text-secondary mb-4 uppercase tracking-wider">
                {pillar.label}
              </p>
              <ul className="space-y-3 font-label-sm text-label-bold text-on-surface-variant flex-grow">
                {pillar.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-sm mt-1 shrink-0">
                      check
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Commitment */}
      <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low border-t border-surface-variant">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-8">
            Our Commitment
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            In all that we do, we are committed to upholding the highest standards of scientific rigor, ethical responsibility, and compassionate service. Through the integration of faith, medicine, education, research, and community engagement, we aim to contribute to a healthcare system that not only treats illness but also restores hope, preserves dignity, and promotes the long-term well-being of individuals and communities.
          </p>
        </div>
      </section>

      {/* Image Ticker */}
      <section className="py-16 overflow-hidden bg-background">
        <style>{`
          @keyframes ticker-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-ticker {
            display: flex;
            width: max-content;
            animation: ticker-scroll 40s linear infinite;
          }
          .animate-ticker:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="relative">
          <div className="animate-ticker gap-8 flex">
            {[...tickerImages, ...tickerImages].map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-[250px] w-auto rounded-lg shadow-[0_4px_20px_rgba(26,77,109,0.08)] object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
