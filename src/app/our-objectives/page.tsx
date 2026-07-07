import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Objectives - IKMA",
  description:
    "Learn about the key objectives and goals of the International Kingdom Medical Association.",
}

export default function OurObjectivesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://lh3.googleusercontent.com/aida/AP1WRLu9VUuBStf4Y9uxb4jRJhJHglHiAf9PiLPQckstSomcKv1Hwdxb_T0fHgKjs1ATjlvNjKb8nrc54o9u793wLP_capo-iZ_Dk9l8gwTeO7KM4sw66VK2pfdJ-QG-T6P8-PAFMr17iCLnZEsO0NplJsQvJ5KXzp29J1pXUcFtjAxda3bPM-FLRzMrhUMlbuYKcu01iwQ1HWU0i-op3AW6kUlg0EsgIpi6yUDq3FGO2BkOO6OjCi2HphbEUA"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-background" />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-left">
          <div className="mb-8 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 text-primary font-label-bold text-label-sm uppercase tracking-widest rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Our objectives: (Reviewed June 8th, 2026) NEED REVIEW
          </div>
          <h1 className="font-headline-xl text-headline-xl text-surface max-w-4xl mb-8 leading-tight">
            Our Strategic Objectives
          </h1>
          <p className="font-body-lg text-body-lg text-surface max-w-2xl leading-relaxed">
            Guided by faith and clinical excellence, we are committed to transforming healthcare across nations through equity, empowerment, and Kingdom solutions.
          </p>
          <div className="mt-12 flex flex-wrap gap-6">
            <a
              href="/our-purpose"
              className="bg-primary text-on-primary font-label-bold text-label-bold px-8 py-4 rounded-lg hover:bg-primary-container transition-all shadow-xl shadow-primary/20"
            >
              Explore Our Vision
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-primary font-bold py-4 hover:gap-4 transition-all"
            >
              <span className="material-symbols-outlined">play_circle</span>
              Watch Our Story
            </a>
          </div>
        </div>
      </section>

      {/* Pillar One */}
      <section className="py-section-padding bg-white" id="pillar-one">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-primary font-bold tracking-[0.2em] font-label-bold text-label-sm block mb-6 uppercase border-l-4 border-primary pl-4">
                PILLAR ONE
              </p>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-10">
                Promote health equity for all
              </h2>
              <ul className="space-y-8">
                {[
                  "Promote access to care for safe, effective, affordable, and quality health services, regardless of socioeconomic status",
                  "Empower communities by fostering practices that maintain mental, physical, and spiritual health in alignment with biblical principles.",
                  "Foster cooperations through regional, national and international partnership.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-6 items-start group">
                    <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      {i + 1}
                    </span>
                    <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute -inset-6 bg-primary-fixed/20 -z-10 rounded-2xl group-hover:bg-primary-fixed/30 transition-all" />
              <img
                src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800"
                alt="Healthcare professionals meeting"
                className="w-full aspect-[4/3] object-cover rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute -bottom-8 -left-8 bg-white p-6 shadow-xl rounded-lg hidden md:block border border-outline-variant/30">
                <p className="font-headline-lg text-headline-lg text-primary leading-none">150+</p>
                <p className="font-label-bold text-label-bold text-on-surface-variant mt-2">Active Partnerships</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Divider */}
      <section className="relative py-32 flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://lh3.googleusercontent.com/aida/AP1WRLvVNZYFIT4XXfVeoMcbySrAxvfuapp5WCZpGJJePLHwU17kBPVM9FzzbMiV_0niwI-tOsf2uQlWeXJZIJMe1Q-9DwLztpZZcWjo5nbOks7HknDSqN3Rrj3pZPUfdijrV9OMwJg45QXrHC8nVBGNPJseftwaXH6rznos5QWj7UggtMNMe1j711UCx5BQPdOpnjCoTGN-VJdqTJSVC-1pZxJ1t-XBRD7lFiNcoYGvMAdyI8HHvYP-xdEEjA"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-4xl mx-auto">
            <span className="material-symbols-outlined text-white/40 text-7xl mb-8">format_quote</span>
            <blockquote className="text-white font-headline-lg text-headline-lg md:text-4xl italic leading-tight">
              &ldquo;Transforming the world through clinical excellence and the spirit of service.&rdquo;
            </blockquote>
            <div className="mt-8 h-1 w-24 bg-white/30 mx-auto rounded-full" />
          </div>
        </div>
      </section>

      {/* Pillar Two */}
      <section className="py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative group order-1">
              <div className="absolute -inset-6 bg-secondary-fixed/20 -z-10 rounded-2xl group-hover:bg-secondary-fixed/30 transition-all" />
              <img
                src="https://lh3.googleusercontent.com/aida/AP1WRLtXbfyDCku2NEr1dW6ZjWhAoS1LQegWoo_Jvw4zNzRj5lpnJLLk3hhbM4qIC6sk2q-EYHOXu1zpRfM1fviw8YwDpLee0JsfFLUWyGDQlLCl55KYNRUseQ8_fpJaX0vFQXdDbfzQHpp-a-IMz7oei_cHG-RKr-IlKcwbP6gSrrY_PJPriaxYsZzSVbsZ0x01e2BOzJUIx7p_ndiTxvi0NVVIAukqg_PT5gxvpKTG9x4QZc5nxjRp7Gkp"
                alt="Medical students studying"
                className="w-full aspect-[4/3] object-cover rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
            <div className="order-2">
              <p className="text-primary font-bold tracking-[0.2em] font-label-bold text-label-sm block mb-6 uppercase border-l-4 border-primary pl-4">
                PILLAR TWO
              </p>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-10">
                Equipping health warriors for transformative impact
              </h2>
              <ul className="space-y-8">
                {[
                  "Establish an academy to train health professionals and students in both biblical and secular medicine topics, bridging the gap between faith and practice.",
                  "Shaping a generation of health warriors in their training process, preparing them for holistic health ministry",
                  "Establish support system for low-income undergraduate and graduate students, providing grant and scholarship and nurturing environment for their academical success and spiritual growth.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-6 items-start group">
                    <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      {i + 4}
                    </span>
                    <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar Three */}
      <section className="py-section-padding bg-surface-container-low border-y border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <p className="text-primary font-bold tracking-[0.2em] font-label-bold text-label-sm block mb-6 uppercase">
              PILLAR THREE
            </p>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-6">
              Bringing Kingdom solutions to the Nations
            </h2>
            <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              "Build specialized outpatient clinics staffed by kingdom-minded healthcare professionals, offering high quality solutions to diverse health issues with compassion and spiritual insight.",
              "Conducts medical campaign by combining essential outreach and evangelism, demonstrating God's love through action.",
              "Organize and empower regional committees in partner countries",
              "Impact men and women in the health field to be transformed. Thus, establishing the government of the Kingdom of God in the hospitals of the nations.",
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-10 border border-outline-variant hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 rounded-lg relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full transition-all group-hover:w-full group-hover:h-full group-hover:rounded-none" />
                <p className="text-4xl font-black text-primary/10 block mb-6 relative">
                  {String(i + 7).padStart(2, "0")}
                </p>
                <p className="font-body-md text-body-md text-on-surface relative leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl overflow-hidden h-[500px] shadow-2xl relative">
            <img
              src="https://lh3.googleusercontent.com/aida/AP1WRLu2xhbwVPaLCzI9OtH2VvW_4KPGhKbxI5I-bzVAwZPUj8AWWrVt7fsbJOYRz-3FAKJnm3hkgv11uKLJZ5jSsn7Gn0-Vp5BaUaNd3_SI5jm7fWsdqpDuh1JPvbmF2yuNRZ45mm0JmjTFI6n1gdBBwU5xQlShdSfoIjcryEkh5rVW9VkPjwpqi5-3Flnfw5fsY7bThJ6aci4NQikFp4_pL6wCEszWy4evKfQ1mAUkpMiIi0QsFHEdzy0a"
              alt="Medical mission outreach"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 translate-x-1/3 translate-y-1/3 rounded-full" />
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center relative z-10">
          <h2 className="font-headline-lg text-headline-lg md:text-5xl mb-10 leading-tight">
            Be part of the global transformation
          </h2>
          <p className="font-body-lg text-body-lg text-white/80 max-w-2xl mx-auto mb-12">
            Your support enables us to provide life-changing healthcare and spiritual ministry to those in greatest need.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-white text-primary font-label-bold text-label-bold px-8 py-4 rounded-lg shadow-xl hover:bg-primary-fixed transition-all duration-300 cursor-pointer">
              Support Our Mission
            </button>
            <button className="border-2 border-white/40 text-white font-label-bold text-label-bold px-8 py-4 rounded-lg hover:bg-white hover:text-primary transition-all duration-300 cursor-pointer">
              Read Our Story
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
