"use client"

import { useActionState, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { sendNewsletter } from "@/lib/supabase/admin-actions"
import { buildNewsletterHtml } from "@/lib/email-template"
import TiptapEditor from "@/components/TiptapEditor"
import Icon from "@/components/Icon"
import RecipientsConfirmModal, { type Subscriber } from "@/components/RecipientsConfirmModal"

export default function NuevaNewsletterForm({ subscribers }: { subscribers: Subscriber[] }) {
  const t = useTranslations("Admin")
  const router = useRouter()
  const [state, action, pending] = useActionState(sendNewsletter, undefined)
  const [titulo, setTitulo] = useState("")
  const [contenido, setContenido] = useState("")
  const [imagenUrl, setImagenUrl] = useState("")
  const [previewHtml, setPreviewHtml] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Build preview HTML whenever content changes
  useEffect(() => {
    setPreviewHtml(
      buildNewsletterHtml({
        nombre: "Subscriber",
        titulo: titulo || "Your Newsletter Title",
        contenido_html: contenido || "<p>Your newsletter content will appear here...</p>",
        imagen_url: imagenUrl || null,
        from_name: "IKMA",
      })
    )
  }, [titulo, contenido, imagenUrl])

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
    setImagenUrl(publicUrl)
    return publicUrl
  }

  if (state?.success) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto text-center py-24">
        <Icon name="check_circle" size={60} className="text-primary mb-4" />
        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">{t("newsletterSent")}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">{state.success}</p>
        <button
          onClick={() => router.push("/admin/newsletter")}
          className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
        >
          {t("backToNewsletter")}
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline-lg text-headline-lg text-primary">{t("newNewsletter")}</h1>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 border border-outline-variant text-on-surface font-label-bold text-label-bold px-4 py-2 rounded-lg hover:bg-surface-container transition-all cursor-pointer"
        >
          <Icon name={showPreview ? "edit" : "visibility"} size={18} />
          {showPreview ? t("edit") : t("preview")}
        </button>
      </div>

      {showPreview ? (
        <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden">
          <div className="p-4 bg-surface-container-low border-b border-outline-variant/20">
            <span className="font-label-bold text-label-bold text-on-surface-variant">{t("emailPreview")}</span>
          </div>
          <iframe
            srcDoc={previewHtml}
            className="w-full h-[600px] md:h-[800px]"
            title="Email preview"
          />
        </div>
      ) : (
        <form ref={formRef} action={action} className="space-y-6">
          <div className="bg-surface rounded-xl p-6 border border-outline-variant/20 space-y-6">
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="titulo">
                {t("newsletterTitle")}
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                id="titulo"
                name="titulo"
                type="text"
                placeholder="Newsletter title"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2">
                {t("bannerImage")}
              </label>
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = "image/*"
                  input.onchange = async () => {
                    const file = input.files?.[0]
                    if (!file) return
                    const url = await handleImageUpload(file)
                    setImagenUrl(url)
                  }
                  input.click()
                }}
                className="flex items-center gap-2 border border-outline-variant text-on-surface-variant font-body-md text-body-md px-4 py-2.5 rounded-lg hover:bg-surface-container transition-all cursor-pointer"
              >
                <Icon name="add_photo_alternate" size={18} />
                {imagenUrl ? t("changeImage") : t("addImage")}
              </button>
              {imagenUrl && (
                <div className="mt-3 relative inline-block">
                  <img src={imagenUrl} alt="Banner preview" className="h-32 rounded-lg border border-outline-variant/20" />
                  <button
                    type="button"
                    onClick={() => setImagenUrl("")}
                    className="absolute -top-2 -right-2 bg-error text-on-error rounded-full p-0.5 cursor-pointer"
                  >
                    <Icon name="close" size={14} />
                  </button>
                  <input type="hidden" name="imagen_url" value={imagenUrl} />
                </div>
              )}
            </div>

            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2">
                {t("content")}
              </label>
              <TiptapEditor
                content={contenido}
                onChange={setContenido}
                onImageUpload={handleImageUpload}
              />
              <input type="hidden" name="contenido_html" value={contenido} />
            </div>
          </div>

          {state?.error && (
            <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3">{state.error}</p>
          )}

          <button
            type="button"
            disabled={pending}
            onClick={() => setShowConfirm(true)}
            className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-3.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {t("sendToSubscribers")}
          </button>
        </form>
      )}

      {showConfirm && (
        <RecipientsConfirmModal
          subscribers={subscribers}
          pending={pending}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false)
            formRef.current?.requestSubmit()
          }}
        />
      )}
    </div>
  )
}