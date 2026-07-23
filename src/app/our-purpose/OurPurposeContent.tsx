"use client"

import { useLanguage } from "@/lib/useLanguage"
import Icon from "@/components/Icon"

const pillars = [
  {
    icon: "medical_services",
    title: { en: "Clinical Care and Community Partnership", es: "Atención Clínica y Asociación Comunitaria" },
    label: { en: "We strive to:", es: "Nos esforzamos por:" },
    items: [
      { en: "Deliver holistic healthcare that respects both the physical and spiritual dimensions of well-being.", es: "Brindar atención médica integral que respete tanto las dimensiones físicas como espirituales del bienestar." },
      { en: "Collaborate with multidisciplinary healthcare professionals to provide comprehensive, patient-centered care.", es: "Colaborar con profesionales de la salud multidisciplinarios para proporcionar atención integral centrada en el paciente." },
      { en: "Partner with faith-based and community organizations to strengthen health outreach and support services.", es: "Asociarnos con organizaciones basadas en la fe y comunitarias para fortalecer el alcance sanitario y los servicios de apoyo." },
      { en: "Expand access to quality healthcare through the development of outpatient clinics and community-based services.", es: "Expandir el acceso a atención médica de calidad mediante el desarrollo de clínicas ambulatorias y servicios comunitarios." },
      { en: "Serve underserved, disadvantaged, and rural populations where access to healthcare remains limited.", es: "Atender a poblaciones desatendidas, desfavorecidas y rurales donde el acceso a la atención médica sigue siendo limitado." },
    ],
  },
  {
    icon: "school",
    title: { en: "Education and Empowerment", es: "Educación y Empoderamiento" },
    label: { en: "We are committed to:", es: "Nos comprometemos a:" },
    items: [
      { en: "Providing accessible, evidence-based medical education for healthcare professionals, patients, and communities.", es: "Proveer educación médica accesible y basada en evidencia para profesionales de la salud, pacientes y comunidades." },
      { en: "Developing targeted educational programs that address specific health needs, knowledge gaps, and practical challenges.", es: "Desarrollar programas educativos dirigidos que aborden necesidades específicas de salud, vacíos de conocimiento y desafíos prácticos." },
      { en: "Empowering individuals and communities with the knowledge needed to make informed health decisions.", es: "Empoderar a individuos y comunidades con el conocimiento necesario para tomar decisiones de salud informadas." },
    ],
  },
  {
    icon: "public",
    title: { en: "Public and Global Health Engagement", es: "Compromiso con la Salud Pública y Global" },
    label: { en: "We seek to:", es: "Buscamos:" },
    items: [
      { en: "Contribute to initiatives that improve public health and enhance population well-being locally and globally.", es: "Contribuir a iniciativas que mejoren la salud pública y el bienestar de la población a nivel local y global." },
      { en: "Promote awareness and advocate for policies that support equitable, effective, and sustainable healthcare systems.", es: "Promover la concienciación y abogar por políticas que apoyen sistemas de salud equitativos, efectivos y sostenibles." },
      { en: "Work alongside humanitarian and relief organizations to deliver coordinated healthcare support.", es: "Trabajar junto a organizaciones humanitarias y de socorro para brindar apoyo de salud coordinado." },
      { en: "Extend assistance to vulnerable communities both locally and internationally, particularly in underserved regions.", es: "Extender asistencia a comunidades vulnerables tanto locales como internacionales, particularmente en regiones desatendidas." },
    ],
  },
  {
    icon: "science",
    title: { en: "Research and Scientific Advancement", es: "Investigación y Avance Científico" },
    label: { en: "We are dedicated to:", es: "Estamos dedicados a:" },
    items: [
      { en: "Conducting and supporting research that explores innovative approaches to prevention, diagnosis, and treatment.", es: "Realizar y apoyar investigaciones que exploren enfoques innovadores para la prevención, el diagnóstico y el tratamiento." },
      { en: "Advancing laboratory, diagnostic, and clinical technologies through scientific investigation.", es: "Avanzar en tecnologías de laboratorio, diagnóstico y clínicas a través de la investigación científica." },
      { en: "Securing funding and resources to support impactful and innovative healthcare projects.", es: "Asegurar financiamiento y recursos para apoyar proyectos de salud impactantes e innovadores." },
      { en: "Evaluating the safety, effectiveness, and reproducibility of medical interventions and methodologies.", es: "Evaluar la seguridad, efectividad y reproducibilidad de las intervenciones y metodologías médicas." },
      { en: "Publishing and sharing research findings to promote transparency, accountability, and the advancement of medical knowledge.", es: "Publicar y compartir hallazgos de investigación para promover la transparencia, la rendición de cuentas y el avance del conocimiento médico." },
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

export default function OurPurposeContent() {
  const lang = useLanguage()
  const t = (en: string, es: string) => lang === "es" ? es : en

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
              {t("Our Purpose, Mission, and Values", "Nuestro Propósito, Misión y Valores")}
            </h1>
            <div className="space-y-8 text-white/90 font-body-lg text-body-md leading-relaxed">
              <p>
                {t(
                  "We are a collective of medically trained professionals who believe we have been called and entrusted with a purpose by God (Elohim). Guided by the principles reflected in Romans 8:29–30, we view our work as more than a profession—it is a calling to serve others with integrity, humility, compassion, and excellence.",
                  "Somos un colectivo de profesionales capacitados en medicina que creemos haber sido llamados y encomendados con un propósito por Dios (Elohim). Guiados por los principios reflejados en Romanos 8:29–30, vemos nuestro trabajo como más que una profesión—es un llamado a servir a otros con integridad, humildad, compasión y excelencia."
                )}
              </p>
              <p>
                {t(
                  "We believe that God has equipped us with the capacity for discipline, innovation, critical thinking, and scientific discovery. These gifts enable us to pursue excellence in healthcare, advance medical knowledge, and develop responsible solutions that address the needs of individuals and communities.",
                  "Creemos que Dios nos ha equipado con la capacidad para la disciplina, la innovación, el pensamiento crítico y el descubrimiento científico. Estos dones nos permiten buscar la excelencia en la atención médica, avanzar el conocimiento médico y desarrollar soluciones responsables que aborden las necesidades de individuos y comunidades."
                )}
              </p>
              <p>
                {t(
                  "Our mission is to integrate faith, science, and service in ways that promote healing, dignity, and lasting well-being. We are committed to delivering ethical, evidence-based, and impactful solutions through the following areas of focus:",
                  "Nuestra misión es integrar la fe, la ciencia y el servicio de maneras que promuevan la sanidad, la dignidad y el bienestar duradero. Estamos comprometidos a ofrecer soluciones éticas, basadas en evidencia y de impacto a través de las siguientes áreas de enfoque:"
                )}
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
              key={pillar.title.en}
              className="bg-white rounded-lg shadow-[0_4px_20px_rgba(26,77,109,0.08)] p-8 md:p-10 border border-surface-variant h-full flex flex-col hover:border-primary-container transition-colors duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <Icon name={pillar.icon} size={30} fill="currentColor" />
                </div>
                <h2 className="font-headline-md text-body-lg text-primary">
                  {pillar.title[lang === "es" ? "es" : "en"]}
                </h2>
              </div>
              <p className="font-label-bold text-label-bold text-secondary mb-4 uppercase tracking-wider">
                {pillar.label[lang === "es" ? "es" : "en"]}
              </p>
              <ul className="space-y-3 font-label-sm text-label-bold text-on-surface-variant flex-grow">
                {pillar.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Icon name="check" size={14} className="text-primary mt-1 shrink-0" />
                    <span>{item[lang === "es" ? "es" : "en"]}</span>
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
            {t("Our Commitment", "Nuestro Compromiso")}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            {t(
              "In all that we do, we are committed to upholding the highest standards of scientific rigor, ethical responsibility, and compassionate service. Through the integration of faith, medicine, education, research, and community engagement, we aim to contribute to a healthcare system that not only treats illness but also restores hope, preserves dignity, and promotes the long-term well-being of individuals and communities.",
              "En todo lo que hacemos, nos comprometemos a mantener los más altos estándares de rigor científico, responsabilidad ética y servicio compasivo. A través de la integración de la fe, la medicina, la educación, la investigación y la participación comunitaria, aspiramos a contribuir a un sistema de salud que no solo trate enfermedades, sino que también restaure la esperanza, preserve la dignidad y promueva el bienestar a largo plazo de individuos y comunidades."
            )}
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
