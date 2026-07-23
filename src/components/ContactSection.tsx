"use client"

import { useState, FormEvent } from "react"
import { useLanguage } from "@/lib/useLanguage"
import Icon from "@/components/Icon"

export default function ContactSection() {
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
      setError("Algo salió mal. Inténtalo de nuevo.")
    } finally {
      setSending(false)
    }
  }
  const lang = useLanguage()
  const t = (en: string, es: string) => lang === "es" ? es : en
  return (
    <>
      <section className="bg-surface-container-low py-24">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h2 className="font-headline-xl text-headline-lg text-primary mb-6">
            {t("Get in Touch", "Contáctanos")}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
             {t("For any inquiries please fill the form below", "Para cualquier consulta, completa el formulario a continuación")}</p>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
             {t("and we\u2019ll get back to you within 24 hours.", "y te responderemos dentro de 24 horas.")}</p>
        </div>
      </section>

      <section className="pb-12 md:pb-section-padding">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-2xl mx-auto bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)]">
            <h3 className="font-headline-md text-headline-md text-primary mb-8">
              {t("Send a Message", "Enviar mensaje")}
            </h3>
              {done ? (
                <div className="space-y-6 text-center py-8">
                  <Icon name="check_circle" size={48} className="text-primary mx-auto" />
                  <p className="font-headline-md text-headline-md text-primary">{t("Message Sent!", "¡Mensaje enviado!")}</p>
                  <p className="text-on-surface-variant">{t("We'll get back to you within 24 hours.", "Te responderemos dentro de 24 horas.")}</p>
                </div>
              ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block font-label-bold text-label-bold text-on-surface mb-2"
                      htmlFor="contact-first-name"
                    >
                      {t("First Name", "Nombre")}
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
                      {t("Last Name", "Apellido")}
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
                    {t("Email Address", "Correo electrónico")}
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
                    {t("Type of Inquiry", "Tipo de consulta")}
                  </label>
                  <select
                    className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                    id="contact-inquiry-type"
                    name="inquiryType"
                  >
                    <option value="General Question">{t("General Question", "Consulta general")}</option>
                    <option value="Medical Funding">{t("Medical Funding", "Donaciones / Ofrendas")}</option>
                    <option value="Membership Question">{t("Membership Question", "Consulta sobre membresía")}</option>
                    <option value="Prayer Request">{t("Prayer Request", "Solicitud de oración")}</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block font-label-bold text-label-bold text-on-surface mb-2"
                    htmlFor="contact-message"
                  >
                    {t("Your Message", "Tu mensaje")}
                  </label>
                  <textarea
                    className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                    id="contact-message"
                    name="message"
                    placeholder={t("How can we assist you today?", "¿En qué podemos ayudarte?")}
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
                  <span>{sending ? t("Sending...", "Enviando...") : t("Send Message", "Enviar mensaje")}</span>
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
            {t("Need Prayer?", "¿Necesitas oración?")}
          </h3>
          <p className="font-body-lg text-body-lg max-w-2xl mx-auto mb-8 text-primary-fixed-dim">
            {t(
              "Healing encompasses both body and spirit. If you or a loved one are facing difficult times, our dedicated team would be honored to pray for you. Please select 'Prayer Request' in the form above.",
              "La sanidad abarca tanto el cuerpo como el espíritu. Si tú o un ser querido están enfrentando tiempos difíciles, nuestro equipo dedicado se honraría en orar por ustedes. Por favor, selecciona 'Solicitud de oración' en el formulario anterior."
            )}
          </p>
        </div>
      </section>
    </>
  )
}
