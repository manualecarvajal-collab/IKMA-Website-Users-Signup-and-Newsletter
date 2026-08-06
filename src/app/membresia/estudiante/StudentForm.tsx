"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { submitStudentMembership } from "@/lib/supabase/membresia-actions"

export default function StudentForm() {
  const t = useTranslations("StudentMembership")
  const locale = useLocale()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentYear = new Date().getFullYear()
  const entryYears = Array.from({ length: 50 }, (_, i) => currentYear - i)
  const gradYears = Array.from({ length: 12 }, (_, i) => currentYear - 9 + i)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await submitStudentMembership({
      region: (formData.get("region") as string) ?? "",
      pais: (formData.get("pais") as string) ?? "",
      universidad: (formData.get("universidad") as string) ?? "",
      carrera: (formData.get("carrera") as string) ?? "",
      anioIngreso: (formData.get("anioIngreso") as string) ?? "",
      anioEgreso: (formData.get("anioEgreso") as string) ?? "",
      telefono: (formData.get("telefono") as string) ?? "",
      language: locale === "es" ? "es" : "en",
    })

    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    window.location.href = "/membresia/estudiante/gracias"
  }

  return (
    <section className="py-section-padding">
      <div className="max-w-xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="bg-surface rounded-3xl border border-outline-variant/30 shadow-md overflow-hidden">
          <div className="p-6 md:p-10 border-b border-outline-variant/30 bg-gradient-to-r from-amber-50 to-primary-container/10">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">{t("title")}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">{t("subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="region">
                {t("region")} *
              </label>
              <select
                id="region"
                name="region"
                required
                defaultValue=""
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors appearance-none"
              >
                <option value="" disabled>{t("selectRegion")}</option>
                <option value="A">{t("regionAOpt")}</option>
                <option value="B">{t("regionBOpt")}</option>
              </select>
            </div>

            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="pais">
                {t("country")} *
              </label>
              <input
                id="pais"
                name="pais"
                type="text"
                required
                placeholder={t("countryPH")}
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
              />
            </div>

            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="universidad">
                {t("university")} *
              </label>
              <input
                id="universidad"
                name="universidad"
                type="text"
                required
                placeholder={t("universityPH")}
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
              />
            </div>

            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="carrera">
                {t("career")} *
              </label>
              <input
                id="carrera"
                name="carrera"
                type="text"
                required
                placeholder={t("careerPH")}
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="anioIngreso">
                  {t("startYear")} *
                </label>
                <select
                  id="anioIngreso"
                  name="anioIngreso"
                  required
                  defaultValue=""
                  className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none"
                >
                  <option value="" disabled>Select...</option>
                  {entryYears.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="anioEgreso">
                  {t("endYear")} *
                </label>
                <select
                  id="anioEgreso"
                  name="anioEgreso"
                  required
                  defaultValue=""
                  className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none"
                >
                  <option value="" disabled>Select...</option>
                  {gradYears.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="telefono">
                {t("phone")} *
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                required
                placeholder={t("phonePH")}
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
              />
            </div>

            {error && (
              <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-3.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? t("submitting") : t("submit")}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
