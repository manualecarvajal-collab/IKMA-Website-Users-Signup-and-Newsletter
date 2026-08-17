"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { deleteMembership } from "@/lib/supabase/admin-actions"
import { DeleteButton } from "@/components/DeleteButton"
import Icon from "@/components/Icon"
import MemberStatusSelect from "./MemberStatusSelect"
import MemberActions from "./MemberActions"

interface Solicitud {
  id: string
  usuario_id: string
  tipo_miembro: number | null
  estado: string
  region: string | null
  pais: string | null
  metodo_pago: string | null
  created_at: string
}

type Filter = "all" | "1" | "2" | "3" | "4" | "incompleta"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "3", label: "Students" },
  { value: "2", label: "Residents" },
  { value: "1", label: "Licensed Health Pros" },
  { value: "4", label: "Non-health Pros" },
  { value: "incompleta", label: "Incomplete Registration" },
]

const statusColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  pagada: "bg-blue-100 text-blue-800",
  incompleta: "bg-orange-100 text-orange-800",
}

const statusLabels: Record<string, string> = {
  pendiente: "Pending",
  aprobada: "Approved",
  rechazada: "Rejected",
  pagada: "Paid",
  incompleta: "Incomplete",
}

const memberLabels: Record<number, string> = {
  1: "Licensed Health Professional",
  2: "Resident (Post-graduate)",
  3: "Student",
  4: "Associate (Non-health)",
}

export default function MemberListTable({
  solicitudes,
  nombreMap,
}: {
  solicitudes: Solicitud[]
  nombreMap: Record<string, string>
}) {
  const [filter, setFilter] = useState<Filter>("all")
  const [asc, setAsc] = useState(false)

  const filtered = useMemo(() => {
    const list = solicitudes.filter((s) =>
      filter === "all"
        ? true
        : filter === "incompleta"
          ? s.estado === "incompleta"
          : s.tipo_miembro === Number(filter)
    )
    return [...list].sort((a, b) =>
      asc
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [solicitudes, filter, asc])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
              filter === f.value
                ? "bg-primary text-white border-primary"
                : "bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-highest"
            }`}
          >
            {f.label}
          </button>
        ))}
        <select
          value={asc ? "asc" : "desc"}
          onChange={(e) => setAsc(e.target.value === "asc")}
          className="ml-auto text-sm bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-on-surface-variant cursor-pointer"
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>
      <p className="text-sm text-on-surface-variant">
        Showing {filtered.length} of {solicitudes.length} applications
      </p>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4">Name</th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden md:table-cell">Type</th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Region</th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4">Status</th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Date</th>
              <th className="text-right font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center font-body-md text-body-md text-on-surface-variant">
                  No membership applications yet.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/admin/members/${s.id}`} className="font-body-md text-body-md text-primary hover:underline notranslate">
                    {nombreMap[s.usuario_id] || "Unknown"}
                  </Link>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm text-on-surface">{memberLabels[s.tipo_miembro ?? 0] || `Type ${s.tipo_miembro}`}</span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-sm text-on-surface-variant notranslate">{s.region} — {s.pais}</span>
                </td>
                <td className="px-6 py-4">
                  {s.tipo_miembro === 3 ? (
                    <MemberStatusSelect solicitudId={s.id} estado={s.estado} />
                  ) : (
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[s.estado] || "bg-surface-container-high text-on-surface-variant"}`}>
                      {statusLabels[s.estado] || s.estado}
                    </span>
                  )}
                  {s.estado === "incompleta" && (
                    <span className="ml-2 inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-200/60 text-orange-900 border border-orange-300" title="This applicant never completed the payment step">
                      No payment
                    </span>
                  )}
                  {s.metodo_pago === "zelle" && (
                    <span className="ml-2 inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800" title="Paid via Zelle">
                      Zelle
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="text-sm text-on-surface-variant">
                    {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {["pendiente", "pagada", "incompleta"].includes(s.estado) && s.tipo_miembro !== 3 && (
                      <MemberActions solicitudId={s.id} estado={s.estado} />
                    )}
                    <Link href={`/admin/members/${s.id}/email`} className="text-primary hover:text-primary-fixed-dim p-1.5" title="Email">
                      <Icon name="mail" size={18} />
                    </Link>
                    <Link href={`/admin/members/${s.id}`} className="text-primary hover:text-primary-fixed-dim p-1.5" title="View">
                      <Icon name="visibility" size={18} />
                    </Link>
                    <DeleteButton action={deleteMembership.bind(null, s.id)} label="Application" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}