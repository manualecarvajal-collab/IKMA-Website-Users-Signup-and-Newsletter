"use client"

import { useState, FormEvent } from "react"
import { useTranslations } from "next-intl"
import Icon from "@/components/Icon"

export default function ContactSection() {
  const t = useTranslations("Contact")
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    setError("")
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: fd.get("firstName"),
          lastName: fd.get("lastName"),
          email: fd.get("email"),
          inquiryType: fd.get("inquiryType"),
          message: fd.get("message"),
        }),
      })
      if (!res.ok) throw new Error("Failed")
      setDone(true)
    } catch {
      setError(t("errorMessage"))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <section className="bg-surface-container-low py-24">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h2 className="font-headline-xl text-headline-lg text-primary mb-6">
            {t("getInTouch")}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
             {t("formInquiry1")}</p>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
             {t("formInquiry2")}</p>
        </div>
      </section>

      <section className="pb-12 md:pb-section-padding">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-2xl mx-auto bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)]">
            <h3 className="font-headline-md text-headline-md text-primary mb-8">
              {t("sendMessage")}
            </h3>
              {done ? (
                <div className="space-y-6 text-center py-8">
                  <Icon name="check_circle" size={48} className="text-primary mx-auto" />
                  <p className="font-headline-md text-headline-md text-primary">{t("messageSent")}</p>
                  <p className="text-on-surface-variant">{t("replyNotice")}</p>
                </div>
              ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block font-label-bold text-label-bold text-on-surface mb-2"
                      htmlFor="contact-first-name"
                    >
                      {t("firstName")}
                    </label>
                    <input
                      className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                      id="contact-first-name"
                      name="firstName"
                      placeholder="Jane"
                      type="text"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block font-label-bold text-label-bold text-on-surface mb-2"
                      htmlFor="contact-last-name"
                    >
                      {t("lastName")}
                    </label>
                    <input
                      className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                      id="contact-last-name"
                      name="lastName"
                      placeholder="Doe"
                      type="text"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block font-label-bold text-label-bold text-on-surface mb-2"
                    htmlFor="contact-email"
                  >
                    {t("emailAddress")}
                  </label>
                  <input
                    className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                    id="contact-email"
                    name="email"
                    placeholder="ana@ejemplo.com"
                      type="email"
                      required
                  />
                </div>
                <div>
                  <label
                    className="block font-label-bold text-label-bold text-on-surface mb-2"
                    htmlFor="contact-inquiry-type"
                  >
                    {t("inquiryType")}
                  </label>
                  <select
                    className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                    id="contact-inquiry-type"
                    name="inquiryType"
                  >
                    <option value="General Question">{t("generalQuestion")}</option>
                    <option value="Medical Funding">{t("medicalFunding")}</option>
                    <option value="Membership Question">{t("membershipQuestion")}</option>
                    <option value="Prayer Request">{t("prayerRequest")}</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block font-label-bold text-label-bold text-on-surface mb-2"
                    htmlFor="contact-message"
                  >
                    {t("yourMessage")}
                  </label>
                  <textarea
                    className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                    id="contact-message"
                    name="message"
                    placeholder={t("placeholderMessage")}
                    rows={5}
                    required
                  />
                </div>
                {error && (
                  <p className="text-red-500 font-label-bold text-label-sm text-center">{error}</p>
                )}
                <button
                  className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-4 rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                  type="submit"
                  disabled={sending}
                >
                  <span>{sending ? t("sending") : t("sendMessageBtn")}</span>
                  <Icon name="send" />
                </button>
              </form>
              )}
            </div>
          </div>
      </section>

      <section className="bg-primary text-on-primary py-16">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <div className="flex justify-center">
            <Icon name="volunteer_activism" size={48} className="mb-4 text-primary-fixed" />
          </div>
          <h3 className="font-headline-lg text-headline-lg mb-4">
            {t("needPrayer")}
          </h3>
          <p className="font-body-lg text-body-lg max-w-2xl mx-auto mb-8 text-primary-fixed-dim">
            {t("prayerDescription")}
          </p>
        </div>
      </section>
    </>
  )
}
