"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { updatePassword } from "@/lib/supabase/actions"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import Icon from "@/components/Icon"

type OtpType = "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email"

type Status = "loading" | "error" | "ready"

export default function ActualizarPasswordPage() {
  const router = useRouter()
  const t = useTranslations("ActualizarPassword")
  const [status, setStatus] = useState<Status>("loading")
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
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get("code")
        const tokenHash = params.get("token_hash")
        const type = params.get("type")

        // Implicit flow: the session arrives in the URL fragment (#access_token=...)
        const hashParams = new URLSearchParams(window.location.hash.slice(1))
        const accessToken = hashParams.get("access_token")

        if (accessToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") ?? "",
          })
        } else if (tokenHash && type) {
          await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as OtpType })
        } else if (code) {
          await supabase.auth.exchangeCodeForSession(code)
        }

        window.history.replaceState({}, "", "/actualizar-password")

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.replace("/login")
          return
        }
        setStatus("ready")
      } catch {
        setStatus("error")
      }
    })()
  }, [router])

  if (status === "loading") {
    return (
      <section className="py-section-padding min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-body-md text-body-md text-on-surface-variant">{t("loading")}</p>
        </div>
      </section>
    )
  }

  if (status === "error") {
    return (
      <section className="py-section-padding min-h-[60vh] flex items-center justify-center">
        <div className="max-w-lg mx-auto px-margin-mobile md:px-margin-desktop w-full">
          <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20 text-center">
            <Icon name="link_off" size={44} className="text-error mx-auto mb-4" />
            <h1 className="font-headline-lg text-headline-md text-primary mb-3">{t("invalidLinkTitle")}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8">
              {t("invalidLink")}
            </p>
            <Link
              href="/recuperar"
              className="inline-block w-full bg-primary text-on-primary font-label-bold text-label-bold py-3.5 rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
            >
              {t("requestNewLink")}
            </Link>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mt-6">
              <Link href="/login" className="text-primary font-semibold hover:underline">
                {t("backToSignIn")}
              </Link>
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-section-padding">
      <div className="max-w-lg mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
          <h1 className="font-headline-lg text-headline-md text-primary mb-2">{t("title")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            {t("description")}
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
                {t("newPassword")}
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                id="password"
                name="password"
                type="password"
                placeholder={t("newPasswordPlaceholder")}
                required
                minLength={8}
                onChange={() => setMismatch(false)}
              />
            </div>

            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="confirm-password">
                {t("confirmPassword")}
              </label>
              <input
                className={`w-full rounded-md bg-surface border text-on-surface py-3 px-4 focus:ring-0 transition-colors ${
                  mismatch ? "border-error" : "border-outline-variant focus:border-primary"
                }`}
                id="confirm-password"
                name="confirm-password"
                type="password"
                placeholder={t("confirmPasswordPlaceholder")}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (mismatch) setMismatch(false)
                }}
              />
              {mismatch && (
                <p className="font-body-md text-body-md text-error mt-1.5">{t("mismatch")}</p>
              )}
            </div>

            {state?.error && (
              <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3">{state.error}</p>
            )}
            {state?.success && (
              <p className="font-body-md text-body-md text-on-primary-fixed-variant bg-tertiary-fixed-dim rounded-md px-4 py-3">{t("passwordUpdated")}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-3.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {pending ? t("updating") : t("updatePassword")}
            </button>
          </form>

          {state?.success && (
            <p className="font-body-md text-body-md text-on-surface-variant text-center mt-6">
              <Link href="/login" className="text-primary font-semibold hover:underline">
                {t("backToSignIn")}
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
