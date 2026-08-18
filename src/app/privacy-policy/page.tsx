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
            Privacy Policy of IKMA LLC
          </h1>

          <p className="mb-6 text-on-surface-variant">Last Updated: 31st July, 2026</p>

          <div className="space-y-10 font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {/* Introduction */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                Introduction
              </h2>
              <p className="mb-2">
                IKMA LLC (&ldquo;IKMA,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or
                &ldquo;us&rdquo;) is committed to respecting and protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, store, and
                protect your personal information when you visit our website, participate
                in our programs, make a donation, register for events, apply for
                scholarships or educational programs, or otherwise interact with us.
              </p>
              <p>
                By using our website or services, you consent to the practices described
                in this Privacy Policy.
              </p>
            </section>

            {/* 1. Information We Collect */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                1. Information We Collect
              </h2>
              <p className="mb-2">We may collect the following categories of information:</p>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                Personal Information
              </h3>
              <p className="mb-2">Information you voluntarily provide, including:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Full name</li>
                <li>Email address</li>
                <li>Telephone number</li>
                <li>Mailing address</li>
                <li>Organization or employer</li>
                <li>Professional credentials</li>
                <li>Educational information</li>
                <li>Event registration information</li>
                <li>Scholarship or grant application information</li>
                <li>Donation information</li>
              </ul>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                Payment Information
              </h3>
              <p className="mb-2">
                When making donations or purchases, payment information may be processed
                through secure third-party payment providers. IKMA LLC does not store
                complete credit card or banking information on its servers.
              </p>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                Website Usage Information
              </h3>
              <p className="mb-2">
                We may automatically collect certain information, including:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>IP address</li>
                <li>Browser type</li>
                <li>Device information</li>
                <li>Pages visited</li>
                <li>Date and time of access</li>
                <li>Referring websites</li>
                <li>Website usage analytics</li>
              </ul>
            </section>

            {/* 2. How We Use Your Information */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                2. How We Use Your Information
              </h2>
              <p className="mb-2">We may use your information to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Provide services, programs, and educational resources.</li>
                <li>Process donations and payments.</li>
                <li>Respond to inquiries and requests.</li>
                <li>Manage event registrations and participation.</li>
                <li>Administer scholarships, grants, and support programs.</li>
                <li>Send newsletters, updates, and organizational communications.</li>
                <li>Improve website functionality and user experience.</li>
                <li>Conduct research and program evaluation.</li>
                <li>Comply with legal and regulatory obligations.</li>
                <li>Protect the security and integrity of our operations.</li>
              </ul>
            </section>

            {/* 3. Communications */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                3. Communications
              </h2>
              <p className="mb-2">
                If you subscribe to newsletters or updates, we may send information
                regarding:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Healthcare initiatives</li>
                <li>Educational opportunities</li>
                <li>Research projects</li>
                <li>Events and conferences</li>
                <li>Outreach programs</li>
                <li>Organizational announcements</li>
              </ul>
              <p>
                You may opt out of marketing communications at any time by following
                the unsubscribe instructions contained in our communications.
              </p>
            </section>

            {/* 4. Sharing of Information */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                4. Sharing of Information
              </h2>
              <p className="mb-4">IKMA LLC does not sell personal information.</p>
              <p className="mb-2">We may share information with:</p>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                a. Service Providers
              </h3>
              <p className="mb-2">
                Trusted third parties that assist with:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Payment processing</li>
                <li>Website hosting</li>
                <li>Data storage</li>
                <li>Analytics</li>
                <li>Communication services</li>
                <li>Event management</li>
              </ul>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                b. Information collected automatically
              </h3>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>IP address</li>
                <li>Device and browser type</li>
                <li>Usage data (pages viewed, time spent)</li>
                <li>Cookies and tracking technologies</li>
              </ul>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                c. Information from third parties
              </h3>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Payment processors</li>
                <li>Analytics providers</li>
                <li>Advertising partners</li>
              </ul>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                How We Use Your Information
              </h3>
              <p className="mb-2">
                We use your data for legitimate business purposes, including:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Providing and maintaining our Service</li>
                <li>Processing transactions and fulfilling orders</li>
                <li>Communicating with you (support, updates, marketing if permitted)</li>
                <li>Improving our website, services, and user experience</li>
                <li>Complying with legal obligations</li>
              </ul>
              <p className="mb-4">
                Under GDPR, we rely on lawful bases such as consent, contract
                performance, and legitimate interests.
              </p>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                Sharing Your Information
              </h3>
              <p className="mb-2">We may share your data with:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Service providers (hosting, payments, analytics)</li>
                <li>Legal authorities (when required by law)</li>
                <li>Business partners (if relevant to services provided)</li>
              </ul>
              <p className="mb-4">
                We do not sell personal information unless explicitly stated or required
                to disclose under applicable U.S. laws.
              </p>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                c. Legal Requirements
              </h3>
              <p className="mb-2">
                We may disclose information if required by law, court order, regulatory
                authority, or to protect the rights, safety, and security of IKMA LLC or
                others.
              </p>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                d. Business Transactions
              </h3>
              <p>
                In the event of a merger, acquisition, restructuring, or sale of assets,
                personal information may be transferred as part of the transaction.
              </p>
            </section>

            {/* 5. Donations and Contributor Information */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                5. Donations and Contributor Information
              </h2>
              <p className="mb-2">
                Information collected from donors is used to:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Process contributions</li>
                <li>Provide donation acknowledgments and receipts</li>
                <li>Maintain donation records</li>
                <li>Communicate impact and organizational updates</li>
              </ul>
              <p>
                Donor information will be treated with confidentiality and will not be
                sold to third parties.
              </p>
            </section>

            {/* 6. Scholarships, Grants, and Educational Programs */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                6. Scholarships, Grants, and Educational Programs
              </h2>
              <p>
                Applicants for scholarships, grants, internships, fellowships, or
                educational opportunities may be required to submit additional personal
                information. Such information will be used solely for application review,
                program administration, reporting, and related organizational purposes.
              </p>
            </section>

            {/* 7. Cookies and Tracking Technologies */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                7. Cookies and Tracking Technologies
              </h2>
              <p className="mb-2">
                Cookies are small files that a site or its service provider transfers to
                your computer&rsquo;s hard drive through your Web browser (if you allow)
                that enables the site&rsquo;s or service provider&rsquo;s systems to
                recognize your browser and capture and remember certain information. For
                instance, we use cookies to help us remember and process the items in
                your shopping cart. They are also used to help us understand your
                preferences based on previous or current site activity, which enables us
                to provide you with improved services. We also use cookies to help us
                compile aggregate data about site traffic and site interaction so that we
                can offer better site experiences and tools in the future.
              </p>
              <p className="mb-2">
                Our website may use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Improve functionality</li>
                <li>Analyze user behavior</li>
                <li>Enhance website performance</li>
                <li>Remember user preferences</li>
              </ul>
              <p className="mb-2">
                Users may adjust browser settings to limit or disable cookies; however,
                some website features may not function properly if cookies are disabled.
              </p>
              <p className="mb-2">
                If users disable cookies in their browser:
              </p>
              <p>
                If you turn cookies off it will turn off some of the features of the
                site.
              </p>
            </section>

            {/* 8. Data Security */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                8. Data Security
              </h2>
              <p className="mb-2">
                IKMA LLC implements reasonable administrative, technical, and physical
                safeguards designed to protect personal information from unauthorized
                access, disclosure, alteration, or destruction.
              </p>
              <p>
                While we strive to protect personal information, no method of
                transmission over the internet or electronic storage is completely
                secure.
              </p>
            </section>

            {/* 9. Data Retention */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                9. Data Retention
              </h2>
              <p className="mb-2">
                We retain personal information only for as long as necessary or the
                purposes outlined in this policy or required by law to:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Fulfill the purposes described in this Policy;</li>
                <li>Comply with legal obligations;</li>
                <li>Resolve disputes;</li>
                <li>Enforce agreements; and</li>
                <li>Maintain organizational records.</li>
              </ul>
            </section>

            {/* 10. Your Privacy Rights */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                10. Your Privacy Rights
              </h2>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                a. European Economic Area (GDPR rights)
              </h3>
              <p className="mb-2">
                If you are in the EU/EEA, you have the right to:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Access your personal data</li>
                <li>Rectify inaccurate data</li>
                <li>Request deletion (&ldquo;right to be forgotten&rdquo;)</li>
                <li>Restrict or object to processing</li>
                <li>Data portability</li>
              </ul>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                b. United States (e.g., California)
              </h3>
              <p className="mb-2">
                If applicable, you may have the right to:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Know what data we collect</li>
                <li>Request deletion</li>
                <li>Opt out of sale or sharing of personal data</li>
                <li>Non-discrimination for exercising your rights</li>
              </ul>
              <p>
                To exercise your rights, contact us at:{" "}
                <a
                  href="mailto:ikma@emmint.com"
                  className="text-primary hover:underline"
                >
                  ikma@emmint.com
                </a>
              </p>
            </section>

            {/* 11. Children's Privacy */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                11. Children&rsquo;s Privacy
              </h2>
              <p className="mb-2">
                Our website and services are not directed toward children under the age
                of 13. We do not knowingly collect personal information from children
                under 13 without appropriate parental consent where required by law (U.S.
                law such as COPPA).
              </p>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                COPPA (Children Online Privacy Protection Act)
              </h3>
              <p className="mb-2">
                When it comes to the collection of personal information from children
                under the age of 13 years old, the Children&rsquo;s Online Privacy
                Protection Act (COPPA) puts parents in control. The Federal Trade
                Commission, United States&rsquo; consumer protection agency, enforces the
                COPPA Rule, which spells out what operators of websites and online
                services must do to protect children&rsquo;s privacy and safety online.
              </p>
              <p>
                We do not specifically market to children under the age of 13 years old.
              </p>
            </section>

            {/* 12. Third-Party Links */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                12. Third-Party Links
              </h2>
              <p className="mb-2">
                Our website may contain links to third-party websites. We are not
                responsible for the privacy practices or content of external websites.
              </p>
              <p>
                Users should review the privacy policies of any third-party websites
                they visit.
              </p>
            </section>

            {/* 13. International Users */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                13. International Users
              </h2>
              <p>
                Individuals accessing our website from outside the United States
                understand that information may be processed and stored in the United
                States or other jurisdictions where our service providers operate. Your
                data may be processed outside your country, including in the United States
                and the European Economic Area. We take steps to ensure appropriate
                safeguards are in place.
              </p>
            </section>

            {/* 14. Fair Information Practices */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                14. Fair Information Practices
              </h2>
              <p className="mb-2">
                The Fair Information Practices Principles form the backbone of privacy
                law in the United States and the concepts they include have played a
                significant role in the development of data protection laws around the
                globe. Understanding the Fair Information Practice Principles and how
                they should be implemented is critical to comply with the various
                privacy laws that protect personal information.
              </p>
              <p className="mb-2">
                In order to be in line with Fair Information Practices we will take the
                following responsive action, should a data breach occur:
              </p>
              <p className="mb-2">We will notify you via email</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Within 1 business day</li>
              </ul>
              <p className="mb-4">
                We also agree to the Individual Redress Principle which requires that
                individuals have the right to legally pursue enforceable rights against
                data collectors and processors who fail to adhere to the law. This
                principle requires not only that individuals have enforceable rights
                against data users, but also that individuals have recourse to courts or
                government agencies to investigate and/or prosecute non-compliance by
                data processors.
              </p>

              <h3 className="font-label-bold text-label-bold text-on-surface mt-4 mb-2">
                CAN SPAM Act
              </h3>
              <p className="mb-2">
                The CAN-SPAM Act is a law that sets the rules for commercial email,
                establishes requirements for commercial messages, gives recipients the
                right to have emails stopped from being sent to them, and spells out
                tough penalties for violations.
              </p>
              <p className="mb-2">
                We collect your email address in order to:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>
                  Send information, respond to inquiries, and/or other requests or
                  questions
                </li>
                <li>
                  Process orders and to send information and updates pertaining to
                  orders.
                </li>
                <li>
                  Send you additional information related to your product and/or service
                </li>
              </ul>
              <p className="mb-2">
                To be in accordance with CANSPAM, we agree to the following:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>
                  Not use false or misleading subjects or email addresses.
                </li>
                <li>
                  Identify the message as an advertisement in some reasonable way.
                </li>
                <li>
                  Include the physical address of our business or site headquarters.
                </li>
                <li>
                  Monitor third-party email marketing services for compliance, if one is
                  used.
                </li>
                <li>Honor opt-out/unsubscribe requests quickly.</li>
                <li>
                  Allow users to unsubscribe by using the link at the bottom of each
                  email.
                </li>
              </ul>
            </section>

            {/* 15. Changes to This Privacy Policy */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                15. Changes to This Privacy Policy
              </h2>
              <p>
                IKMA LLC may update this Privacy Policy periodically. Changes become
                effective when posted on this page. Continued use of our website or
                services after modifications indicates acceptance of the revised Privacy
                Policy.
              </p>
            </section>

            {/* 16. Contact Information */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                16. Contact Information
              </h2>
              <p className="mb-2">
                For questions regarding this Privacy Policy or privacy-related
                requests, contact:
              </p>
              <p className="text-on-surface">IKMA LLC</p>
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

            {/* Our Commitment */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                Our Commitment
              </h2>
              <p>
                IKMA LLC is committed to stewarding personal information with integrity,
                professionalism, transparency, and respect, consistent with our mission
                of advancing health equity, education, innovation, and holistic
                transformation in individuals, families, communities, and nations
                according to biblical principals.
              </p>
            </section>
          </div>
        </div>
      </section>
    </>
  )
}
