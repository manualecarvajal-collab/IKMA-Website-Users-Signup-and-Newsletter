"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import Icon from "@/components/Icon"

interface Newsletter {
  id: string
  titulo: string
  status?: string
  scheduled_at?: string | null
  destinatarios: number
  destinatarios_emails?: string[] | null
  failed_emails?: { email: string; status: number; body: string }[] | null
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-surface-container text-on-surface-variant",
  scheduled: "bg-primary-container text-on-primary-container",
  sending: "bg-tertiary-container text-on-tertiary-container",
  sent: "bg-secondary-container text-on-secondary-container",
  failed: "bg-error-container text-on-error-container",
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  sending: "Sending...",
  sent: "Sent",
  failed: "Failed",
}

export default function NewsletterList({ newsletters }: { newsletters: Newsletter[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Newsletter | null>(null)
  const [resending, setResending] = useState(false)
  const [resendResult, setResendResult] = useState<string | null>(null)

  const handleResendFailed = async () => {
    if (!selected?.failed_emails?.length) return
    setResending(true)
    setResendResult(null)
    try {
      const { resendNewsletterToEmails } = await import("@/lib/supabase/admin-actions")
      const emails = selected.failed_emails.map((f) => f.email)
      const result = await resendNewsletterToEmails(selected.id, emails)
      setResendResult(result.success || result.error || "Done")
      router.refresh()
    } catch {
      setResendResult("Failed to resend")
    } finally {
      setResending(false)
    }
  }

  const handleCancel = async (nl: Newsletter) => {
    if (!confirm("Cancel this scheduled newsletter?")) return
    const { cancelScheduledNewsletter } = await import("@/lib/supabase/admin-actions")
    await cancelScheduledNewsletter(nl.id)
    router.refresh()
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/30 text-left">
              <th className="font-label-bold text-label-bold text-on-surface-variant pb-3 pr-4">Title</th>
              <th className="font-label-bold text-label-bold text-on-surface-variant pb-3 px-4">Status</th>
              <th className="font-label-bold text-label-bold text-on-surface-variant pb-3 px-4">Recipients</th>
              <th className="font-label-bold text-label-bold text-on-surface-variant pb-3 px-4">Date</th>
              <th className="font-label-bold text-label-bold text-on-surface-variant pb-3 pl-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {newsletters.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center font-body-md text-body-md text-on-surface-variant">
                  No newsletters sent yet.
                </td>
              </tr>
            ) : (
              newsletters.map((nl) => (
                <tr key={nl.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                  <td className="font-body-md text-body-md text-on-surface py-4 pr-4 notranslate max-w-xs truncate">{nl.titulo}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-label-bold ${STATUS_STYLES[nl.status || "sent"] || STATUS_STYLES.sent}`}>
                      {nl.status === "scheduled" && <Icon name="schedule" size={12} />}
                      {STATUS_LABELS[nl.status || "sent"] || nl.status}
                    </span>
                    {nl.status === "scheduled" && nl.scheduled_at && (
                      <p className="text-xs text-on-surface-variant mt-1">
                        {new Date(nl.scheduled_at).toLocaleString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    )}
                  </td>
                  <td className="font-body-md text-body-md text-on-surface-variant py-4 px-4">{nl.destinatarios}</td>
                  <td className="font-body-md text-body-md text-on-surface-variant py-4 px-4">
                    {new Date(nl.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelected(nl)}
                        className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                        title="View recipients"
                      >
                        <Icon name="mail" size={18} />
                      </button>
                      {nl.status !== "sending" && (
                        <button
                          onClick={() => router.push(`/admin/newsletter/${nl.id}/editar`)}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Icon name="edit" size={18} />
                        </button>
                      )}
                      {nl.status === "scheduled" && (
                        <button
                          onClick={() => handleCancel(nl)}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors"
                          title="Cancel schedule"
                        >
                          <Icon name="cancel_schedule_send" size={18} />
                        </button>
                      )}
                      <form
                        action={`/api/newsletter/delete?id=${nl.id}`}
                        method="POST"
                        onSubmit={async (e) => {
                          e.preventDefault()
                          if (!confirm("Delete this newsletter record?")) return
                          const { deleteNewsletter } = await import("@/lib/supabase/admin-actions")
                          await deleteNewsletter(nl.id)
                          router.refresh()
                        }}
                      >
                        <button
                          type="submit"
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors"
                          title="Delete"
                        >
                          <Icon name="delete" size={18} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setSelected(null)}>
            <div
              className="bg-surface rounded-xl w-full max-w-md shadow-xl border border-outline-variant/20 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="min-w-0">
                  <h2 className="font-title-lg text-title-lg text-on-surface truncate">{selected.titulo}</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                    {selected.destinatarios_emails?.length ?? 0} email(s) received
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                  title="Close"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              {selected.destinatarios_emails?.length ? (
                <>
                  <div className="max-h-72 overflow-y-auto border border-outline-variant/20 rounded-lg divide-y divide-outline-variant/10">
                    {selected.destinatarios_emails.map((email) => (
                      <div key={email} className="px-4 py-2 font-body-md text-body-md text-on-surface break-all">
                        {email}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selected.destinatarios_emails!.join("\n"))
                    }}
                    className="mt-4 flex items-center gap-2 bg-primary text-on-primary font-label-bold text-label-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    <Icon name="content_copy" size={16} />
                    Copy all
                  </button>
                </>
              ) : (
                <p className="py-8 text-center font-body-md text-body-md text-on-surface-variant">
                  No recipient emails recorded for this send.
                </p>
              )}

              {selected.failed_emails && selected.failed_emails.length > 0 && (
                <div className="mt-4 p-3 bg-error-container/20 rounded-lg border border-error/20">
                  <p className="font-label-bold text-label-bold text-error mb-2">
                    {selected.failed_emails.length} email(s) failed:
                  </p>
                  <div className="max-h-32 overflow-y-auto text-sm text-on-surface-variant">
                    {selected.failed_emails.map((f) => (
                      <div key={f.email} className="break-all">
                        {f.email} - {f.status}
                      </div>
                    ))}
                  </div>
                  {resendResult ? (
                    <p className="mt-2 font-body-sm text-body-sm text-on-surface">{resendResult}</p>
                  ) : (
                    <button
                      onClick={handleResendFailed}
                      disabled={resending}
                      className="mt-3 flex items-center gap-2 bg-error text-on-error font-label-bold text-label-bold px-4 py-2 rounded-lg hover:bg-error/90 transition-all disabled:opacity-50"
                    >
                      <Icon name="refresh" size={16} />
                      {resending ? "Resending..." : "Resend to failed"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
