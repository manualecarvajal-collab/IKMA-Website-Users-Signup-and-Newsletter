"use client"

import Link from "next/link"
import { useState } from "react"
import { useTranslations } from "next-intl"
import Icon from "@/components/Icon"

// Site-wide reminder for users who abandoned the membership process at any
// step: shows which steps are done and which were left behind. The DB record
// ("incompleta" application) covers abandonment at the payment step; before
// submission the form leaves a tracking cookie with the last step reached.
export default function IncompleteRegistrationBanner({
  tipoMiembro,
  region,
  paso,
}: {
  tipoMiembro: number | null
  region: string | null
  paso: number
}) {
  const t = useTranslations("IncompleteRegistration")
  const [hidden, setHidden] = useState(false)

  if (hidden) return null

  // Professionals (1) and residents (2) cannot deep-link past step 2.
  const maxStep = tipoMiembro === 1 || tipoMiembro === 2 ? 2 : 3
  const stepUrl = Math.min(paso, maxStep)
  const params = new URLSearchParams()
  if (tipoMiembro != null) params.set("tipo", String(tipoMiembro))
  if (region) params.set("region", region)
  if (tipoMiembro != null && stepUrl > 1) params.set("step", String(stepUrl))
  const continueUrl = `/membresia${params.size ? `?${params}` : ""}`

  const steps = [
    { key: "stepMembership", done: paso >= 2 },
    { key: "stepRegistration", done: paso >= 3 },
    { key: "stepPayment", done: paso >= 4 },
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
