"use client"

import { useActionState } from "react"
import { resetPassword } from "@/lib/supabase/actions"
import Link from "next/link"

export default function RecuperarPage() {
  const [state, action, pending] = useActionState(resetPassword, undefined)

  return (
    <section className="py-section-padding">
      <div className="max-w-lg mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
          <h1 className="font-headline-lg text-headline-md text-primary mb-2">Reset Password</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          <form action={action} className="space-y-6">
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                required
              />
            </div>

            {state?.error && (
              <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3">{state.error}</p>
            )}
            {state?.success && (
              <p className="font-body-md text-body-md text-on-primary-fixed-variant bg-tertiary-fixed-dim rounded-md px-4 py-3">{state.success}</p>
            )}

            <button
              type="submit"
              disabled={pending || !!state?.success}
              className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-3.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {pending ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="font-body-md text-body-md text-on-surface-variant text-center mt-6">
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
