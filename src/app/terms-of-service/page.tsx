import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export const metadata: Metadata = {
  title: "Terms of Service - IKMA",
  description:
    "IKMA's terms of service: purpose, medical disclaimer, user conduct, donations, limitation of liability, governing law, and contact information.",
}

export default async function TermsOfServicePage() {
  const t = await getTranslations("TermsOfService")

  return (
    <>
      <section className="py-12 md:py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <span className="font-label-bold text-label-bold text-tertiary uppercase tracking-widest">
            {t("eyebrow")}
          </span>
          <h1 className="font-headline-lg text-headline-lg text-primary mt-2 mb-2">
            {t("title")}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            {t("effectiveDate")}
          </p>

          <div className="space-y-10 font-body-md text-body-md text-on-surface-variant leading-relaxed">
            <p>{t("welcome")}</p>
            <p>{t("agree")}</p>

            {/* 1. Purpose */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                {t("s1Title")}
              </h2>
              <p className="mb-2">{t("s1p1")}</p>
              <p>{t("s1p2")}</p>
            </section>

            {/* 2. Medical Disclaimer */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                {t("s2Title")}
              </h2>
              <p className="mb-2">{t("s2p1")}</p>
              <p className="mb-2">{t("s2p2")}</p>
              {t.has("s2p4") && <p className="mb-2">{t("s2p4")}</p>}
              <p>{t("s2p3")}</p>
            </section>

            {/* 3. Faith-Based Content */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                {t("s3Title")}
              </h2>
              <p className="mb-2">{t("s3p1")}</p>
              <p className="mb-2">{t("s3p2")}</p>
              {t.has("s3p3") && <p>{t("s3p3")}</p>}
            </section>

            {/* 4. User Conduct */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                {t("s4Title")}
              </h2>
              <p className="mb-2">{t("s4Intro")}</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>{t("s4li1")}</li>
                <li>{t("s4li2")}</li>
                <li>{t("s4li3")}</li>
                <li>{t("s4li4")}</li>
                <li>{t("s4li5")}</li>
              </ul>
              <p>{t("s4p")}</p>
            </section>

            {/* 5. Intellectual Property */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                {t("s5Title")}
              </h2>
              <p className="mb-2">{t("s5p1")}</p>
              <p>{t("s5p2")}</p>
            </section>

            {/* 6. Donations and Support */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                {t("s6Title")}
              </h2>
              <p className="mb-2">{t("s6p1")}</p>
              <p className="mb-2">{t("s6p2")}</p>
              <p>
                {t("s6p3pre")}
                <a href="/donation-policy" className="text-primary hover:underline">
                  {t("s6link")}
                </a>
                {t("s6p3post")}
              </p>
            </section>

            {/* 7. Third-Party Links */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                {t("s7Title")}
              </h2>
              <p>{t("s7p1")}</p>
            </section>

            {/* 8. Limitation of Liability */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                {t("s8Title")}
              </h2>
              <p className="mb-2">{t("s8p1")}</p>
              <p>{t("s8p2")}</p>
            </section>

            {/* 9. Privacy */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                {t("s9Title")}
              </h2>
              <p className="mb-2">
                {t("s9p1pre")}
                <a href="/privacy-policy" className="text-primary hover:underline">
                  {t("s9link")}
                </a>
                .
              </p>
              <p>{t("s9p2")}</p>
            </section>

            {/* 10. Changes */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                {t("s10Title")}
              </h2>
              <p className="mb-2">{t("s10p1")}</p>
              <p>{t("s10p2")}</p>
            </section>

            {/* 11. Governing Law */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                {t("s11Title")}
              </h2>
              <p>{t("s11p1")}</p>
            </section>

            {/* 12. Contact */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                {t("s12Title")}
              </h2>
              <p className="mb-2">{t("s12p1")}</p>
              <p className="text-on-surface">{t("org")}</p>
              <p>
                {t("emailLabel")}{" "}
                <a
                  href="mailto:ikma@emmint.com"
                  className="text-primary hover:underline"
                >
                  ikma@emmint.com
                </a>
              </p>
            </section>

            <p>{t("closing")}</p>
          </div>
        </div>
      </section>
    </>
  )
}
