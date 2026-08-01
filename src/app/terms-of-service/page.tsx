import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - IKMA",
  description:
    "IKMA's terms of service: purpose, medical disclaimer, user conduct, donations, limitation of liability, governing law, and contact information.",
}

export default function TermsOfServicePage() {
  return (
    <>
      <section className="py-12 md:py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <span className="font-label-bold text-label-bold text-tertiary uppercase tracking-widest">
            Policies
          </span>
          <h1 className="font-headline-lg text-headline-lg text-primary mt-2 mb-2">
            Terms of Service
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            Effective Date: 31st of July, 2026
          </p>

          <div className="space-y-10 font-body-md text-body-md text-on-surface-variant leading-relaxed">
            <p>
              Welcome to IKMA, LLC, International Kingdom Medical Association. Our website
              exists to advance holistic health, equip healthcare professionals, promote
              health equity, and support Kingdom-minded initiatives that bring healing and
              transformation to individuals, families, communities, and nations.
            </p>
            <p>
              By accessing or using this website, you agree to be bound by these Terms of
              Service. If you do not agree with these terms, please do not use this website.
            </p>

            {/* 1. Purpose */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                1. Purpose of This Website
              </h2>
              <p className="mb-2">
                This website provides information, educational resources, training
                opportunities, research updates, ministry initiatives, community programs,
                and other services related to the mission of IKMA.
              </p>
              <p>
                Our content is designed to support physical, emotional, spiritual, and
                community well-being through the integration of healthcare excellence,
                biblical principles, and innovation.
              </p>
            </section>

            {/* 2. Medical Disclaimer */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                2. Medical Disclaimer
              </h2>
              <p className="mb-2">
                The information provided on this website is for educational and
                informational purposes only and should not be considered medical advice,
                diagnosis, or treatment.
              </p>
              <p className="mb-2">
                Nothing on this website is intended to replace consultation with licensed
                healthcare professionals. Users are encouraged to seek appropriate medical
                advice regarding any health condition or concern.
              </p>
              <p>
                In case of a medical emergency, contact your healthcare provider or
                emergency services immediately.
              </p>
            </section>

            {/* 3. Faith-Based Content */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                3. Faith-Based Content
              </h2>
              <p className="mb-2">
                As a Christian organization, we share content that reflects biblical values
                and our faith in Jesus Christ. Spiritual teachings, devotionals,
                testimonies, and ministry resources are provided for encouragement,
                education, and spiritual growth.
              </p>
              <p>
                Visitors are welcome regardless of religious background. Use of IKMA
                materials requires respect for IKMA&rsquo;s values and principles.
              </p>
            </section>

            {/* 4. User Conduct */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                4. User Conduct
              </h2>
              <p className="mb-2">By using this website, you agree to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Use the website lawfully and respectfully.</li>
                <li>
                  Provide accurate information when registering for programs or submitting
                  forms.
                </li>
                <li>Respect IKMA&rsquo;s faith foundation, values and principles.</li>
                <li>
                  Refrain from posting or transmitting harmful, abusive, defamatory,
                  fraudulent, or unlawful content.
                </li>
                <li>
                  Not attempt to disrupt, damage, or gain unauthorized access to the
                  website or its services.
                </li>
              </ul>
              <p>
                We reserve the right to restrict or terminate access to users who violate
                these terms.
              </p>
            </section>

            {/* 5. Intellectual Property */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                5. Intellectual Property
              </h2>
              <p className="mb-2">
                Unless otherwise stated, all content on this website&mdash;including text,
                logos, graphics, publications, educational materials, training resources,
                videos, and images&mdash;is the property of IKMA and is protected by
                applicable intellectual property laws.
              </p>
              <p>
                Content may not be reproduced, modified, distributed, or used for
                commercial purposes without prior written permission.
              </p>
            </section>

            {/* 6. Donations and Support */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                6. Donations and Support
              </h2>
              <p className="mb-2">
                Donations made through this website are voluntary and support the mission
                and activities of IKMA.
              </p>
              <p className="mb-2">
                We are committed to stewarding all contributions responsibly in support of
                our healthcare, educational, research, and outreach initiatives.
              </p>
              <p>
                Refunds for donations will be considered in accordance with applicable laws
                and our donation policy.
              </p>
            </section>

            {/* 7. Third-Party Links */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                7. Links to Third-Party Websites
              </h2>
              <p>
                This website may contain links to external websites for the convenience of
                users. We do not control or endorse the content, policies, or practices of
                third-party websites and are not responsible for any information or
                services they provide.
              </p>
            </section>

            {/* 8. Limitation of Liability */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                8. Limitation of Liability
              </h2>
              <p className="mb-2">
                While we strive to provide accurate and up-to-date information, IKMA makes
                no guarantees regarding the completeness, accuracy, or reliability of
                website content.
              </p>
              <p>
                To the fullest extent permitted by law, IKMA, its officers, directors,
                employees, volunteers, and partners shall not be liable for any loss,
                damage, or injury arising from the use of this website or reliance upon its
                content.
              </p>
            </section>

            {/* 9. Privacy */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                9. Privacy
              </h2>
              <p className="mb-2">
                Your privacy is important to us. Information collected through this website
                is governed by our{" "}
                <a href="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
              <p>
                By using this website, you consent to the collection and use of information
                as described in our Privacy Policy.
              </p>
            </section>

            {/* 10. Changes */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                10. Changes to These Terms
              </h2>
              <p className="mb-2">
                We reserve the right to modify these Terms of Service at any time. Updated
                versions will be posted on this page with a revised effective date.
              </p>
              <p>
                Continued use of the website after changes are posted constitutes
                acceptance of the revised terms.
              </p>
            </section>

            {/* 11. Governing Law */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                11. Governing Law
              </h2>
              <p>
                These Terms of Service shall be governed by and interpreted in accordance
                with the laws of the State of Kansas, USA, without regard to conflict of
                law principles.
              </p>
            </section>

            {/* 12. Contact */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                12. Contact Information
              </h2>
              <p className="mb-2">
                If you have any questions regarding these Terms of Service, please contact:
              </p>
              <p className="text-on-surface">
                IKMA LLC, International Kingdom Medical Association
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

            <p>
              Our commitment is to serve with integrity, compassion, excellence, and faith
              as we work toward a world fulfilled and restored according to God&rsquo;s
              design.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
