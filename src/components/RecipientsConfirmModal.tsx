"use client"

import { createPortal } from "react-dom"
import Icon from "@/components/Icon"

export interface Subscriber {
  id: string
  nombre: string | null
  email: string
}

export default function RecipientsConfirmModal({
  subscribers,
  pending,
  onConfirm,
  onClose,
}: {
  subscribers: Subscriber[]
  pending: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-surface rounded-xl w-full max-w-md shadow-xl border border-outline-variant/20 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-title-lg text-title-lg text-on-surface">Recipients ({subscribers.length})</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
            title="Close"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant mb-4">
          This newsletter will be sent to the following {subscribers.length} email address(es):
        </p>

        <div className="max-h-72 overflow-y-auto border border-outline-variant/20 rounded-lg divide-y divide-outline-variant/10 mb-6">
          {subscribers.map((s) => (
            <div key={s.email} className="px-4 py-2">
              <p className="font-body-md text-body-md text-on-surface break-all">{s.email}</p>
              {s.nombre && (
                <p className="font-label-sm text-label-sm text-on-surface-variant">{s.nombre}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={pending}
            className="flex-1 border border-outline-variant text-on-surface font-label-bold text-label-bold py-2.5 rounded-lg hover:bg-surface-container transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className="flex-1 bg-primary text-on-primary font-label-bold text-label-bold py-2.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Sending..." : "Confirm & Send"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}