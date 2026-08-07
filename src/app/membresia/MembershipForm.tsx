"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import Icon from "@/components/Icon"
import { submitMembership } from "@/lib/supabase/membresia-actions"
import { countriesByRegion, pricingMatrix, professionSubgroups, memberTypeLabels, paymentOptions } from "./data"

type FormData = {
  memberType: number
  region: string
  country: string
  language: string
  gender: string
  address: string
  city: string
  postalCode: string
  firstName: string
  lastName: string
  professionSubgroup: string
  otherProfession: string
  username: string
  email: string
  phone: string
  website: string
  gradYear: string
  residencyYear: string
  rulesConsent: boolean
  newsletterConsent: boolean
  consentStatutory: boolean
  consentDataProcessing: boolean
  licenseFile: File | null
}

const initialForm: FormData = {
  memberType: 1,
  region: "",
  country: "",
  language: "en",
  gender: "",
  address: "",
  city: "",
  postalCode: "",
  firstName: "",
  lastName: "",
  professionSubgroup: "",
  otherProfession: "",
  username: "",
  email: "",

  phone: "",
  website: "",
  gradYear: "",
  residencyYear: "",
  rulesConsent: false,
  newsletterConsent: true,
  consentStatutory: false,
  consentDataProcessing: false,
  licenseFile: null,
}

export default function MembershipForm({
  initialEmail = "",
  initialFirstName = "",
  initialLastName = "",
  initialMemberType,
  initialRegion,
  isAuthenticated = true,
  initialStep = 1,
}: {
  initialEmail?: string
  initialFirstName?: string
  initialLastName?: string
  initialMemberType?: number
  initialRegion?: string
  isAuthenticated?: boolean
  initialStep?: number
}) {
  const t = useTranslations("Membership")
  const [step, setStep] = useState(initialStep)
  const [form, setForm] = useState<FormData>({
    ...initialForm,
    memberType: initialMemberType ?? 1,
    region: initialRegion ?? "",
    email: initialEmail,
    firstName: initialFirstName,
    lastName: initialLastName,
  })
  const [paymentMethod, setPaymentMethod] = useState<string | null>("card")
  const [paymentOption, setPaymentOption] = useState<number>(1)
  const [fileChosen, setFileChosen] = useState(false)
  const [formP2Error, setFormP2Error] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => { window.scrollTo(0, 0) }, [step])

  const price = pricingMatrix[form.region]?.[form.memberType] ?? 0
  const installmentAmount = paymentOption > 1 && price > 0 ? Math.round((price / paymentOption) * 100) / 100 : price

  const currentYear = new Date().getFullYear()

  const gradYears = Array.from({ length: currentYear - 1960 + 1 }, (_, i) => currentYear - i)
  const residencyYears = Array.from({ length: 11 }, (_, i) => currentYear + i)

  const set = (field: keyof FormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const goToStep = (target: number) => {
    if (target > 1 && !isAuthenticated) {
      window.location.href = `/registro?tipo=${form.memberType}&region=${form.region}`
      return
    }
    if (target === 2 && !form.rulesConsent) {
      setFormP2Error("Please read and accept the IKMA membership rules to continue.")
      return
    }
    if (target === 3) {
      if (!form.username) {
        setFormP2Error("Please enter a username.")
        return
      }
    }
    setFormP2Error(null)
    setStep(target)
  }

  const submitFormData = async () => {
    if (form.consentStatutory) {
      set("consentStatutory", form.consentStatutory)
    }

    let archivoLicenciaUrl: string | null = null
    if (form.licenseFile) {
      const { signedUrl, path } = await fetch("/api/upload-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.licenseFile.name, type: form.licenseFile.type }),
      }).then((r) => r.json())

      if (!signedUrl) throw new Error("Failed to get upload URL")

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: form.licenseFile,
        headers: { "Content-Type": form.licenseFile.type },
      })
      if (!uploadRes.ok) throw new Error("File upload failed")

      archivoLicenciaUrl = path
    }

    const result = await submitMembership({
      tipoMiembro: form.memberType,
      region: form.region,
      pais: form.country,
      language: form.language,
      genero: form.gender || null,
      direccion: form.address || null,
      ciudad: form.city || null,
      codigoPostal: form.postalCode || null,
      subgrupoProfesional: form.professionSubgroup || null,
      otraProfesion: form.otherProfession || null,
      username: form.username || null,
      telefono: form.phone || null,
      sitioWeb: form.website || null,
      anioGrado: form.gradYear ? parseInt(form.gradYear) : null,
      anioResidencia: form.residencyYear ? parseInt(form.residencyYear) : null,
      archivoLicenciaUrl,
    })

    if (result?.error) {
      throw new Error(result.error)
    }

    return result
  }

  const handlePay = async () => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      if (paymentMethod === "card" && price > 0) {
        const result = await submitFormData()
        const { url } = await fetch("/api/stripe/membership-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipoMiembro: form.memberType,
            region: form.region,
            solicitudId: result.id,
            paymentOption,
          }),
        }).then((r) => r.json())

        if (!url) throw new Error("Failed to create checkout session")

        window.location.href = url
      } else {
        await submitFormData()
        setStep(4)
      }
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong")
      setSubmitting(false)
    }
  }

  const handleFreeSubmit = async () => {
    // Student membership uses its own application form (manual review)
    window.location.href = "/membresia/estudiante"
  }

  const regionLabel = form.region === "A"
    ? t("regionAOpt")
    : form.region === "B"
    ? t("regionBOpt")
    : ""

  const professionLabel = memberTypeLabels[form.memberType]?.label ?? ""

  const renderStepper = () => (
    <div className="mb-8 bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm">
      <div className="grid grid-cols-4 gap-2 text-center text-xs md:text-sm font-semibold">
        {[t("stepperMembership"), t("stepperRegistration"), t("stepperPayment"), t("stepperConfirmation")].map((label, i) => {
          const active = step >= i + 1
          return (
            <div
              key={label}
              className={`flex flex-col items-center gap-2 pb-3 border-b-2 ${
                active ? "text-primary border-primary" : "text-on-surface-variant/50 border-outline-variant/30"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  active ? "bg-primary-container text-surface" : "bg-surface-container-high text-on-surface-variant/50"
                }`}
              >
                {i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.slice(0, 6)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderStep1 = () => (
    <section className="bg-white rounded-3xl border border-outline-variant/30 shadow-md overflow-hidden">
      <div className="p-6 md:p-10 border-b border-outline-variant/30 bg-gradient-to-r from-primary-container/20 to-primary-container/20">
        <span className="bg-primary-container text-surface text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{t("step1Badge")}</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mt-2">{t("step1Title")}</h2>
        <p className="text-on-surface-variant mt-2 text-sm md:text-base leading-relaxed">
          {t("step1Desc")}
          <a
            href={t("step1LinkUrl")}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {t("step1ClickHere")}
          </a>
          .
        </p>
      </div>

      <div className="p-6 md:p-10 space-y-8">
        <div>
          <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="star" size={20} className="text-primary" />
            {t("annualFees")}
          </h3>
          <p className="text-xs text-on-surface-variant mb-4">
            {t("feesDesc")}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30">
              <h4 className="font-bold text-on-surface text-sm uppercase tracking-wide flex items-center gap-2 text-secondary">
                <Icon name="location_on" size={16} /> {t("regionA")}
              </h4>
              <p className="text-xs text-on-surface-variant mt-1 mb-3">{t("regionADesc")}</p>
              <ul className="space-y-2 text-sm text-on-surface">
                <li className="flex justify-between border-b border-outline-variant/30 pb-1.5">
                  <span>{t("licHealthProf")}</span>
                  <span className="font-bold">$60 USD</span>
                </li>
                <li className="flex justify-between border-b border-outline-variant/30 pb-1.5">
                  <span>{t("resident")}</span>
                  <span className="font-bold">$50 USD</span>
                </li>
                <li className="flex justify-between border-b border-outline-variant/30 pb-1.5">
                  <span>{t("student")}</span>
                  <span className="font-bold text-amber-600 uppercase">Free</span>
                </li>
                <li className="flex justify-between">
                  <span>{t("nonMedical")}</span>
                  <span className="font-bold">$50 USD</span>
                </li>
              </ul>
            </div>

            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30">
              <h4 className="font-bold text-on-surface text-sm uppercase tracking-wide flex items-center gap-2 text-primary">
                <Icon name="public" size={16} /> {t("regionB")}
              </h4>
              <p className="text-xs text-on-surface-variant mt-1 mb-3">{t("regionBDesc")}</p>
              <ul className="space-y-2 text-sm text-on-surface">
                <li className="flex justify-between border-b border-outline-variant/30 pb-1.5">
                  <span>{t("licHealthProf")}</span>
                  <span className="font-bold">$150 USD</span>
                </li>
                <li className="flex justify-between border-b border-outline-variant/30 pb-1.5">
                  <span>{t("resident")}</span>
                  <span className="font-bold">$100 USD</span>
                </li>
                <li className="flex justify-between border-b border-outline-variant/30 pb-1.5">
                  <span>{t("student")}</span>
                  <span className="font-bold text-amber-600 uppercase">Free</span>
                </li>
                <li className="flex justify-between">
                  <span>{t("nonMedical")}</span>
                  <span className="font-bold">$100 USD</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/30" />

        <div>
          <h3 className="text-lg font-bold text-on-surface mb-4">{t("profProfile")}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {([3, 1, 2, 4] as const).map((type) => {
              const info = memberTypeLabels[type]
              const icons = { 1: "stethoscope", 2: "school", 3: "menu_book", 4: "work_history" } as const
              const active = form.memberType === type
              const isFree = type === 3
              return (
                <label
                  key={type}
                  className={`relative flex flex-col p-4 md:p-5 bg-white border-2 rounded-2xl cursor-pointer transition shadow-sm ${
                    isFree
                      ? active
                        ? "border-amber-400 bg-amber-50 shadow-md ring-2 ring-amber-200"
                        : "border-amber-300 bg-amber-50/50 hover:border-amber-400"
                      : active
                      ? "border-primary bg-primary-container/10"
                      : "border-outline-variant/30 hover:border-primary/50"
                  }`}
                >
                  {isFree && (
                    <span className="absolute -top-2.5 left-4 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Free
                    </span>
                  )}
                  <input
                    type="radio"
                    name="memberType"
                    value={type}
                    checked={active}
                    onChange={() => set("memberType", type)}
                    className="absolute right-4 top-4 text-primary h-4 w-4"
                  />
                  <div className="flex items-center gap-2 mb-2 mt-1">
                    <div className={`p-1.5 rounded-lg ${active ? "bg-primary-container text-surface-bright" : "bg-surface-container-high text-on-surface-variant"}`}>
                      <Icon name={icons[type]} size={18} />
                    </div>
                    <span className="font-bold text-on-surface text-xs md:text-sm leading-tight">{info.label}</span>
                  </div>
                  <span className="text-[11px] md:text-xs text-on-surface-variant leading-snug">{info.desc}</span>
                  {isFree && (
                    <span className="mt-2 text-[11px] md:text-xs font-bold text-amber-600">$0 — No payment required</span>
                  )}
                </label>
              )
            })}
          </div>
        </div>

        {form.memberType !== 3 && form.memberType !== 4 && (
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30">
            <label className="block text-sm font-semibold text-on-surface mb-2">
              {form.memberType === 2 ? t("gradYearResident") : t("gradYear")}
            </label>
            <div className="relative max-w-xs">
              <select
                value={form.gradYear}
                onChange={(e) => set("gradYear", e.target.value)}
                className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none"
              >
                <option value="">Select...</option>
                {gradYears.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-on-surface-variant">
                <Icon name="expand_more" size={14} />
              </div>
            </div>
          </div>
        )}

        {form.memberType === 3 && (
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 flex gap-4">
            <input
              type="checkbox"
              id="newsletter-consent"
              checked={form.newsletterConsent}
              onChange={(e) => set("newsletterConsent", e.target.checked)}
              className="mt-1 h-5 w-5 text-amber-600 border-outline-variant/50 rounded cursor-pointer shrink-0"
            />
            <div className="text-xs md:text-sm text-on-surface-variant space-y-2">
              <label htmlFor="newsletter-consent" className="font-semibold text-on-surface cursor-pointer">
                Stay connected with IKMA
              </label>
              <p className="text-on-surface-variant/70 text-xs leading-relaxed">
                I authorize IKMA to send me newsletters, updates, and additional content about our mission and activities to my email address. You can unsubscribe at any time.
              </p>
            </div>
          </div>
        )}

        <div className="bg-primary-container/20 p-5 rounded-2xl border border-primary-container flex gap-4">
          <input
            type="checkbox"
            id="rules-consent"
            checked={form.rulesConsent}
            onChange={(e) => set("rulesConsent", e.target.checked)}
            className="mt-1 h-5 w-5 text-primary border-outline-variant/50 rounded cursor-pointer shrink-0"
          />
          <div className="text-xs md:text-sm text-on-surface-variant space-y-2">
            <label htmlFor="rules-consent" className="font-semibold text-on-surface cursor-pointer">
              {t("acceptRules")}
            </label>
            <p className="text-on-surface-variant/70 text-xs leading-relaxed">
              {t("acceptRulesDesc")}
            </p>
            <a
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80 text-xs"
            >
              {t("termsOfUseLink")}
            </a>
            <div className="flex flex-col gap-1 pt-1">
              <a
                href="/Estatutos de Membresía- IKMA 2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80 text-xs"
              >
                📄 Estatutos de Membresía IKMA 2026
              </a>
              <a
                href="/Rules Applicable to IKMA Membership.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80 text-xs"
              >
                📄 Rules Applicable to IKMA Membership
              </a>
            </div>
          </div>
        </div>

        {formP2Error && (
          <div className="p-4 bg-error-container text-error rounded-xl text-sm font-semibold">
            {formP2Error}
          </div>
        )}

        <p className="text-on-surface-variant/60 text-xs leading-relaxed">
          {t("step1Disclaimer")}
        </p>
        <div className="flex justify-end pt-4">
          {form.memberType === 3 ? (
            <button
              onClick={handleFreeSubmit}
              className="bg-primary text-on-primary font-label-bold px-8 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2 group text-sm md:text-base"
            >
              Continue as Student{" "}
              <Icon name="arrow_forward" size={16} className="group-hover:translate-x-1 transition" />
            </button>
          ) : (
            <button
              onClick={() => goToStep(2)}
              className="bg-primary text-on-primary font-label-bold px-8 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2 group text-sm md:text-base"
            >
              {t("continueToForm")}{" "}
              <Icon name="arrow_forward" size={16} className="group-hover:translate-x-1 transition" />
            </button>
          )}
        </div>
      </div>
    </section>
  )

  const renderStep2 = () => (
    <section>
      <form
        onSubmit={(e) => { e.preventDefault(); goToStep(3) }}
        className="bg-white rounded-3xl border border-outline-variant/30 shadow-md overflow-hidden"
      >
        <div className="p-6 md:p-10 border-b border-outline-variant/30 bg-gradient-to-r from-primary-container/20 to-primary-container/20">
          <span className="bg-primary-container text-surface text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{t("step2Badge")}</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mt-2">{t("step2Title")}</h2>
          <p className="text-on-surface-variant mt-2 text-sm">{t("step2Desc")}</p>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("regionLabel")}</label>
              <div className="relative">
                <select
                  value={form.region}
                  onChange={(e) => { set("region", e.target.value); set("country", "") }}
                  required
                  className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none"
                >
                  <option value="" disabled>{t("selectRegion")}</option>
                  <option value="A">{t("regionAOpt")}</option>
                  <option value="B">{t("regionBOpt")}</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-on-surface-variant">
                  <Icon name="expand_more" size={14} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("countryLabel")}</label>
              <div className="relative">
                <select
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  required
                  className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none"
                >
                  <option value="" disabled>
                    {form.region ? t("selectCountry") : t("selectRegionFirst")}
                  </option>
                  {form.region &&
                    countriesByRegion[form.region].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-on-surface-variant">
                  <Icon name="expand_more" size={14} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("languageLabel")}</label>
              <div className="relative">
                <select
                  value={form.language}
                  onChange={(e) => set("language", e.target.value)}
                  className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-on-surface-variant">
                  <Icon name="expand_more" size={14} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("genderLabel")}</label>
              <div className="relative">
                <select
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                  required
                  className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none"
                >
                  <option value="" disabled>Select...</option>
                  <option value="M">{t("male")}</option>
                  <option value="F">{t("female")}</option>
                  <option value="O">{t("preferNot")}</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-on-surface-variant">
                  <Icon name="expand_more" size={14} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("addressLabel")}</label>
              <input
                type="text"
                placeholder="Street, Avenue, Building..."
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                required
                className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("cityLabel")}</label>
              <input
                type="text"
                placeholder="e.g. Madrid, Lima"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                required
                className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("postalLabel")}</label>
              <input
                type="text"
                placeholder="ZIP / Postal Code"
                value={form.postalCode}
                onChange={(e) => set("postalCode", e.target.value)}
                required
                className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("firstNameLabel")}</label>
              <div className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface-variant cursor-not-allowed notranslate">
                {form.firstName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("lastNameLabel")}</label>
              <div className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface-variant cursor-not-allowed notranslate">
                {form.lastName}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("profGroupLabel")}</label>
              <input
                type="text"
                value={professionLabel}
                readOnly
                className="w-full bg-surface-container-high border border-outline-variant/30 text-on-surface-variant rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("specialtyLabel")}</label>
              <input
                type="text"
                value={form.professionSubgroup}
                onChange={(e) => set("professionSubgroup", e.target.value)}
                required
                placeholder={professionSubgroups[form.memberType]?.[0] ? "e.g. " + professionSubgroups[form.memberType].filter(s => s !== "Other...").join(", ") : ""}
                className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
            {form.professionSubgroup === "Other..." && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-on-surface mb-2">{t("otherProfLabel")}</label>
                <input
                  type="text"
                  placeholder="e.g. Occupational Therapist, Software Engineer"
                  value={form.otherProfession}
                  onChange={(e) => set("otherProfession", e.target.value)}
                  className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("usernameLabel")}</label>
              <input
                type="text"
                placeholder="e.g. dr_perez"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                required
                className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("emailLabel")}</label>
              <div className="w-full bg-surface-container-high border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm text-on-surface-variant cursor-not-allowed">
                {form.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">{t("phoneLabel")}</label>
              <input
                type="tel"
                placeholder="+34 600 000 000 or +54 9..."
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">{t("websiteLabel")}</label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/user"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none"
            />
          </div>

          {form.memberType === 1 && (
            <div className="bg-secondary-container/20 p-6 rounded-2xl border border-secondary-container space-y-4">
              <div className="flex items-center gap-2 text-secondary font-bold">
                <Icon name="verified" size={20} />
                <h4>{t("verificationTitle")}</h4>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t("verificationDesc")}
              </p>
              {fileChosen && form.licenseFile ? (
                <div className="flex items-center justify-between gap-3 bg-white border border-secondary/40 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon name="description" size={20} className="text-secondary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-on-surface truncate">{form.licenseFile.name}</p>
                      <p className="text-[11px] text-on-surface-variant">{(form.licenseFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { set("licenseFile", null); setFileChosen(false) }}
                    className="flex items-center gap-1 text-xs font-semibold text-error hover:text-primary px-2 py-1.5 rounded-lg hover:bg-error-container/40 transition"
                  >
                    <Icon name="delete" size={14} />
                    {t("uploadRemove")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-secondary-container border-dashed rounded-xl cursor-pointer bg-white hover:bg-surface-container-low transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Icon name="cloud_upload" size={28} className="text-secondary mb-2" />
                      <p className="text-sm text-on-surface font-semibold">{t("uploadCredential")}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{t("uploadHint")}</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          set("licenseFile", e.target.files[0])
                          setFileChosen(true)
                        }
                      }}
                    />
                  </label>
                </div>
              )}
              {fileChosen && form.licenseFile && (
                <label className="flex items-center justify-center gap-1.5 text-xs text-primary font-semibold cursor-pointer hover:text-primary/80 transition w-fit">
                  {t("uploadReplace")}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        set("licenseFile", e.target.files[0])
                        setFileChosen(true)
                      }
                    }}
                  />
                </label>
              )}
            </div>
          )}

          {form.memberType === 2 && (
            <div className="bg-secondary-container/20 p-6 rounded-2xl border border-secondary-container">
              <label className="block text-sm font-semibold text-on-surface mb-2">
                {t("residencyYear")}
              </label>
              <div className="relative max-w-xs">
                <select
                  value={form.residencyYear}
                  onChange={(e) => set("residencyYear", e.target.value)}
                  className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none"
                >
                  <option value="">Select...</option>
                  {residencyYears.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-on-surface-variant">
                  <Icon name="expand_more" size={14} />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent-statutory"
                checked={form.consentStatutory}
                onChange={(e) => set("consentStatutory", e.target.checked)}
                className="mt-1 h-4 w-4 text-primary border-outline-variant/50 rounded shrink-0"
              />
              <label htmlFor="consent-statutory" className="text-xs text-on-surface-variant cursor-pointer">
                I understand and agree to receive official materials, emails, and legal and statutory
                invitations from IKMA. I also agree to receive additional useful information such as
                newsletters and notices of sponsored events.{" "}
                <span className="font-bold text-on-surface">
                  (In accordance with EU Data Protection Regulations, you must actively check this box).
                </span>
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent-data"
                checked={form.consentDataProcessing}
                onChange={(e) => set("consentDataProcessing", e.target.checked)}
                required
                className="mt-1 h-4 w-4 text-primary border-outline-variant/50 rounded shrink-0"
              />
              <label htmlFor="consent-data" className="text-xs text-on-surface-variant cursor-pointer">
                I agree that IKMA may process my data (Name, Surname, and Email) securely to manage
                the registration, renewal, and inactivation process of my membership benefits. *
              </label>
            </div>
          </div>

          {formP2Error && (
            <div className="p-4 bg-error-container text-error rounded-xl text-sm font-semibold flex items-center gap-2">
              <Icon name="info" size={16} />
              <span>{formP2Error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="w-full sm:w-auto bg-surface-container-high text-on-surface font-label-bold px-8 py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Icon name="arrow_back" size={16} /> Back to Membership
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-primary text-on-primary font-label-bold px-8 py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm md:text-base"
            >
              Next Step <Icon name="arrow_forward" size={16} />
            </button>
          </div>
        </div>
      </form>
    </section>
  )

  const renderStep3 = () => (
    <section>
      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-md overflow-hidden">
        <div className="p-6 md:p-10 border-b border-outline-variant/30 bg-gradient-to-r from-primary-container/20 to-primary-container/20">
          <span className="bg-primary-container text-surface text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Step 3 of 4</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mt-2">Secure Payment Gateway</h2>
          <p className="text-on-surface-variant mt-2 text-sm">
            Your fee has been calculated based on your selected location and category.
          </p>
        </div>

        <div className="p-6 md:p-10 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 space-y-4">
              <h3 className="text-sm font-extrabold text-on-surface uppercase tracking-wider">Membership Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Applicant:</span>
                  <span className="font-bold text-on-surface notranslate">{form.firstName} {form.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Tax Region:</span>
                  <span className="font-bold text-on-surface">{regionLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Category:</span>
                  <span className="font-bold text-on-surface">{professionLabel}</span>
                </div>
                <hr className="border-outline-variant/30" />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-on-surface">Annual Total:</span>
                  <span className="font-extrabold text-primary text-2xl">${price} USD</span>
                </div>
                {paymentOption > 1 && (
                  <div className="text-xs text-on-surface-variant bg-surface-container-high p-2 rounded-lg text-center">
                    {paymentOption === 2 ? "2 payments of " : "3 payments of "} <strong>${installmentAmount} USD</strong> every {paymentOption === 2 ? "6" : "4"} months
                  </div>
                )}
              </div>
            </div>
            {price > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Payment schedule</h4>
                <div className="grid gap-2">
                  {paymentOptions.map((opt) => {
                    const amount = opt.value > 1 ? Math.round((price / opt.value) * 100) / 100 : price
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                          paymentOption === opt.value
                            ? "border-primary bg-primary-container/20"
                            : "border-outline-variant/30 hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentOption"
                          value={opt.value}
                          checked={paymentOption === opt.value}
                          onChange={() => setPaymentOption(opt.value)}
                          className="text-primary h-4 w-4"
                        />
                        <div className="flex-1 text-sm">
                          <span className="font-bold text-on-surface">{opt.label}</span>
                          <span className="text-on-surface-variant ml-1">
                            {opt.value === 1 ? `$${price} USD` : `$${amount} USD ${opt.desc.toLowerCase()}`}
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-base font-bold text-on-surface">Select your preferred payment method</h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "card", label: "Card", icon: "star" },
                { id: "paypal", label: "PayPal", icon: "send" },
                { id: "zelle", label: "Zelle", icon: "business" },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-xs md:text-sm flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === method.id
                      ? "border-primary text-primary bg-primary-container/20"
                      : "border-outline-variant/50 text-on-surface-variant bg-white"
                  }`}
                >
                  <Icon name={method.icon} size={24} />
                  <span>{method.label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === "card" && (
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 text-center space-y-3">
                <Icon name="lock" size={28} className="text-primary mx-auto" />
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  You will be redirected to our secure payment page to complete the transaction via Stripe.
                  Your card details are processed directly by Stripe — we never see or store them.
                </p>
              </div>
            )}

            {paymentMethod === "paypal" && (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-4">
                <Icon name="send" size={36} className="text-amber-500" />
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Click the button below to be redirected to PayPal. Once the transaction is
                  complete, you will return here to finalize your registration.
                </p>
                <button
                  type="button"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition inline-flex items-center gap-2"
                >
                  <Icon name="arrow_forward" size={14} /> Open PayPal Portal
                </button>
              </div>
            )}

            {paymentMethod === "zelle" && (
              <div className="p-6 bg-purple-50 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-purple-800 font-bold">
                  <Icon name="business" size={20} />
                  <h4>Zelle Transfer Instructions</h4>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Make your transfer using the following official IKMA details:
                </p>
                <div className="bg-white p-3.5 rounded-xl border border-purple-100 text-xs font-mono space-y-1.5 text-on-surface">
                  <div><strong>Recipient Email:</strong> finance@ikma-association.org</div>
                  <div><strong>Account Name:</strong> IKMA International</div>
                  <div>
                    <strong>Reference / Memo:</strong>{" "}
                    <span className="font-bold text-secondary">[Your first and last name]</span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Once you have made the transfer, save your payment receipt and report it by
                  replying to the registration email.
                </p>
              </div>
            )}

            {submitError && (
              <div className="bg-error-container/20 text-error text-sm p-3 rounded-xl border border-error/30">
                {submitError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => goToStep(2)}
                disabled={submitting}
                className="w-full sm:w-auto bg-surface-container-high text-on-surface font-label-bold px-8 py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50"
              >
                <Icon name="arrow_back" size={16} /> Back to Details
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={submitting}
                className="w-full sm:w-auto bg-primary text-on-primary font-label-bold px-8 py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50"
              >
                {submitting ? (
                  <>Submitting…</>
                ) : (
                  <><Icon name="verified" size={16} /> Submit Registration</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  const renderStep4 = () => (
    <section>
      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-md p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6">
        <div className="mx-auto w-20 h-20 bg-primary-container rounded-full flex items-center justify-center text-surface border border-primary/30 shadow-sm">
          <Icon name="verified" size={40} />
        </div>
        <div className="space-y-2">
          <span className="bg-primary-container text-surface text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Registration Complete
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mt-2">
            Welcome to the IKMA Family!
          </h2>
          <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
            Thank you very much for completing your membership registration with the{" "}
            <span className="font-semibold text-on-surface">
              International Kingdom Medical Association
            </span>
            .
          </p>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 text-left text-sm text-on-surface-variant space-y-3">
          <div className="flex items-start gap-3">
            <Icon name="verified" size={20} className="text-primary mt-0.5 shrink-0" />
            <p>We have received all your documentation and profile data for review.</p>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="info" size={20} className="text-primary mt-0.5 shrink-0" />
            <p>
              Your account is in the approval process by our committee. You will receive your
              confirmation and full access within a maximum of{" "}
              <strong className="text-on-surface">12 hours</strong>.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="mail" size={20} className="text-primary mt-0.5 shrink-0" />
            <p>
              We have sent a confirmation email with your initial access credentials and your
              formal membership receipt.
            </p>
          </div>
        </div>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex bg-primary text-on-primary font-label-bold px-8 py-3.5 rounded-xl shadow-lg transition items-center gap-2 text-sm md:text-base"
          >
            <Icon name="home" size={16} /> Back to Homepage
          </Link>
        </div>
      </div>
    </section>
  )

  return (
    <main className="flex-grow max-w-5xl w-full mx-auto px-margin-mobile md:px-margin-desktop py-8">
      {renderStepper()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </main>
  )
}
