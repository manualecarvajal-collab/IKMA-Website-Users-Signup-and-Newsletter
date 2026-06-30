"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { updatePassword } from "@/lib/supabase/actions"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ActualizarPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [state, action, pending] = useActionState(updatePassword, undefined)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [mismatch, setMismatch] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    (async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
        window.history.replaceState({}, "", "/actualizar-password")
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace("/login")
      } else {
        setReady(true)
      }
    })()
  }, [router])

  if (!ready) return null

  return (
    <section className="py-section-padding">
      <div className="max-w-lg mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
          <h1 className="font-headline-lg text-headline-md text-primary mb-2">Set New Password</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            Choose a new password for your account.
          </p>

          <form
            ref={formRef}
            action={action}
            onSubmit={(e) => {
              const pwd = new FormData(e.currentTarget).get("password") as string
              if (pwd !== confirmPassword) {
                e.preventDefault()
                setMismatch(true)
                return
              }
              setMismatch(false)
            }}
            className="space-y-6"
          >
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="password">
                New Password
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                required
                minLength={8}
                onChange={() => setMismatch(false)}
              />
            </div>

            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <input
                className={`w-full rounded-md bg-surface border text-on-surface py-3 px-4 focus:ring-0 transition-colors ${
                  mismatch ? "border-error" : "border-outline-variant focus:border-primary"
                }`}
                id="confirm-password"
                name="confirm-password"
                type="password"
                placeholder="Re-enter your new password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (mismatch) setMismatch(false)
                }}
              />
              {mismatch && (
                <p className="font-body-md text-body-md text-error mt-1.5">Passwords do not match.</p>
              )}
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
              {pending ? "Updating..." : "Update Password"}
            </button>
          </form>

          {state?.success && (
            <p className="font-body-md text-body-md text-on-surface-variant text-center mt-6">
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Back to Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
