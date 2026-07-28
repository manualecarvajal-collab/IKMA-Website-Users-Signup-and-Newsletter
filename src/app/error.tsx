"use client"

import Link from "next/link"
import Icon from "@/components/Icon"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <section className="py-section-padding">
      <div className="max-w-lg mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
          <Icon name="error" size={60} className="text-error mb-4" />
          <h1 className="font-headline-lg text-headline-lg text-primary mb-4">Something went wrong</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="bg-primary text-on-primary font-label-bold text-label-bold px-8 py-3.5 rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
            >
              Try again
            </button>
            <Link
              href="/"
              className="bg-surface-container-high text-on-surface font-label-bold text-label-bold px-8 py-3.5 rounded-lg hover:bg-surface-container-highest transition-all inline-block"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
