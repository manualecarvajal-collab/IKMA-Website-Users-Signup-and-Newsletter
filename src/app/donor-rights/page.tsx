import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Donor Rights - IKMA",
  description:
    "IKMA's donor rights and donation policy: acceptance of donations, use of funds, donor privacy, refunds, ethical fundraising, and contact information.",
}

export default function DonorRightsPage() {
  return (
    <>
      <section className="py-12 md:py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <span className="font-label-bold text-label-bold text-tertiary uppercase tracking-widest">
            Policies
          </span>
          <h1 className="font-headline-lg text-headline-lg text-primary mt-2 mb-2">
            Donation Policy
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            IKMA LLC Donation Policy &mdash; Effective Date: 31st of July, 2026
          </p>

          <div className="space-y-10 font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {/* 1. Purpose */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                1. Purpose
              </h2>
              <p className="mb-2">
                IKMA exists to advance holistic health, healthcare education, research,
                innovation, and Kingdom-centered solutions that promote physical,
                emotional, spiritual, and community well-being.
              </p>
              <p className="mb-2">
                Voluntary donations received by IKMA LLC help support programs and
                initiatives aligned with our mission, including:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Healthcare outreach and community health initiatives</li>
                <li>Training and development of healthcare professionals</li>
                <li>Educational programs and scholarships</li>
                <li>Medical missions and humanitarian projects</li>
                <li>Research and innovation in healthcare</li>
                <li>Community development and health equity efforts</li>
                <li>Operational support for mission-driven activities</li>
              </ul>
            </section>

            {/* 2. Acceptance */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                2. Acceptance of Donations
              </h2>
              <p className="mb-2">
                IKMA gratefully accepts donations from individuals, businesses,
                foundations, and other organizations.
              </p>
              <p className="mb-2">
                The Company reserves the right to decline any donation that:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Is inconsistent with the mission, values, or objectives of IKMA;</li>
                <li>Would create a conflict of interest;</li>
                <li>
                  Could expose the Company to legal, ethical, or regulatory concerns;
                </li>
                <li>
                  Carries conditions that compromise the independence or integrity of the
                  organization.
                </li>
              </ul>
            </section>

            {/* 3. Use of Funds */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                3. Use of Funds
              </h2>
              <p className="mb-2">
                All donations shall be used at the discretion of IKMA to further its
                mission and strategic objectives.
              </p>
              <p>
                When a donor designates a contribution for a specific project or program,
                IKMA will make reasonable efforts to honor that designation. If the
                designated project becomes impractical, completed, or discontinued, the
                Company reserves the right to redirect funds to a similar purpose
                consistent with its mission.
              </p>
            </section>

            {/* 4. Tax Considerations */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                4. Tax Considerations
              </h2>
              <p className="mb-2">
                IKMA LLC is a for-profit limited liability company and is not recognized as
                a tax-exempt charitable organization under Section 501(c)(3) of the
                Internal Revenue Code unless otherwise stated in writing.
              </p>
              <p>
                Therefore, donations made to IKMA LLC may not be tax-deductible. Donors
                are encouraged to consult their tax advisor regarding the tax treatment of
                any contribution.
              </p>
            </section>

            {/* 5. Donor Privacy */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                5. Donor Privacy
              </h2>
              <p className="mb-2">
                IKMA LLC respects donor privacy and is committed to protecting personal
                information.
              </p>
              <p className="mb-2">
                We will not sell, rent, or share donor information with third parties
                except:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>As required by law;</li>
                <li>To process donations through authorized service providers;</li>
                <li>With the donor&rsquo;s explicit permission.</li>
              </ul>
            </section>

            {/* 6. Donor Recognition */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                6. Donor Recognition
              </h2>
              <p className="mb-2">
                IKMA LLC may publicly acknowledge donors unless the donor requests
                anonymity.
              </p>
              <p>
                Donors may request in writing that their name, donation amount, or
                identifying information remain confidential.
              </p>
            </section>

            {/* 7. Receipts */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                7. Receipts and Records
              </h2>
              <p className="mb-2">
                A receipt or acknowledgment will be provided for all donations received.
              </p>
              <p className="mb-2">The receipt shall include:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>The donor&rsquo;s name;</li>
                <li>The amount or description of the contribution;</li>
                <li>The date received;</li>
                <li>Any required legal disclosures.</li>
              </ul>
            </section>

            {/* 8. Refund Policy */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                8. Refund Policy
              </h2>
              <p className="mb-2">
                Donations are generally considered voluntary and non-refundable.
              </p>
              <p className="mb-2">
                Refund requests may be considered on a case-by-case basis if:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>An administrative error occurred;</li>
                <li>A duplicate donation was processed;</li>
                <li>Fraudulent use of a payment method is demonstrated.</li>
              </ul>
              <p>
                Requests for refunds should be submitted within thirty (30) days of the
                donation date.
              </p>
            </section>

            {/* 9. Ethical Fundraising */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                9. Ethical Fundraising
              </h2>
              <p className="mb-2">
                IKMA LLC is committed to conducting all fundraising activities with
                integrity, transparency, accountability, and respect.
              </p>
              <p className="mb-2">The Company shall:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Represent its mission truthfully;</li>
                <li>Use donations responsibly;</li>
                <li>Maintain accurate financial records;</li>
                <li>Comply with applicable federal, state, and local laws.</li>
              </ul>
            </section>

            {/* 10. Policy Review */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                10. Policy Review
              </h2>
              <p>
                This Donation Policy shall be reviewed periodically by management and may
                be amended as necessary to reflect changes in law, operations, or
                organizational priorities.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                Contact Information
              </h2>
              <p className="mb-2">IKMA LLC</p>
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

            {/* Mission Commitment */}
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-3">
                Mission Commitment
              </h2>
              <p>
                IKMA LLC is committed to stewarding every donation with excellence,
                integrity, and accountability as we work to advance health equity, equip
                healthcare leaders, foster innovation, and deliver holistic solutions that
                strengthen individuals, families, communities, and nations in accordance
                with Biblical values.
              </p>
            </section>
          </div>
        </div>
      </section>
    </>
  )
}
