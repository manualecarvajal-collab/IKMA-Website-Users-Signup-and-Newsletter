"use client"

import { useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { showToast } from "./Toast"
import { sendMagazineToSubscribers } from "@/lib/supabase/admin-actions"
import Icon from "@/components/Icon"

interface Subscriber {
  id: string
  nombre: string
  email: string
}

export default function MagazineSendModal({
  revistaId,
  revistaTitulo,
  subscribers,
  onClose,
}: {
  revistaId: string
  revistaTitulo: string
  subscribers: Subscriber[]
  onClose: () => void
}) {
  const [search, setSearch] = useState("")
  const [excludedEmails, setExcludedEmails] = useState<string[]>([])
  const [sending, setSending] = useState(false)

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      const matchesSearch = 
        s.nombre.toLowerCase().includes(search.toLowerCase()) || 
        s.email.toLowerCase().includes(search.toLowerCase())
      const isNotExcluded = !excludedEmails.includes(s.email)
      return matchesSearch && isNotExcluded
    })
  }, [subscribers, search, excludedEmails])

  const handleExclude = (email: string) => {
    setExcludedEmails((prev) => [...prev, email])
  }

  const handleSend = async () => {
    const finalRecipients = subscribers
      .map(s => s.email)
      .filter(email => !excludedEmails.includes(email))

    if (finalRecipients.length === 0) {
      showToast("No recipients selected", "error")
      return
    }

    if (!confirm(`Are you sure you want to send "${revistaTitulo}" to ${finalRecipients.length} subscribers?`)) {
      return
    }

    setSending(true)
    try {
      const result = await sendMagazineToSubscribers(revistaId, excludedEmails)
      if (result.success) {
        showToast(result.success, "success")
        onClose()
      } else if (result.error) {
        showToast(result.error, "error")
      }
    } catch (err) {
      showToast("Failed to send magazine", "error")
    } finally {
      setSending(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-outline-variant/20">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Send Magazine</h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
              Select recipients for <span className="font-bold">"{revistaTitulo}"</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface-variant/20 rounded-full transition-colors"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-surface-container-lowest">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl pl-10 pr-4 py-3 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSubscribers.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant font-body-md">
              No subscribers found matching your criteria.
            </div>
          ) : (
            filteredSubscribers.map((s) => (
              <div 
                key={s.id} 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors group"
              >
                <div className="min-w-0">
                  <p className="font-label-bold text-label-bold text-on-surface truncate">{s.nombre}</p>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm truncate">{s.email}</p>
                </div>
                <button
                  onClick={() => handleExclude(s.email)}
                  title="Remove from this send"
                  className="p-2 text-error opacity-0 group-hover:opacity-100 hover:bg-error-container/20 rounded-lg transition-all"
                >
                  <Icon name="delete" size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
          <p className="font-label-bold text-label-bold text-on-surface-variant">
            Total Recipients: <span className="text-primary">{filteredSubscribers.length}</span>
          </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 font-label-bold text-label-bold text-on-surface-variant hover:bg-surface-variant/20 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSend}
              disabled={sending || filteredSubscribers.length === 0}
              className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-2.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {sending ? (
                <>
                  <Icon name="sync" size={14} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Icon name="send" size={14} />
                  Send Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
