"use client"

import { useRouter } from "next/navigation"
import Icon from "@/components/Icon"

interface Newsletter {
  id: string
  titulo: string
  destinatarios: number
  created_at: string
}

export default function NewsletterList({ newsletters }: { newsletters: Newsletter[] }) {
  const router = useRouter()

  return (
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
                <td className="font-body-md text-body-md text-on-surface py-4 pr-4">{nl.titulo}</td>
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
  )
}
