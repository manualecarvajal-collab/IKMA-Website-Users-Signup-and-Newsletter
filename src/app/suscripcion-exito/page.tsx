import type { Metadata } from "next"
import Link from "next/link"
import Icon from "@/components/Icon"

export const metadata: Metadata = {
  title: "Thank You - IKMA",
  description: "Thank you for your support. Your subscription helps us continue our mission.",
}

export default function SuscripcionExitoPage() {
  return (
    <section className="py-section-padding">
      <div className="max-w-lg mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
          <Icon name="verified" size={60} className="text-tertiary mb-4" />
          <h1 className="font-headline-lg text-headline-lg text-primary mb-4">Thank You for Your Support!</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
            Your contribution makes a difference. As a supporter, you now have access to our exclusive magazines and journals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/revista"
              className="bg-primary text-on-primary font-label-bold text-label-bold px-8 py-3.5 rounded-lg hover:bg-primary/90 transition-all"
            >
              Browse Articles
            </Link>
            <Link
              href="/"
              className="bg-surface-container-high text-on-surface font-label-bold text-label-bold px-8 py-3.5 rounded-lg hover:bg-surface-container-highest transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
