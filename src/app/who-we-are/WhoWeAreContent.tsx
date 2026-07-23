"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/useLanguage"
import Icon from "@/components/Icon"

const boardMembers = [
  {
    img: "/images/Ap-Raymond.webp",
    name: { en: "Ap. Raymond Mabion", es: "Ap. Raymond Mabion" },
    role: { en: "International director and board member", es: "Dir. Internacional y Miembro del Consejo de Administración" },
  },
  {
    img: "/images/De León.webp",
    name: { en: "Ap. Carlos De León", es: "Ap. Carlos De León" },
    role: { en: "Latine America director and board member", es: "Dir. y Miembro del Consejo de Administración para Latinoamérica" },
  },
  {
    img: "/images/Hernández.webp",
    name: { en: "Ap. Dr. Francisco Hernandez", es: "Ap. Dr. Francisco Hernández" },
    role: { en: "Medical director and board member", es: "Dir. Médico y Miembro de la Junta Directiva" },
  },
  {
    img: "/images/marlene-bonney.webp",
    name: { en: "Marlene Boney", es: "Marlene Boney" },
    role: { en: "Treasurer and board member", es: "Tesorera y Miembro de la Junta Directiva" },
  },
  {
    img: "/images/Boneza.webp",
    name: { en: "Dr. Ngata Gratia Boneza", es: "Dr. Ngata Gratia Boneza" },
    role: { en: "CEO-/ manager, board member", es: "Psiquiatra | Dir. Ejecutiva, Gerente y Miembro de la Junta Directiva" },
  },
  {
    img: null,
    name: { en: "Dalia Beltran", es: "Dalia Beltrán" },
    role: { en: "Secretary, certified medical and judicial translator", es: "Secr. y Traductora Médica y Judicial Certificada" },
  },
]

export default function WhoWeAreContent() {
  const lang = useLanguage()
  const t = (en: string, es: string) => lang === "es" ? es : en

  return (
    <>
    <section className="relative w-full min-h-[819px] flex items-center justify-center py-12 md:py-section-padding overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-fixed-dim/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-secondary-fixed/30 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-gutter items-center">
          <div className="col-span-1 lg:col-span-6 flex flex-col space-y-8">
            <div className="inline-flex items-center gap-3">
              <span className="w-8 h-1 bg-primary rounded-full" />
              <h2 className="font-label-bold text-label-bold text-primary tracking-wider uppercase">
                {t("About Us", "Sobre Nosotros")}
              </h2>
            </div>

            <h1 className="font-headline-lg text-headline-lg text-primary">
              {t("Who we are", "Quiénes somos")}
            </h1>

            <div className="space-y-6 text-on-surface-variant max-w-2xl">
              <p className="font-body-lg text-body-md leading-relaxed">
                International Kingdom Medical Association, IKMA, is a company of
                Kingdom-minded apostolic health professionals who are deeply
                committed to integrating God&apos;s Kingdom pattern in our
                medical practice, seeking to bring God&apos;s ordained solutions
                to the pressing health challenges of our time, thus bringing
                healing to the nations.
              </p>

              <div className="p-6 md:p-8 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-[0_4px_20px_rgba(26,77,109,0.08)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary transition-transform duration-300 scale-y-100 group-hover:scale-y-110 origin-top" />
                <Icon name="volunteer_activism" size={36} className="text-primary-container mb-4 opacity-80" />
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  We believe in a holistic approach to healing and well-being of
                  the mind, body, and spirit — rooted in biblical principles and
                  compassionate care.
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-6 relative h-full min-h-[400px] flex items-center justify-center">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(26,77,109,0.08)] bg-surface-container-low">
              <img
                src="/outreach/zumurucuare/705891641_122224595906056158_2670985528843388643_n.webp"
                alt="IKMA medical professionals"
                className="absolute inset-0 w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-multiply" />
            </div>

            <div className="absolute -top-10 -right-10 w-24 h-24 bg-surface-container-lowest rounded-full shadow-[0_4px_20px_rgba(26,77,109,0.08)] flex items-center justify-center animate-bounce">
              <Icon name="public" size={30} className="text-primary" />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Founder's Message */}
    <section className="py-12 md:py-section-padding">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(26,77,109,0.08)] border border-surface-variant overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-5/12 relative bg-surface-container-low overflow-hidden flex-shrink-0">
            <img
              src="/images/ap-boney-studio.webp"
              alt="Ap. John Magnus Boney"
              className="w-full h-full object-cover object-top min-h-[400px] md:min-h-full opacity-90 hover:opacity-100 transition-opacity duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-80 md:hidden" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-container-lowest hidden md:block w-32 right-0 ml-auto pointer-events-none" />
          </div>

          <div className="md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-surface-container-lowest">
            <div className="mb-8">
              <p className="font-label-bold text-label-bold text-primary tracking-wider uppercase mb-3 flex items-center gap-2">
                <Icon name="format_quote" size={20} />
                {t("IKMA Founder's Speech", "Discurso del fundador de IKMA")}
              </p>
                            <h2 className="font-headline-lg text-headline-md text-primary notranslate">
                Ap. John Magnus Boney
              </h2>
            </div>

            <div className="space-y-6 text-on-surface-variant">
              <p className="font-body-lg text-label-sm leading-relaxed">
                Today, our world faces a range of challenges—both physical and
                spiritual—that have persisted across generations, as well as new
                ones that continue to emerge. These include infectious diseases,
                war, famine, and the everyday struggles of life that impact
                human well-being.
              </p>
              <p className="font-body-md text-label-sm leading-relaxed">
                While the healthcare system exists to support and maintain
                health, it often presents additional difficulties. Many people
                encounter barriers such as the high cost of medication,
                complicated insurance systems, limited access to care in rural
                areas, and, at times, treatments that do not fully address the
                root cause of illness. Too often, the focus remains on managing
                symptoms rather than pursuing true healing by identifying and
                removing the underlying causes of disease—a task that is
                complex, but deeply necessary.
              </p>
              <p className="font-body-md text-label-sm leading-relaxed">
                As awareness of health grows, people are seeking answers and
                solutions now more than ever. Unfortunately, this has also led
                to the rise of false healers and misleading medical
                claims—offering empty promises that create dependency and
                disappointment rather than genuine freedom and restoration.
              </p>
              <p className="font-body-md text-label-sm leading-relaxed font-medium border-l-4 border-primary pl-4 py-1 bg-surface-container-low">
                We believe that humanity—and the nations of the world—are
                currently living below the full potential that God has given us.
                Our mission is to take part in rebuilding, restoring, and
                renewing the field of medicine so that it fulfills its true
                purpose: to preserve life and support the flourishing of all
                people. As it is written in Isaiah 61:4–7, we are called to
                rebuild what has been broken and restore what has been lost.
              </p>
              <p className="font-body-md text-label-sm leading-relaxed">
                We are part of a people who seek to restore humanity to its
                original design as created by Elohim. We believe in the
                strength that comes from unity, and in the truth that &ldquo;we
                can do all things through Christ who strengthens us&rdquo;
                (Philippians 4:13). Together, under God, we stand in faith and
                purpose, committed to bringing healing, restoration, and lasting
                transformation to the world.
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-surface-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-label-bold text-label-bold text-on-surface notranslate">
                  Ap. John Magnus Boney
                </p>
                <p className="font-label-sm text-label-sm text-outline mt-1">
                  May 22nd, 1947 &ndash; February 4th, 2023
                </p>
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-surface-container-low rounded-full">
                <span className="font-label-sm text-label-sm text-primary tracking-wide">
                  #TheMandateContinues
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Board of Directors */}
    <section className="py-12 md:py-section-padding bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="mb-12">
          <h2 className="font-headline-lg text-headline-lg text-primary">
            {t("Our Board of Directors", "Nuestro consejo / junta directiva")}
          </h2>
          <div className="h-1 w-16 bg-primary mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-gutter">
          {boardMembers.map((member, i) => (
            <div
              key={i}
              className="group bg-white border border-outline-variant/30 p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,54,82,0.08)] transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mb-6 ring-4 ring-surface-container-low bg-surface-container-low">
                {member.img ? (
                  <img
                    src={member.img}
                    alt={member.name.en}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="person" size={36} className="text-primary" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-headline-md text-headline-md text-primary">
                  {member.name[lang === "es" ? "es" : "en"]}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {member.role[lang === "es" ? "es" : "en"]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Main Partners */}
    <section className="relative overflow-hidden bg-surface-bright pb-12 md:pb-section-padding">
      <div className="relative w-full h-[500px] md:h-[600px] mb-[-120px]">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          <div className="relative overflow-hidden group">
            <img
              src="/images/ikma_vzla.webp"
              alt="IKMA Venezuela"
              className="w-full h-full object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-primary-container/20 mix-blend-multiply" />
          </div>
          <div className="relative overflow-hidden group hidden md:block">
            <img
              src="/images/about_img_1.webp"
              alt="Medical mission"
              className="w-full h-full object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-primary-container/20 mix-blend-multiply" />
          </div>
        </div>
        <div className="absolute inset-0 bg-[#003652]/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-gutter">
          <div className="max-w-container-max mx-auto">
            <span className="inline-block px-4 py-1.5 mb-6 bg-white/90 backdrop-blur-md rounded-full font-label-bold text-label-bold text-primary tracking-wider uppercase">
              {t("Global Network", "Red Global")}
            </span>
            <h1 className="font-headline-xl text-headline-xl text-white drop-shadow-lg mb-4">
              {t("Main partners", "Principales socios")}
            </h1>
            <p className="font-body-lg text-body-md text-white/90 max-w-2xl mx-auto drop-shadow-md">
              {t(
                "United by faith and clinical excellence, our global partners enable us to extend life-changing medical care to communities worldwide.",
                "Unidos por la fe y la excelencia clínica, nuestros socios globales nos permiten extender atención médica transformadora a comunidades en todo el mundo."
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Emmanuel Ministries International Church",
              url: "https://www.emmint.com/es/",
              leader: "Ap. David Clementson",
              location: "Florida, USA",
              flag: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLGCJtM9egKBrUlhG7UQILrea0c9HhRmFzRHnkj6CrcRHlnfax5m5ru3EiKXzqDooiuGyhOnvyhdyN-slsZDcgAYw4aYE0J_4mpFt13ohePPcSkPY5SIbwOIvFrnT494bV-i9DCG6hU3opgdhiNR6beImrXgxKD0QDq2IKerg7Dx9quxm8jSdkqK6YgbCZBqYVk3w1uEdMan13VO8CymwHK3BbbF2CY90wY-GzchyUkw0df6xJpp0",
              logo: "/EMMINT.png",
            },
            {
              name: { en: "Christian International Center", es: "Centro Cristiano Internacional" },
              namePlace: "Ciudad de las Águilas",
              url: "https://www.facebook.com/ciudaddelasaguilas",
              leader: "Ap. Carlos De León",
              location: "Coro, Venezuela",
              flag: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_Vf5aAdiGwilskObkxt3RjsSMSz4S9g8u4uM0_axlA5VWxx0527sz-Lk1Gwoi1aMbqDuTb6tXrJdrG3OymBwm1pk8wQneXzQXZRgL3J1tAMRZLOUwraWNs0J6bwaCZfkJ0C8mh_f69zgIGkiNlqG4pYEiSlPPXw-qDSO0iZ4FTbz4lEnBuzGJr68Z9I5vjauOjBpXQ88bgziMUs1LzCr1NyKXL8YKObBDM6aBmOhCPpb6N_hu_Us",
              logo: "/CDA.png",
            },
            {
              name: "Bethlehem Kingdom Center",
              url: "https://kcbkc.org/",
              leader: "AP. Raymond Mabion",
              location: "Kansas City, Kansas USA",
              flag: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLGCJtM9egKBrUlhG7UQILrea0c9HhRmFzRHnkj6CrcRHlnfax5m5ru3EiKXzqDooiuGyhOnvyhdyN-slsZDcgAYw4aYE0J_4mpFt13ohePPcSkPY5SIbwOIvFrnT494bV-i9DCG6hU3opgdhiNR6beImrXgxKD0QDq2IKerg7Dx9quxm8jSdkqK6YgbCZBqYVk3w1uEdMan13VO8CymwHK3BbbF2CY90wY-GzchyUkw0df6xJpp0",
              logo: "/BELEN.png",
            },
          ].map((partner, i) => {
            const Card = partner.url ? "a" : "div"
            return (
            <Card
              key={i}
              href={partner.url || undefined}
              target={partner.url ? "_blank" : undefined}
              rel={partner.url ? "noopener noreferrer" : undefined}
              className={`bg-white border border-surface-container p-8 h-full rounded-lg flex flex-col ${partner.url ? "group hover:shadow-md transition-shadow" : ""}`}
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                  <img
                    src={partner.flag}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="w-[5.25rem] h-[5.25rem] bg-white rounded-full flex items-center justify-center shrink-0 p-2">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              <h3 className="font-headline-md text-body-lg text-primary mb-4">
                {typeof partner.name === "object" ? (
                  <>{t(partner.name.en, partner.name.es)} "{partner.namePlace}"</>
                ) : (
                  <span className="notranslate">{partner.name}</span>
                )}
              </h3>
              <div className="mt-auto pt-6 border-t border-surface-container-low">
                <div className="flex items-start gap-3 mb-3">
                  <Icon name="person" size={18} className="text-on-surface-variant mt-0.5" />
                  <p className="font-headline-lg text-body-md text-on-surface notranslate">
                    {partner.leader}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="location_on" size={18} className="text-on-surface-variant mt-0.5" />
                  <p className="font-label-bold text-label-bold text-on-surface-variant">
                    {partner.location}
                  </p>
                </div>
              </div>
            </Card>
            )})}
        </div>

        {/* Callout Banner */}
        <div className="mt-16 md:mt-24 p-8 md:p-12 bg-primary text-white rounded-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 100 100">
              <circle cx="100" cy="0" r="80" />
              <circle cx="100" cy="0" r="100" />
            </svg>
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-headline-lg text-headline-lg mb-4">
                {lang === "es" ? (
                  <>Integridad Clínica. <br />Compasión Basada en la Fe.</>
                ) : (
                  <>Clinical Integrity. <br />Faith-Driven Compassion.</>
                )}
              </h2>
              <p className="font-body-md text-body-md text-white/80 max-w-lg">
                {t(
                  "Our partnership model is built on clinical excellence and shared spiritual values. We collaborate with leaders globally to integrate professional medical standards into community outreach initiatives.",
                  "Nuestro modelo de asociación se basa en la excelencia clínica y valores espirituales compartidos. Colaboramos con líderes globales para integrar estándares médicos profesionales en iniciativas de alcance comunitario."
                )}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 lg:justify-end">
              <Link
                href="/registro"
                className="bg-white text-primary font-label-bold text-label-bold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {t("Become a member", "Hazte miembro")}
                <Icon name="arrow_forward" />
              </Link>
              <button className="border border-white/40 text-white font-label-bold text-label-bold px-8 py-4 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                {t("Support our mission", "Apoya nuestra misión")}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {lang === "es" ? (
          <div className="mt-12 grid grid-cols-1 gap-8">
            {[
              { number: "2500+", label: "Personas Impactadas" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-headline-lg text-headline-lg text-primary">{stat.number}</p>
                <p className="font-label-bold text-label-bold text-on-surface-variant uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 flex justify-center">
            {[
              { number: "12k+", label: "Impacted Lives" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-headline-lg text-headline-lg text-primary">{stat.number}</p>
                <p className="font-label-bold text-label-bold text-on-surface-variant uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
    </>
  )
}
