"use client"

import { useActionState, useState } from "react"
import { verificarCodigo } from "@/lib/supabase/actions"
import Link from "next/link"
import { useTranslations } from "next-intl"

export default function VerificarCodigoForm({
  initialEmail,
  flow = "recovery",
  initialTipo = "",
  initialRegion = "",
}: {
  initialEmail: string
  flow?: string
  initialTipo?: string
  initialRegion?: string
}) {
  const [state, action, pending] = useActionState(verificarCodigo, undefined)
  const [token, setToken] = useState("")
  const t = useTranslations("VerificarCodigo")
  const isNewsletter = flow === "newsletter"
  const isSignup = flow === "signup"

  return (
    <section className="py-section-padding">
      <div className="max-w-lg mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
          <h1 className="font-headline-lg text-headline-md text-primary mb-2">{t("title")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            {isNewsletter
              ? t("descriptionNewsletter")
              : isSignup
                ? t("descriptionSignup")
                : t("description")}
          </p>

          <form action={action} className="space-y-6">
            <input type="hidden" name="flow" value={flow} />
            <input type="hidden" name="tipo" value={initialTipo} />
            <input type="hidden" name="region" value={initialRegion} />

            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="email">
                {t("emailLabel")}
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                id="email"
                name="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                defaultValue={initialEmail}
                required
              />
            </div>

            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="token">
                {t("codeLabel")}
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors tracking-[0.5em] text-center font-label-bold"
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                placeholder="••••••••"
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
              {pending ? t("verifying") : t("verifyCode")}
            </button>
          </form>

          {!isNewsletter && !isSignup && (
            <p className="font-body-md text-body-md text-on-surface-variant text-center mt-6">
              <Link href="/recuperar" className="text-primary font-semibold hover:underline">
                {t("resendLink")}
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
