"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Icon from "@/components/Icon"
import { createClient } from "@/lib/supabase/client"

// Site-wide reminder for users who abandoned the membership process at any
// step: shows which steps are done and which were left behind. The DB record
// ("incompleta" application) covers abandonment at the payment step; before
// submission the form leaves a tracking cookie with the last step reached.
// Fetches everything client-side so the root layout stays auth-free.
export default function IncompleteRegistrationBanner() {
  const t = useTranslations("IncompleteRegistration")
  const [hidden, setHidden] = useState(false)
  const [data, setData] = useState<{ tipoMiembro: number | null; region: string | null; paso: number } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active || !session) return
      const userId = session.user.id

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", userId)
        .single()
      if (!active) return

      // Never nag users who already have a paid/approved application.
      const { data: procesoCompleto } = await supabase
        .from("solicitudes_membresia")
        .select("id")
        .eq("usuario_id", userId)
        .in("estado", ["aprobada", "pagada"])
        .limit(1)
        .maybeSingle()
      if (!active || procesoCompleto) return

      // Submitted form without paying → the DB record knows the step.
      const { data: solicitud } = await supabase
        .from("solicitudes_membresia")
        .select("estado, tipo_miembro, region")
        .eq("usuario_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (!active) return

      if (solicitud?.estado === "incompleta") {
        setData({ tipoMiembro: solicitud.tipo_miembro, region: solicitud.region, paso: 3 })
      } else if (!solicitud && perfil?.rol !== "administrador") {
        // Before submission the form tracks the last step reached in a cookie.
        const cookie = document.cookie
          .split("; ")
          .find((c) => c.startsWith("membresia_proceso="))
          ?.split("=")[1]
        if (cookie) {
          const [paso, tipo, region] = cookie.split("|")
          setData({
            tipoMiembro: Number(tipo) || null,
            region: region || null,
            paso: Math.min(Number(paso) || 1, 3),
          })
        }
      }
    })

    return () => {
      active = false
    }
  }, [])

  if (hidden || !data) return null

  // Professionals (1) and residents (2) cannot deep-link past step 2.
  const maxStep = data.tipoMiembro === 1 || data.tipoMiembro === 2 ? 2 : 3
  const stepUrl = Math.min(data.paso, maxStep)
  const params = new URLSearchParams()
  if (data.tipoMiembro != null) params.set("tipo", String(data.tipoMiembro))
  if (data.region) params.set("region", data.region)
  if (data.tipoMiembro != null && stepUrl > 1) params.set("step", String(stepUrl))
  const continueUrl = `/membresia${params.size ? `?${params}` : ""}`

  const steps = [
    { key: "stepMembership", done: data.paso >= 2 },
    { key: "stepRegistration", done: data.paso >= 3 },
    { key: "stepPayment", done: data.paso >= 4 },
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
