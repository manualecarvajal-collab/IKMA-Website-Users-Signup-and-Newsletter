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
               International Kingdom Medical Association, IKMA, is a company of Kingdom minded
              apostolic health professionals, who are deeply committed to integrating God´s
              Kingdom pattern in our medical practice, seeking to bring God´s ordained solutions
              to the pressing health challenges of our time, thus bring healing to the nations.</p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-[0_20px_40px_0_rgba(7,68,105,0.08)]">
            <img
              src="/images/about_img_1.jpg"
              alt="Medical professionals working together"
              loading="lazy"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Mensaje del Fundador - Founder's Message */}
      <section className="py-12 md:py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200/60 flex flex-col md:flex-row">
            <div className="md:w-[38%] relative min-h-[400px] bg-primary overflow-hidden">
              <img
                src="/images/ap-boney-studio.jpg"
                alt="Ap. John Magnus Boney"
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>
            <div className="md:w-[62%] p-8 md:p-12 flex flex-col relative">
              <div className="text-primary mb-6">
                <span className="material-symbols-outlined text-5xl font-bold">format_quote</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary font-bold mb-4">
                A word from our founder: Ap. John Magnus Boney
              </h2>
              <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed space-y-4">
                <p>
                  As it is, the world faces physical and nonphysical challenges that are old and new. For example,
                  infectious disease pandemics, war, famine, life challenges, etc. The current healthcare system which
                  is supposed to help people maintain their health adds more problems such as insurance, high cost of
                  medication, unavailability of health assistance or medication in rural places, and somewhat ineffective
                  treatments. Additionally, the health care system currently emphasizes treating symptoms rather than
                  curing and eliminating diseases and health problems, as this proven to be challenging.
                </p>
                <p>
                  People are more concerned about their health now than ever before and search for a cure to ailments
                  they may have, causing the rise of companies of false healers in medicine, which have created false
                  solutions and false hope that has brought about a state of more captivity than freedom.
                </p>
                <p>
                  Mankind and the nations are operating below our God-given potential. Our mission/purpose is to
                  rebuild, restore, and renew the medical field to its role of preserving and supporting the
                  flourishing of mankind.
                </p>
              </div>
              <div className="mt-8">
                <p className="font-headline-md text-headline-md text-primary font-extrabold">Isaiah 61:4-7</p>
                <p className="text-secondary text-xs font-semibold tracking-widest uppercase mt-1">
                  APOSTLE JOHN BONEY - 2021
                </p>
              </div>
              <div className="text-primary mt-auto self-end opacity-20">
                <span className="material-symbols-outlined text-6xl font-bold rotate-180">format_quote</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-12 md:py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-label-bold uppercase tracking-wider mb-4">
              Our Foundation
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Our Purpose, Mission and Values
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
              IKMA is a body <span className="font-semibold text-primary">called, chosen, and ordained</span> by{" "}
              <span className="font-bold text-primary">Elohim</span>, driven to serve with a{" "}
              <span className="italic font-medium">Spirit of excellence</span>. We are motivated by the belief
              that medical care is a sacred duty to restore both physical health and spiritual well-being.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mb-12 md:mb-16">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
              <div>
                <p className="font-label-bold text-primary uppercase tracking-widest">Local Reach</p>
                <p className="font-body-md text-on-surface-variant">Community-based clinical care</p>
              </div>
            </div>
            <div className="w-px h-12 bg-outline hidden md:block"></div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">public</span>
              <div>
                <p className="font-label-bold text-primary uppercase tracking-widest">International Scope</p>
                <p className="font-body-md text-on-surface-variant">Global health partnerships &amp; aid</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "healing", title: "Treating Illnesses", desc: "Providing comprehensive care through a holistic approach that addresses physical healing and spiritual restoration." },
              { icon: "school", title: "Medical Education", desc: "Training and empowering the next generation of healthcare professionals with faith-centered academic excellence." },
              { icon: "diversity_3", title: "Serving Underserved", desc: "Bringing specialized medical attention and essential resources to marginalized and neglected communities." },
              { icon: "local_hospital", title: "Outpatient Clinics", desc: "Establishing state-of-the-art clinical facilities globally to offer consistent, high-quality medical sanctuaries." },
              { icon: "policy", title: "Global/Public Health", desc: "Advocating for ethical health policies and structural improvements that honor human dignity on a worldwide scale." },
              { icon: "volunteer_activism", title: "Humanitarian Aid", desc: "Collaborating with international partners to provide swift, effective response to global health crises." },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-xl border border-surface-variant hover:border-primary/20 hover:shadow-[0_4px_24px_rgba(7,68,105,0.06)] transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center mb-6 text-primary">
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-3">
                  {item.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
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
                role: "CEO-/ manager",
                org: "IKMA",
                image: "/images/Boneza.png",
              },
              {
                name: "Marlene Boney",
                role: "Treasurer",
                org: "IKMA",
                image: "/images/marlene.png",
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
                    loading="lazy"
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

    </>
  );
}
