import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Donation Policy - IKMA",
  description:
    "IKMA's donation policy: how contributions are used, refunds, and contact information.",
}

export default function DonationPolicyPage() {
  return (
    <>
      <section className="py-12 md:py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <span className="font-label-bold text-label-bold text-tertiary uppercase tracking-widest">
            Policies
          </span>
          <h1 className="font-headline-lg text-headline-lg text-primary mt-2 mb-8">
            Donation Policy
          </h1>

          <div className="space-y-10 font-body-md text-body-md text-on-surface-variant leading-relaxed">
            <p>
              Content pending. Please contact us at{" "}
              <a href="mailto:ikma@emmint.com" className="text-primary hover:underline">
                ikma@emmint.com
              </a>{" "}
              with any questions about our donation policy.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
