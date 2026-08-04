"use client"

import { useActionState, useState } from "react"
import { crearContrasena } from "@/lib/supabase/actions"
import { useTranslations } from "next-intl"

export default function CrearContrasenaForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(crearContrasena, undefined)
  const t = useTranslations("CrearContrasena")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [mismatch, setMismatch] = useState(false)

  return (
    <section className="py-section-padding">
      <div className="max-w-lg mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
          <h1 className="font-headline-lg text-headline-md text-primary mb-2">{t("title")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            {t("description")}{" "}
            <span className="text-primary font-semibold">{email}</span>
          </p>

          <form
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
                {t("passwordLabel")}
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                id="password"
                name="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                required
                minLength={8}
                onChange={() => setMismatch(false)}
              />
            </div>

            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="confirm-password">
                {t("confirmPasswordLabel")}
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

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-3.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {pending ? t("creating") : t("createPassword")}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
