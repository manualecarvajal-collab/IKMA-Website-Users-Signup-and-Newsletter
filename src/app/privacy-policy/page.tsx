import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - IKMA",
  description:
    "IKMA's privacy policy: how we protect your information, CalOPPA, COPPA, Fair Information Practices, CAN-SPAM, and contact information.",
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="py-12 md:py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <span className="font-label-bold text-label-bold text-tertiary uppercase tracking-widest">
            Policies
          </span>
          <h1 className="font-headline-lg text-headline-lg text-primary mt-2 mb-8">
            Privacy Policy
          </h1>

          <div className="space-y-10 font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {/* How we protect your information */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                How Do We Protect Your Information?
              </h2>
              <p className="mb-2">
                We do not use vulnerability scanning and/or scanning to PCI
                standards. An external PCI compliant payment gateway handles all
                CC transactions.
              </p>
              <p className="mb-2">We use regular Malware Scanning.</p>
              <p className="mb-2">
                Your personal information is contained behind secured networks
                and is only accessible by a limited number of persons who have
                special access rights to such systems, and are required to keep
                the information confidential. In addition, all sensitive/credit
                information you supply is encrypted via Secure Socket Layer
                (SSL) technology.
              </p>
              <p className="mb-2">
                We implement a variety of security measures when a user enters,
                submits, or accesses their information to maintain the safety of
                your personal information.
              </p>
              <p>
                All transactions are processed through a gateway provider and
                are not stored or processed on our servers.
              </p>
            </section>

            {/* Google */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                Google
              </h2>
              <p>
                Google&rsquo;s advertising requirements can be summed up by
                Google&rsquo;s Advertising Principles. They are put in place to
                provide a positive experience for users.
              </p>
            </section>

            {/* CalOPPA */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                California Online Privacy Protection Act
              </h2>
              <p className="mb-2">
                CalOPPA is the first state law in the nation to require
                commercial websites and online services to post a privacy
                policy. The law&rsquo;s reach stretches well beyond California
                to require any person or company in the United States (and
                conceivably the world) that operates websites collecting
                Personally Identifiable Information from California consumers to
                post a conspicuous privacy policy on its website stating exactly
                the information being collected and those individuals or
                companies with whom it is being shared.
              </p>
              <p className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                According to CalOPPA, we agree to the following:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Users can visit our site anonymously.</li>
                <li>
                  Once this privacy policy is created, we will add a link to it
                  on our home page.
                </li>
                <li>
                  Our Privacy Policy link includes the word &ldquo;Privacy&rdquo;
                  and can easily be found on the page specified above.
                </li>
              </ul>
              <p className="font-label-bold text-label-bold text-on-surface mb-2">
                You will be notified of any Privacy Policy changes:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Via Email</li>
              </ul>
              <p className="font-label-bold text-label-bold text-on-surface mb-2">
                Can change your personal information:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>
                  By logging in to your members account and or email
                  subscription
                </li>
              </ul>
              <p className="font-label-bold text-label-bold text-on-surface mb-2">
                How does our site handle Do Not Track signals?
              </p>
              <p className="mb-2">
                We honor Do Not Track signals and Do Not Track, plant cookies,
                or use advertising when a Do Not Track (DNT) browser mechanism
                is in place.
              </p>
              <p className="font-label-bold text-label-bold text-on-surface mb-2">
                Does our site allow third-party behavioral tracking?
              </p>
              <p>
                It&rsquo;s also important to note that we do not allow
                third-party behavioral tracking.
              </p>
            </section>

            {/* COPPA */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                COPPA (Children Online Privacy Protection Act)
              </h2>
              <p className="mb-2">
                When it comes to the collection of personal information from
                children under the age of 13 years old, the Children&rsquo;s
                Online Privacy Protection Act (COPPA) puts parents in control.
                The Federal Trade Commission, United States&rsquo; consumer
                protection agency, enforces the COPPA Rule, which spells out
                what operators of websites and online services must do to
                protect children&rsquo;s privacy and safety online.
              </p>
              <p>
                We do not specifically market to children under the age of 13
                years old.
              </p>
            </section>

            {/* Fair Information Practices */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                Fair Information Practices
              </h2>
              <p className="mb-2">
                The Fair Information Practices Principles form the backbone of
                privacy law in the United States and the concepts they include
                have played a significant role in the development of data
                protection laws around the globe. Understanding the Fair
                Information Practice Principles and how they should be
                implemented is critical to comply with the various privacy laws
                that protect personal information.
              </p>
              <p className="mb-2">
                In order to be in line with Fair Information Practices we will
                take the following responsive action, should a data breach
                occur:
              </p>
              <p className="mb-2">We will notify you via email</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Within 1 business day</li>
              </ul>
              <p>
                We also agree to the Individual Redress Principle which
                requires that individuals have the right to legally pursue
                enforceable rights against data collectors and processors who
                fail to adhere to the law. This principle requires not only that
                individuals have enforceable rights against data users, but also
                that individuals have recourse to courts or government agencies
                to investigate and/or prosecute non-compliance by data
                processors.
              </p>
            </section>

            {/* CAN-SPAM */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                CAN SPAM Act
              </h2>
              <p className="mb-2">
                The CAN-SPAM Act is a law that sets the rules for commercial
                email, establishes requirements for commercial messages, gives
                recipients the right to have emails stopped from being sent to
                them, and spells out tough penalties for violations.
              </p>
              <p className="font-label-bold text-label-bold text-on-surface mb-2">
                We collect your email address in order to:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>
                  Send information, respond to inquiries, and/or other requests
                  or questions
                </li>
                <li>
                  Process orders and to send information and updates pertaining
                  to orders
                </li>
                <li>
                  Send you additional information related to your product and/or
                  service
                </li>
              </ul>
              <p className="font-label-bold text-label-bold text-on-surface mb-2">
                To be in accordance with CAN-SPAM, we agree to the following:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>
                  Not use false or misleading subjects or email addresses.
                </li>
                <li>
                  Identify the message as an advertisement in some reasonable
                  way.
                </li>
                <li>
                  Include the physical address of our business or site
                  headquarters.
                </li>
                <li>
                  Monitor third-party email marketing services for compliance,
                  if one is used.
                </li>
                <li>Honor opt-out/unsubscribe requests quickly.</li>
                <li>
                  Allow users to unsubscribe by using the link at the bottom of
                  each email.
                </li>
              </ul>
            </section>

            {/* Changes */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. Updates
                will be posted with a new &ldquo;Last updated&rdquo; date.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                Contact Information
              </h2>
              <p className="mb-2">
                If you have any questions or requests regarding this Privacy
                Policy, please contact:
              </p>
              <p className="text-on-surface">
                International Kingdom Medical Association &ndash; IKMA, LLC
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:ikma@emmint.com"
                  className="text-primary hover:underline"
                >
                  ikma@emmint.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </section>
    </>
  )
}
