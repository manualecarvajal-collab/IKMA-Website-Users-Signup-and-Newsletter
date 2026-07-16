import type { Metadata } from "next"
import Icon from "@/components/Icon"

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
  "/outreach/zumurucuare/705891641_122224595906056158_2670985528843388643_n.webp",
  "/outreach/communities/722754014_122226599486056158_2300381472205760622_n.webp",
  "/outreach/communities/722859201_122226599360056158_8224432456366207890_n.webp",
  "/outreach/zumurucuare/705147654_122224596038056158_8112663266005204686_n.webp",
  "/outreach/zumurucuare/706615125_122224595996056158_6078982541363949541_n.webp",
  "/outreach/communities/724700384_122226599642056158_6007277332430952663_n.webp",
  "/outreach/zumurucuare/704954916_122224596224056158_8423650010699471845_n.webp",
  "/outreach/zumurucuare/707694952_122224596092056158_4994212879144635464_n.webp",
  "/outreach/communities/724073318_122226599612056158_6550501176011429048_n.webp",
  "/outreach/zumurucuare/706028451_122224596134056158_6000027931194377977_n.webp",
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
                  <Icon name={pillar.icon} size={30} fill="currentColor" />
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
                    <Icon name="check" size={14} className="text-primary mt-1 shrink-0" />
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
            animation: ticker-scroll 40s linear infinite;
          }
          .animate-ticker:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="relative overflow-hidden">
          <div className="animate-ticker flex w-max">
            {[...tickerImages, ...tickerImages].map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-[250px] w-auto rounded-lg shadow-[0_4px_20px_rgba(26,77,109,0.08)] object-cover shrink-0 mr-8"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
