"use client"

import { useActionState, useEffect } from "react"
import { signup } from "@/lib/supabase/actions"
import Link from "next/link"

export default function RegistroPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  useEffect(() => {
    if (state?.success === "ok") {
      window.location.href = "/"
    }
  }, [state])

  return (
    <section className="py-section-padding px-margin-mobile md:px-margin-desktop">
      <div className="max-w-md mx-auto">
        <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Create Account</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            Join the IKMA community. Registration is free.
          </p>

          <form action={action} className="space-y-6">
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="nombre_completo">
                Full Name
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                id="nombre_completo"
                name="nombre_completo"
                type="text"
                placeholder="Dr. Jane Doe"
                required
              />
            </div>
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
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                id="password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                required
                minLength={6}
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
              disabled={pending}
              className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-3.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {pending ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="font-body-md text-body-md text-on-surface-variant text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
