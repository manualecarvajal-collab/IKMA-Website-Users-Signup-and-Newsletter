"use client"

import Link from "next/link"
import { useState } from "react"
import { useTranslations } from "next-intl"
import Icon from "@/components/Icon"

// Site-wide reminder for members who filled the membership form but never
// completed the payment step (solicitud in estado "incompleta"). Shows which
// steps are done and sends them straight back to the payment step.
export default function IncompleteRegistrationBanner({
  tipoMiembro,
  region,
}: {
  tipoMiembro: number
  region: string
}) {
  const t = useTranslations("IncompleteRegistration")
  const [hidden, setHidden] = useState(false)

  if (hidden) return null

  const continueUrl = `/membresia?tipo=${tipoMiembro}&region=${region}&step=3`

  const steps = [
    { key: "stepMembership", done: true },
    { key: "stepRegistration", done: true },
    { key: "stepPayment", done: false },
    { key: "stepConfirmation", done: false },
  ]

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <Icon name="info" size={22} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-amber-900 leading-snug">{t("title")}</p>
            <p className="text-xs text-amber-800/80 leading-snug">{t("subtitle")}</p>
          </div>
        </div>

        <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold">
          {steps.map((s) => (
            <li key={s.key} className="flex items-center gap-1">
              {s.done ? (
                <Icon name="check_circle" size={14} className="text-green-600" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 bg-white inline-block" />
              )}
              <span className={s.done ? "text-amber-800" : "text-amber-700/70"}>{t(s.key)}</span>
            </li>
          ))}
        </ol>

        <Link
          href={continueUrl}
          className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-5 py-2 rounded-full transition shrink-0 shadow-sm"
        >
          {t("continueCta")}
          <Icon name="arrow_forward" size={15} />
        </Link>

        <button
          type="button"
          onClick={() => setHidden(true)}
          aria-label={t("dismiss")}
          title={t("dismiss")}
          className="text-amber-700/60 hover:text-amber-900 p-1 shrink-0"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
    </div>
  )
}
