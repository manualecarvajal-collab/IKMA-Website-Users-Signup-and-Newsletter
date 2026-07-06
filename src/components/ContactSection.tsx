export default function ContactSection() {
  return (
    <>
      <section className="bg-surface-container-low py-24">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h2 className="font-headline-xl text-headline-lg text-primary mb-6">
            Get in Touch
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Whether you have questions about our medical funding, want to join
            our network of doctors, or simply need someone to pray with, we are
            here for you. Reach out to us today.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-section-padding">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <div className="lg:col-span-8 bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)]">
              <h3 className="font-headline-md text-headline-md text-primary mb-8">
                Send a Message
              </h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block font-label-bold text-label-bold text-on-surface mb-2"
                      htmlFor="contact-first-name"
                    >
                      First Name
                    </label>
                    <input
                      className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                      id="contact-first-name"
                      placeholder="Jane"
                      type="text"
                    />
                  </div>
                  <div>
                    <label
                      className="block font-label-bold text-label-bold text-on-surface mb-2"
                      htmlFor="contact-last-name"
                    >
                      Last Name
                    </label>
                    <input
                      className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                      id="contact-last-name"
                      placeholder="Doe"
                      type="text"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block font-label-bold text-label-bold text-on-surface mb-2"
                    htmlFor="contact-email"
                  >
                    Email Address
                  </label>
                  <input
                    className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                    id="contact-email"
                    placeholder="jane@example.com"
                    type="email"
                  />
                </div>
                <div>
                  <label
                    className="block font-label-bold text-label-bold text-on-surface mb-2"
                    htmlFor="contact-inquiry-type"
                  >
                    Type of Inquiry
                  </label>
                  <select
                    className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                    id="contact-inquiry-type"
                  >
                    <option>General Question</option>
                    <option>Medical Funding</option>
                    <option>Membership Question</option>
                    <option>Prayer Request</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block font-label-bold text-label-bold text-on-surface mb-2"
                    htmlFor="contact-message"
                  >
                    Your Message
                  </label>
                  <textarea
                    className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                    id="contact-message"
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
                            className="font-body-sm text-label-sm text-on-surface-variant"
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
                <iframe
                  src="https://maps.google.com/maps?q=1391+NW+St.+Lucie+West+Blvd+%23122+Port+St.+Lucie+FL+34986&output=embed&z=15"
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="IKMA Headquarters"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary text-on-primary py-16">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <span className="material-symbols-outlined text-5xl mb-4 text-primary-fixed">
            volunteer_activism
          </span>
          <h3 className="font-headline-lg text-headline-lg mb-4">
            Need Prayer?
          </h3>
          <p className="font-body-lg text-body-lg max-w-2xl mx-auto mb-8 text-primary-fixed-dim">
            Healing encompasses both body and spirit. If you or a loved one are
            facing difficult times, our dedicated team would be honored to pray
            for you. Please select &apos;Prayer Request&apos; in the form above.
          </p>
        </div>
      </section>
    </>
  )
}
