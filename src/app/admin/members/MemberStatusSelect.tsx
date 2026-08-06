"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { approveMembership, rejectMembership } from "@/lib/supabase/admin-actions"
import Icon from "@/components/Icon"

const stateLabels: Record<string, string> = {
  pendiente: "En revisión",
  aprobada: "Aprobado",
  rechazada: "Negado",
  pagada: "Pagado",
}

const stateStyles: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  pagada: "bg-blue-100 text-blue-800",
}

export default function MemberStatusSelect({
  solicitudId,
  estado,
}: {
  solicitudId: string
  estado: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  // Once decided, the status can only toggle between the two options
  const options: { estado: string; label: string }[] =
    estado === "aprobada"
      ? [{ estado: "rechazada", label: stateLabels.rechazada }]
      : estado === "rechazada"
        ? [{ estado: "aprobada", label: stateLabels.aprobada }]
        : [
            { estado: "aprobada", label: stateLabels.aprobada },
            { estado: "rechazada", label: stateLabels.rechazada },
          ]

  const apply = async (target: string) => {
    setBusy(true)
    setOpen(false)
    if (target === "aprobada") await approveMembership(solicitudId)
    else await rejectMembership(solicitudId)
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-transparent hover:border-black/10 transition ${
          stateStyles[estado] || "bg-surface-container-high text-on-surface-variant"
        }`}
      >
        {busy ? "..." : stateLabels[estado] || estado}
        <Icon name={open ? "expand_less" : "expand_more"} size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-white rounded-lg border border-outline-variant/30 shadow-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.estado}
              type="button"
              onClick={() => apply(opt.estado)}
              className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-surface-container-low transition"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}