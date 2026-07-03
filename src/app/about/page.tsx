import type { Metadata } from "next";

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
              About Us
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary">
              Who Are We?
            </h2>
            <p className="font-body-lg text-body-md text-on-surface-variant leading-relaxed">
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
              <h2 className="font-headline-md text-body-lg text-primary font-bold mb-4">
                A word from our founder
              </h2>
              <h2 className="font-headline-lg text-headline-md text-primary font-bold mb-4">
                Ap. John Magnus Boney
              </h2>

              <div className="font-body-md text-label-sm text-on-surface-variant leading-relaxed space-y-4">
                <p>
                  As it is, the world faces physical and nonphysical challenges that are old and new. For example,
                  infectious disease pandemics, war, famine, life challenges, etc. The current healthcare system which
                  is supposed to help people maintain their health adds more problems such as insurance, high cost of
                  medication, unavailability of health assistance or medication in rural places, and somewhat ineffective
                  treatments. Additionally, the health care system currently emphasizes treating symptoms rather than
                  curing and eliminating diseases and health problems, as this proven to be challenging.
                </p>
                <p>
                  While the healthcare system exists to support and maintain health, it often presents additional difficulties.
                  Many people encounter barriers such as the high cost of medication, complicated insurance systems, limited
                  access to care in rural areas, and, at times, treatments that do not fully address the root cause of illness.
                  Too often, the focus remains on managing symptoms rather than pursuing true healing by identifying and removing
                  the underlying causes of disease—a task that is complex, but deeply necessary.                </p>
                <p>
                  As awareness of health grows, people are seeking answers and solutions now more than ever. Unfortunately,
                  this has also led to the rise of false healers and misleading medical claims—offering empty promises that
                  create dependency and disappointment rather than genuine freedom and restoration.                
                </p>
                <p>
                  We believe that humanity—and the nations of the world—are currently living below the full potential that
                  God has given us. Our mission is to take part in rebuilding, restoring, and renewing the field of medicine
                  so that it fulfills its true purpose: to preserve life and support the flourishing of all people. As it
                  is written in Isaiah 61:4–7, we are called to rebuild what has been broken and restore what has been lost.               
                </p>
                <p>
                  We are part of a people who seek to restore humanity to its original design as created by Elohim. We believe
                  in the strength that comes from unity, and in the truth that “we can do all things through Christ who strengthens us”
                  (Philippians 4:13). Together, under God, we stand in faith and purpose, committed to bringing healing, restoration,
                  and lasting transformation to the world.               
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
              About Us
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Our Purpose, Mission and Values
            </h2>
            <p className="font-body-lg text-body-md text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden">
          {[
            { title: "Clinical Care and Community Partnership", desc: "Our approach focuses on delivering comprehensive care that respects both the physical and spiritual dimensions of health, while collaborating with multidisciplinary medical professionals to ensure well-rounded treatment approaches.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmTlz0aQuwZxbxAj0OYT7jVKehBjjIS3ESqC6som39pnjxciO2Ko5EB6AfBNvaWsqv5VfXjsKYmyqpFNgHllO00fnRHncy0JKbdi955dyeepPBvZjHFetYoq_s89eMcYCEIjTdJg-KKljqpO3Zpuu8N6uP8Xyw01Q9CbgLZhfyNdkjQRE-IdTp7NfeNt2-iVyP1Q4GZVm-BPMCLpDvH88xofsUmiETBhJCPmx0cHF2GDWoRJlWxg4" },
            { title: "Education and Empowerment", desc: "We are dedicated to providing accessible, evidence-based medical education for healthcare professionals and the broader community, tailoring educational initiatives to address specific knowledge gaps and practical needs.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6Em1zx6U9hcpsJK8-LwL_WgnUuzgk0-nao0K4ECmoNsx_4PpPErwlTpVrQxny-2cWtbjjBc7GeobEKD0lVxRT8lvBqDMS2H15sBNddAsfdrtgHS2RKnNOIfIIIREifaOe0mBjmgjlxqHloLkApEUH8npXhRjtlrfd77xW-hy51szAt_mK0pcrZlvFGf08d5-rSCTbyUTCzDO9RgPnQEovGsowc7FQ37dOIZhZT12kQmndozYzGcY" },
            { title: "Public and Global Health Engagement", desc: "We are committed to contributing to public and global health efforts aimed at improving overall population health, while engaging in policy awareness and advocacy to support effective and equitable healthcare systems.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBa61HtNDD4hgNVy8nAgt9jT7V_lZE8v15x1ImN2OpYGO0fsPBOO-i7UeLoBylYyuzb59BRHK-Uh2Z-l5G1HPOrqUrq3eg675uHSqx_x5i3FedvOKXktBMbX5EkbIvEpYAShPa0Kd704wTtK-nj6fS6Hw4o1Ct_NyXsr1VMPHkl7mmnU3PH7jogvTWKx1aqwTK-xKCeZRFQF7uGaeR6QHQ7cLT7Qe-c7ax-HhNdS_nc9cgHuHPYVkc" },
            { title: "Research and Scientific Advancement", desc: "We focus on exploring and evaluating new treatment approaches through structured research, supporting laboratory and diagnostic advancements through technical investigation.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1f-DDOyYoW__40f8SsoCEKqr0vp55gThxry4zPJD-1pBHcdoBSObJkLreGwZ-NgH01OA0SBmU4tZjUjmvqZrEjWKRqXeQY3Ol6Tf7tzcPCFEADPoNIz3fJ4OZXrg5t4WDq6fZ0vrDGTd3H5MMR-4wbZIimwZ9capCLYczG-v_JAD8Nz9wjS2bx4ykT3rw_jBobVRr2E-WoWFRuFP22TfGCj6Fpq_iLFfydl0RSDid6bdAg5_R79A" },
          ].map((item, i) => (
            <div
              key={i}
              className="relative group h-[320px] md:h-[450px] overflow-hidden cursor-default"
            >
              <img
                src={item.img}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-90 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col">
                <div className="transition-all duration-500 group-hover:-translate-y-4 mt-auto w-full">
                  <h3 className="font-headline-md text-headline-md text-white mb-3 drop-shadow-md">
                    {item.title}
                  </h3>
                  <div className="max-h-0 group-hover:max-h-40 opacity-0 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                    <p className="font-body-md text-white/90 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
                image: "/images/Mabion.png",
              }, 
              {
                name: "Apostle Carlos De León",
                role: "Latinamerica Director",
                image: "/images/De León.png",
              },
              {
                name: "Apostle Francisco Hernández",
                role: "Medical Director",
                image: "/images/Hernández.png",
              },
              {
                name: "Gratia Boneza",
                role: "CEO-/ manager",
                image: "/images/Boneza.png",
              },
              {
                name: "Marlene Boney",
                role: "Treasurer",
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

              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
