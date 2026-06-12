"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface ToastItem {
  id: number
  message: string
  type: "success" | "error"
}

let toastId = 0
const listeners: Set<(t: ToastItem) => void> = new Set()

export function showToast(message: string, type: "success" | "error" = "success") {
  const item: ToastItem = { id: ++toastId, message, type }
  listeners.forEach((fn) => fn(item))
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (t: ToastItem) => {
      setToasts((prev) => [...prev, t])
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id))
      }, 4000)
    }
    listeners.add(handler)
    return () => { listeners.delete(handler) }
  }, [])

  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-5 py-3 rounded-lg shadow-lg font-body-md text-body-md text-white transition-all animate-slide-in ${
            t.type === "success" ? "bg-tertiary" : "bg-error"
          }`}
        >
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>,
    document.body
  )
}
