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

      {/* Emmanuel Ministries International */}
      <section className="py-12 md:py-section-padding bg-surface-container-low">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
          <div className="rounded-xl overflow-hidden shadow-[0_20px_40px_0_rgba(7,68,105,0.08)] flex flex-col">
            <img
              src="/images/logo-theme.png"
              alt="Emmanuel Ministries International logo"
              className="w-full h-auto object-contain"
            />
            <img
              src="/images/about_img_3.jpg"
              alt=""
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-primary">
              Emmanuel Ministries International
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              We are a spiritual family in the Kingdom of God that is rising up
              under the apostolic fatherhood of Apostle John Boney. There is a
              growing company of mature leaders around the world who are part of
              this ministry and who recognize Apostle Boney as their father in
              the Lord.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              We are not primarily an organization, and we have no desire to
              cultivate relationships that are primarily organizational, though
              we believe there must be a structure to facilitate the fulfillment
              of the things the Lord has given us to do. We are not primarily
              interested in people joining our organization for the benefits we
              might have for them and their goals. We are first and foremost a
              family—but a growing family.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Emmanuel Ministries International has established many churches
              that are operating for the glory of God in the United States,
              Canada, Australia, the West Indies, Latin America, and Africa.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              The Lord has called this ministry to PROCLAIM THE GOSPEL OF THE
              KINGDOM to the WORLD. Ours is, therefore, a global vision.
              Although there are still many other ministries operating in other
              parts of the world.
            </p>
          </div>
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

      {/* Ciudad de las Águilas International Christian Center */}
      <section className="w-full">
        <div className="relative h-[60vh] w-full overflow-hidden">
          <div
            className="absolute inset-0 bg-fixed bg-center bg-cover bg-no-repeat"
            style={{
              backgroundImage: "url('/images/ikma_vzla.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24 text-center -mt-24 relative z-10 bg-surface rounded-t-3xl shadow-xl">
          <img
            src="/images/Logo_CDA.jpg"
            alt="Ciudad de las Águilas logo"
            className="w-32 h-32 rounded-full object-cover border-4 border-surface shadow-md mx-auto -mt-20 mb-8"
          />
          <h2 className="font-headline-lg text-headline-lg text-primary mb-2">
            Ciudad de las Águilas
          </h2>
          <h3 className="font-headline-md text-headline-md text-on-surface-variant mb-6">
            International Christian Center
          </h3>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-8 max-w-3xl mx-auto">
            We are a large family of men and women who, by living out biblical
            principles, effectively preach the good news of the Gospel of the
            Kingdom and successfully and magnificently demonstrate, in our daily
            lives, the excellence of Jesus Christ as Lord and Savior of our
            lives, positively impacting our community, our city, and the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="/contacto"
              className="px-8 py-3 bg-primary text-on-primary rounded-full font-semibold hover:brightness-110 transition shadow-lg"
            >
              Conoce más
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
