"use client"

import { useActionState, useEffect } from "react"
import { login } from "@/lib/supabase/actions"
import Link from "next/link"

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  useEffect(() => {
    if (state?.success) {
      window.location.href = "/"
    }
  }, [state])

  return (
    <section className="py-section-padding">
      <div className="max-w-md mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Welcome Back</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">Sign in to your IKMA account.</p>

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
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>

            {state?.error && (
              <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-3.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {pending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="font-body-md text-body-md text-on-surface-variant text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/registro" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
