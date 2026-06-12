import type { Metadata } from "next";
import StatsSection from "@/components/StatsSection";

export const metadata: Metadata = {
  title: "About Us - IKMA",
  description:
    "Healing Through Faith & Excellence. Learn about the International Kingdom Medical Association's mission, core values, and leadership.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-12 md:py-section-padding bg-surface-container-low">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
          <div className="space-y-6">
            <span className="font-label-bold text-label-bold text-tertiary uppercase tracking-widest">
              Our Foundation
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary">
              Who Are We?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              We believe we are a group of medically trained individuals who
              have been chosen, ordained, anointed, and called to our mission by
              Elohim, God, who knew us and predestined us before the foundation
              of the world, making us part of the generation He is raising up to
              fulfill His purposes on Earth. We have God’s grace and ability to
              bring breakthrough solutions to the problems facing our local and
              global society. The spirit of excellence and scientific creativity
              has been placed within us, just as it was in the days of Daniel
              and his friends.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-[0_20px_40px_0_rgba(7,68,105,0.08)]">
            <img
              src="/images/about_img_1.jpg"
              alt="Medical professionals working together"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-12 md:py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Our Core Values
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              The pillars that guide our medical funding program and daily
              operations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {[
              {
                icon: "groups",
                title: "Mission",
                desc: "We are healthcare professionals operating in the full favor of God and guided by His Spirit to collaborate in the application of academic and technological knowledge to bring solutions to the physical, spiritual, and emotional challenges that our society and communities face.",
              },
              {
                icon: "visibility",
                title: "Vision",
                desc: "We are part of the company of the Son of Man who has come to restore humanity to its original design by our Creator Elohim. His original plan for creation at every level—and the result—will be the full potential of every human, every nation, and all of creation being unlocked to fulfill God's purposes.",
              },
              {
                icon: "volunteer_activism",
                title: "Faith-Driven Mission",
                desc: "Our actions are rooted in Christian stewardship, managing resources wisely to maximize our impact on healing.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest p-8 rounded-xl border border-surface-variant hover:shadow-[0_20px_40px_0_rgba(7,68,105,0.06)] transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center mb-6 text-primary">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-background mb-3">
                  {item.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <StatsSection />
        </div>
      </section>

      {/* Board of Directors */}
      <section className="py-12 md:py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Board of directors
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-items-center">
            {[
              {
                name: "Apostle David Clemetson",
                role: "CEO",
                org: "IKMA",
                image: "/images/Clemetson.png",
              },
              {
                name: "Apostle Raymond Mabion",
                role: "International Director",
                org: "IKMA",
                image: "/images/Mabion.png",
              },
              {
                name: "Apostle Carlos De León",
                role: "Latinamerica Director",
                org: "IKMA",
                image: "/images/De León.png",
              },
              {
                name: "Apostle Francisco Hernández",
                role: "Medical Director",
                org: "IKMA",
                image: "/images/Hernández.png",
              },
              {
                name: "Gratia Boneza",
                role: "Treasurer",
                org: "IKMA",
                image: "/images/Boneza.png",
              },
            ].map((member, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant text-center w-full max-w-xs hover:shadow-[0_20px_40px_0_rgba(7,68,105,0.06)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center gap-4"
              >
                <div className="w-[150px] h-[150px] rounded-full overflow-hidden bg-surface-variant shrink-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary min-h-[3.5rem]">
                  {member.name}
                </h3>
                <p className="font-label-bold text-label-bold text-secondary italic min-h-[2.5rem]">
                  {member.role}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider">
                  {member.org}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apostle John Boney Quote */}
      <section className="py-12 md:py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="relative w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200/60 flex flex-col md:flex-row transition-all select-none min-h-[460px]">
            {/* Left photo */}
            <div className="relative w-full md:w-[38%] min-h-[340px] md:min-h-full bg-gradient-to-tr from-slate-900 to-slate-800 overflow-hidden">
              <img
                src="/images/Ap Bonny 1.png"
                alt="Apostle John Boney"
                className="absolute inset-0 w-full h-full object-cover object-top grayscale contrast-[1.12] brightness-[0.98]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden"></div>
            </div>

            {/* Right content */}
            <div className="relative w-full md:w-[62%] flex flex-col justify-between p-8 sm:p-12 md:p-14 z-10 bg-white">
              {/* Wave background */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_100%,#f0f7ff_0%,#ffffff_80%)]"></div>
                <svg className="absolute bottom-0 right-0 w-full h-full opacity-40" viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M150 500 C 300 320, 450 480, 700 350 L 700 500 Z" fill="url(#wave-gradient-1)" opacity="0.3" />
                  <path d="M50 500 C 250 350, 400 450, 650 380 L 650 500 Z" fill="url(#wave-gradient-2)" opacity="0.4" />
                  <defs>
                    <linearGradient id="wave-gradient-1" x1="400" y1="500" x2="600" y2="350" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#bfe3fc" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="wave-gradient-2" x1="300" y1="500" x2="600" y2="380" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#99d1fc" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Opening quote */}
              <div className="relative w-full flex items-start justify-start z-10 -mt-2">
                <div className="text-[#0d77e2] w-16 h-16 sm:w-20 sm:h-20">
                  <svg className="w-full h-full" viewBox="0 0 120 120" fill="currentColor">
                    <path d="M15,70 C15,35 45,30 45,30 L45,48 C35,48 33,52 33,65 L48,65 L48,95 L15,95 Z M62,70 C62,35 92,30 92,30 L92,48 C82,48 80,52 80,65 L95,65 L95,95 L62,95 Z" />
                  </svg>
                </div>
              </div>

              {/* Central text */}
              <div className="relative w-full flex flex-col items-center md:items-start text-center md:text-left z-10 my-4 px-2 sm:px-4">
                <blockquote className="font-serif text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] leading-[1.7] text-[#0a1945]/95 font-semibold tracking-normal max-w-[520px]">
                  We will conquer the mountain of medicine in many nations of the earth. I believe that God will bring many people from a whole new generation of doctors, nurses and health personnel and we will bring a change to the world of medicine, we will bring it under the dominion of the Lord
                </blockquote>
                <h2 className="font-display text-[36px] sm:text-[44px] md:text-[48px] lg:text-[52px] font-extrabold text-[#0a1945] mt-5 md:mt-6 tracking-normal">
                  Jesus Christ
                </h2>
                <div className="font-sans text-[9px] sm:text-[10px] tracking-[0.2em] font-extrabold text-[#0d77e2]/90 uppercase mt-2">
                  APOSTLE JOHN BONEY - 2021
                </div>
              </div>

              {/* Closing quote */}
              <div className="relative w-full flex items-end justify-end z-10 -mb-2">
                <div className="text-[#0d77e2] w-16 h-16 sm:w-20 sm:h-20">
                  <svg className="w-full h-full transform rotate-180" viewBox="0 0 120 120" fill="currentColor">
                    <path d="M15,70 C15,35 45,30 45,30 L45,48 C35,48 33,52 33,65 L48,65 L48,95 L15,95 Z M62,70 C62,35 92,30 92,30 L92,48 C82,48 80,52 80,65 L95,65 L95,95 L62,95 Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
