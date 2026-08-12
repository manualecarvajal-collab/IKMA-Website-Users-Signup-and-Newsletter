"use client"

import { useActionState, useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { sendMemberMessage } from "@/lib/supabase/email-actions"
import { buildMembershipMessageHtml } from "@/lib/email-template"
import TiptapEditor from "@/components/TiptapEditor"
import Icon from "@/components/Icon"

export default function MemberEmailForm({
  solicitudId,
  nombre,
  lang,
  onSent,
  onCancel,
}: {
  solicitudId: string
  nombre: string
  lang: "en" | "es"
  onSent?: () => void
  onCancel?: () => void
}) {
  const t = useTranslations("Admin")
  const [state, action, pending] = useActionState(sendMemberMessage.bind(null, solicitudId), undefined)
  const [subject, setSubject] = useState("")
  const [contenido, setContenido] = useState("")
  const [previewHtml, setPreviewHtml] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    setPreviewHtml(
      buildMembershipMessageHtml({
        nombre,
        lang,
        contenido_html: contenido || "<p>Your message will appear here...</p>",
      })
    )
  }, [nombre, lang, contenido])

  const handleImageUpload = async (file: File): Promise<string> => {
    const resp = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, type: file.type }),
    })
    const { signedUrl, publicUrl } = await resp.json()
    if (signedUrl) {
      await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
    }
    return publicUrl
  }

  if (state?.success) {
    return (
      <div className="text-center py-24">
        <Icon name="check_circle" size={60} className="text-primary mb-4" />
        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">{t("memberEmailSent")}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">{state.success}</p>
        <button
          onClick={() => onSent?.()}
          className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
        >
          {t("memberEmailBackToHistory")}
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onCancel?.()}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Icon name="arrow_back" size={16} /> {t("memberEmailBackToHistory")}
        </button>
      </div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-headline-lg text-headline-lg text-primary">{t("memberEmailCompose")}</h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 border border-outline-variant text-on-surface font-label-bold text-label-bold px-4 py-2 rounded-lg hover:bg-surface-container transition-all cursor-pointer"
        >
          <Icon name={showPreview ? "edit" : "visibility"} size={18} />
          {showPreview ? t("memberEmailEdit") : t("memberEmailPreview")}
        </button>
      </div>

      {showPreview ? (
        <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden">
          <div className="p-4 bg-surface-container-low border-b border-outline-variant/20">
            <span className="font-label-bold text-label-bold text-on-surface-variant">{t("memberEmailPreviewLabel")}</span>
          </div>
          <iframe srcDoc={previewHtml} className="w-full h-[600px] md:h-[800px]" title="Email preview" />
        </div>
      ) : (
        <form action={action} className="space-y-6">
          <div className="bg-surface rounded-xl p-6 border border-outline-variant/20 space-y-6">
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="subject">
                {t("memberEmailSubject")}
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                id="subject"
                name="subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2">
                {t("memberEmailMessage")}
              </label>
              <TiptapEditor content={contenido} onChange={setContenido} onImageUpload={handleImageUpload} />
              <input type="hidden" name="contenido_html" value={contenido} />
            </div>
          </div>

          {state?.error && (
            <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending || !contenido.trim()}
            className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-3.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {pending ? t("memberEmailSending") : t("memberEmailSend")}
          </button>
        </form>
      )}
    </div>
  )
}
