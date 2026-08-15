"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import Icon from "@/components/Icon"

interface Newsletter {
  id: string
  titulo: string
  destinatarios: number
  destinatarios_emails?: string[] | null
  created_at: string
}

export default function NewsletterList({ newsletters }: { newsletters: Newsletter[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Newsletter | null>(null)

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/30 text-left">
              <th className="font-label-bold text-label-bold text-on-surface-variant pb-3 pr-4">Title</th>
              <th className="font-label-bold text-label-bold text-on-surface-variant pb-3 px-4">Recipients</th>
              <th className="font-label-bold text-label-bold text-on-surface-variant pb-3 px-4">Sent</th>
              <th className="font-label-bold text-label-bold text-on-surface-variant pb-3 pl-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {newsletters.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center font-body-md text-body-md text-on-surface-variant">
                  No newsletters sent yet.
                </td>
              </tr>
            ) : (
              newsletters.map((nl) => (
                <tr key={nl.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                  <td className="font-body-md text-body-md text-on-surface py-4 pr-4 notranslate">{nl.titulo}</td>
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
                      <button
                        onClick={() => router.push(`/admin/newsletter/${nl.id}/editar`)}
                        className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                        title="Edit & re-send"
                      >
                        <Icon name="edit" size={18} />
                      </button>
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
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
