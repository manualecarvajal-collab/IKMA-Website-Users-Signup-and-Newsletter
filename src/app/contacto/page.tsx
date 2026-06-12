import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - IKMA",
  description:
    "Get in touch with the International Kingdom Medical Association. Send us a message, find our contact information, or submit a prayer request.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-container-low py-12 md:py-section-padding">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h1 className="font-headline-xl text-headline-xl text-primary mb-6">
            Get in Touch
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Whether you have questions about our medical funding, want to join
            our network of doctors, or simply need someone to pray with, we are
            here for you. Reach out to us today.
          </p>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-12 md:py-section-padding">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Form */}
            <div className="lg:col-span-8 bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)]">
              <h2 className="font-headline-md text-headline-md text-primary mb-8">
                Send a Message
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block font-label-bold text-label-bold text-on-surface mb-2"
                      htmlFor="first-name"
                    >
                      First Name
                    </label>
                    <input
                      className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                      id="first-name"
                      placeholder="Jane"
                      type="text"
                    />
                  </div>
                  <div>
                    <label
                      className="block font-label-bold text-label-bold text-on-surface mb-2"
                      htmlFor="last-name"
                    >
                      Last Name
                    </label>
                    <input
                      className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                      id="last-name"
                      placeholder="Doe"
                      type="text"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block font-label-bold text-label-bold text-on-surface mb-2"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                    id="email"
                    placeholder="jane@example.com"
                    type="email"
                  />
                </div>
                <div>
                  <label
                    className="block font-label-bold text-label-bold text-on-surface mb-2"
                    htmlFor="inquiry-type"
                  >
                    Type of Inquiry
                  </label>
                  <select
                    className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                    id="inquiry-type"
                  >
                    <option>General Question</option>
                    <option>Medical Funding</option>
                    <option>Doctor Network</option>
                    <option>Prayer Request</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block font-label-bold text-label-bold text-on-surface mb-2"
                    htmlFor="message"
                  >
                    Your Message
                  </label>
                  <textarea
                    className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                    id="message"
                    placeholder="How can we assist you today?"
                    rows={5}
                  />
                </div>
                <button
                  className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-4 rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center gap-2 cursor-pointer"
                  type="submit"
                >
                  <span>Send Message</span>
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </div>
            {/* Contact Info */}
            <div className="lg:col-span-4 flex flex-col gap-gutter">
              <div className="bg-surface-container rounded-xl p-8 flex-grow">
                <h3 className="font-headline-md text-headline-md text-primary mb-6">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      icon: "location_on",
                      title: "Our Headquarters",
                      detail: [
                        "1391 NW St. Lucie West Blvd.",
                        "#122 Port St. Lucie,",
                        "Florida. 34986",
                      ],
                    },
                    {
                      icon: "call",
                      title: "Phone",
                      detail: ["+ 1 (772) 252 0235", "Mon-Fri, 9am - 5pm EST"],
                    },
                    {
                      icon: "mail",
                      title: "Email",
                      detail: ["ikmedicalassociation@gmail.com "],
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="bg-primary-container/10 p-3 rounded-full text-primary">
                        <span className="material-symbols-outlined">
                          {item.icon}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-label-bold text-label-bold text-on-surface mb-1">
                          {item.title}
                        </h4>
                        {item.detail.map((line, j) => (
                          <p
                            key={j}
                            className="font-body-sm text-body-sm text-on-surface-variant"
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl overflow-hidden h-64 bg-surface-container-low relative">
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-on-surface-variant">
                  <span>Map placeholder</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prayer Banner */}
      <section className="bg-primary text-on-primary py-16">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <span className="material-symbols-outlined text-5xl mb-4 text-primary-fixed">
            volunteer_activism
          </span>
          <h2 className="font-headline-lg text-headline-lg mb-4">
            Need Prayer?
          </h2>
          <p className="font-body-lg text-body-lg max-w-2xl mx-auto mb-8 text-primary-fixed-dim">
            Healing encompasses both body and spirit. If you or a loved one are
            facing difficult times, our dedicated team would be honored to pray
            for you. Please select &apos;Prayer Request&apos; in the form above.
          </p>
        </div>
      </section>
    </>
  );
}
