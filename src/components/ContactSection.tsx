export default function ContactSection() {
  return (
    <>
      <section className="bg-surface-container-low py-24">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h2 className="font-headline-xl text-headline-lg text-primary mb-6">
            Get in Touch
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
             For any inquiries please fill the form below</p>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
             and we’ll get back to you within 24 hours.</p>
        </div>
      </section>

      <section className="pb-12 md:pb-section-padding">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-2xl mx-auto bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)]">
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
