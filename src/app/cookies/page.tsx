import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy - IKMA",
  description:
    "IKMA's cookie policy: data retention, your rights under GDPR and US law, data security, international transfers, and children's privacy.",
}

export default function CookiesPage() {
  return (
    <>
      <section className="py-12 md:py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <span className="font-label-bold text-label-bold text-tertiary uppercase tracking-widest">
            Policies
          </span>
          <h1 className="font-headline-lg text-headline-lg text-primary mt-2 mb-8">
            Cookie Policy
          </h1>

          <div className="space-y-10 font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {/* Data Retention */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                Data Retention
              </h2>
              <p>
                We retain personal data only as long as necessary for the
                purposes outlined in this policy or required by law.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                Your Rights
              </h2>
              <h3 className="font-label-bold text-label-bold text-on-surface mb-2">
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
              <h3 className="font-label-bold text-label-bold text-on-surface mb-2">
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

            {/* Data Security */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                Data Security
              </h2>
              <p>
                We implement reasonable technical and organizational measures to
                protect your personal data. However, no system is completely
                secure.
              </p>
            </section>

            {/* International Data Transfers */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                International Data Transfers
              </h2>
              <p>
                Your data may be processed outside your country, including in
                the United States and the European Economic Area. We take steps
                to ensure appropriate safeguards are in place.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                Children&rsquo;s Privacy
              </h2>
              <p>
                Our Service is not intended for children under 13. We do not
                knowingly collect data from children without parental consent
                (as required by U.S. law such as COPPA).
              </p>
            </section>
          </div>
        </div>
      </section>
    </>
  )
}
