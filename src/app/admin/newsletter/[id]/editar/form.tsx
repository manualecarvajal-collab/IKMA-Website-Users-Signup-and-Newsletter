"use client"

import { useActionState, useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { sendNewsletter, saveNewsletterDraft } from "@/lib/supabase/admin-actions"
import { buildNewsletterHtml } from "@/lib/email-template"
import TiptapEditor from "@/components/TiptapEditor"
import Icon from "@/components/Icon"
import RecipientsConfirmModal from "@/components/RecipientsConfirmModal"
import { AUDIENCE_OPTIONS, filterByAudiences, type Audience, type Recipient } from "@/lib/newsletter-audiences"

export default function EditNewsletterForm({
  id,
  titulo: initialTitulo,
  contenido_html: initialContenido,
  imagen_url: initialImagen,
  subscribers,
}: {
  id: string
  titulo: string
  contenido_html: string
  imagen_url: string
  subscribers: Recipient[]
}) {
  const t = useTranslations("Admin")
  const router = useRouter()
  const [state, action, pending] = useActionState(sendNewsletter, undefined)
  const [draftState, draftAction, draftPending] = useActionState(saveNewsletterDraft, undefined)
  const [titulo, setTitulo] = useState(initialTitulo)
  const [contenido, setContenido] = useState(initialContenido)
  const [imagenUrl, setImagenUrl] = useState(initialImagen)
  const [previewHtml, setPreviewHtml] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [audiencias, setAudiencias] = useState<Audience[]>(["registrados"])
  const [scheduledAt, setScheduledAt] = useState("")
  const formRef = useRef<HTMLFormElement>(null)
  const draftFormRef = useRef<HTMLFormElement>(null)

  const filteredRecipients = useMemo(
    () => filterByAudiences(subscribers, audiencias),
    [subscribers, audiencias]
  )

  const toggleAudiencia = (a: Audience) => {
    setAudiencias((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
  }

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

  const isSuccess = state?.success || draftState?.success
  const errorMsg = state?.error || draftState?.error

  if (isSuccess) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto text-center py-24">
        <Icon name="check_circle" size={60} className="text-primary mb-4" />
        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Newsletter Sent!</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">{isSuccess}</p>
        <button
          onClick={() => router.push("/admin/newsletter")}
          className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
        >
          Back to Newsletter
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Edit & Re-send</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Modify and send this newsletter again to your subscribers.
          </p>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 border border-outline-variant text-on-surface font-label-bold text-label-bold px-4 py-2 rounded-lg hover:bg-surface-container transition-all cursor-pointer"
        >
          <Icon name={showPreview ? "edit" : "visibility"} size={18} />
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {showPreview ? (
        <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden">
          <div className="p-4 bg-surface-container-low border-b border-outline-variant/20">
            <span className="font-label-bold text-label-bold text-on-surface-variant">Email Preview</span>
          </div>
          <iframe
            srcDoc={previewHtml}
            className="w-full h-[600px] md:h-[800px]"
            title="Email preview"
          />
        </div>
      ) : (
        <>
          {/* Send / Schedule form */}
          <form ref={formRef} action={action} className="space-y-6">
            <input type="hidden" name="newsletter_id" value={id} />
            <input type="hidden" name="titulo" value={titulo} />
            <input type="hidden" name="contenido_html" value={contenido} />
            <input type="hidden" name="imagen_url" value={imagenUrl} />
            <input type="hidden" name="audiencias" value={audiencias.join(",")} />
            <input type="hidden" name="scheduled_at" value={scheduledAt} />

            <div className="bg-surface rounded-xl p-6 border border-outline-variant/20 space-y-6">
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="titulo">
                  Title
                </label>
                <input
                  className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                  id="titulo"
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-2">
                  Banner Image (optional)
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
                  {imagenUrl ? "Change Image" : "Add Image"}
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
                  </div>
                )}
              </div>

              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-2">
                  Content
                </label>
                <TiptapEditor
                  content={contenido}
                  onChange={setContenido}
                  onImageUpload={handleImageUpload}
                />
              </div>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-outline-variant/20 space-y-4">
              <div>
                <span className="block font-label-bold text-label-bold text-on-surface mb-3">
                  {t("audienciaTitle")}
                </span>
                <div className="flex flex-wrap gap-3">
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest cursor-pointer hover:border-primary/40 transition-colors select-none"
                    >
                      <input
                        type="checkbox"
                        checked={audiencias.includes(opt.value)}
                        onChange={() => toggleAudiencia(opt.value)}
                        className="accent-primary h-4 w-4 cursor-pointer"
                      />
                      <span className="font-body-md text-body-md text-on-surface">{t(opt.labelKey)}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 font-body-md text-body-md text-on-surface-variant">
                  {t("audienciaCount", { count: filteredRecipients.length })}
                </p>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-outline-variant/20">
              <label className="block font-label-bold text-label-bold text-on-surface mb-2">
                Schedule (optional)
              </label>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
                Leave empty to send immediately. Pick a date/time to schedule.
              </p>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
              />
            </div>

            {errorMsg && (
              <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3">{errorMsg}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                disabled={pending || draftPending || filteredRecipients.length === 0}
                onClick={() => setShowConfirm(true)}
                className="flex-1 bg-primary text-on-primary font-label-bold text-label-bold py-3.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
              >
                {pending ? "Sending..." : scheduledAt ? "Schedule" : "Send to Subscribers"}
              </button>
            </div>
          </form>

          {/* Save Draft form */}
          <form ref={draftFormRef} action={draftAction} className="mt-3">
            <input type="hidden" name="titulo" value={titulo} />
            <input type="hidden" name="contenido_html" value={contenido} />
            <input type="hidden" name="imagen_url" value={imagenUrl} />
            <input type="hidden" name="audiencias" value={audiencias.join(",")} />
            <button
              type="submit"
              disabled={draftPending || pending || !titulo || !contenido}
              className="w-full px-6 py-3.5 rounded-lg border border-outline-variant font-label-bold text-label-bold text-on-surface hover:bg-surface-container transition-all disabled:opacity-50 cursor-pointer"
            >
              {draftPending ? "Saving..." : "Save as Draft"}
            </button>
          </form>
        </>
      )}

      {showConfirm && (
        <RecipientsConfirmModal
          subscribers={filteredRecipients}
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
