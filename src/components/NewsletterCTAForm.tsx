"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { solicitarCodigoNewsletter } from "@/lib/supabase/actions"
import Icon from "@/components/Icon"

export default function NewsletterCTAForm() {
  const [state, action, pending] = useActionState(solicitarCodigoNewsletter, undefined)
  const t = useTranslations("NewsletterCTA")

  return (
    <form action={action} noValidate className="mx-auto w-full max-w-xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="newsletter-email" className="sr-only">
          {t("emailLabel")}
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          required
          className="w-full flex-1 rounded-xl border-2 border-transparent bg-white px-5 py-3.5 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant/60 transition-all focus:border-on-primary focus:outline-none focus:ring-2 focus:ring-on-primary/60"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 font-label-bold text-label-bold text-primary shadow-lg transition-all duration-200 hover:bg-on-primary-container hover:text-on-primary-fixed-variant active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {pending ? t("sending") : t("subscribe")}
          {!pending && <Icon name="send" size={16} />}
        </button>
      </div>
      {state?.error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-white/15 px-4 py-3 text-left font-body-md text-body-md text-white"
        >
          {state.error}
        </p>
      )}
    </form>
  )
}
