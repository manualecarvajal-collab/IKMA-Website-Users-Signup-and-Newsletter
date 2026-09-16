"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { deleteMembership } from "@/lib/supabase/admin-actions"
import { DeleteButton } from "@/components/DeleteButton"
import Icon from "@/components/Icon"
import { memberLabels, statusLabels, statusColors } from "@/lib/membership"
import { ESTADO_ELIMINADO } from "@/lib/deleted-accounts"
import MemberStatusSelect from "./MemberStatusSelect"
import MemberActions from "./MemberActions"

interface EliminadoInfo {
  nombre: string
  email: string | null
  motivo: string
  cuando: string
  estadoPrevio: string | null
  suscripcionCancelada: boolean
}

interface Solicitud {
  id: string
  /** null para las filas que solo existen como registro de auditoría. */
  usuario_id: string | null
  tipo_miembro: number | null
  estado: string
  region: string | null
  pais: string | null
  metodo_pago: string | null
  created_at: string
  eliminado?: EliminadoInfo | null
}

type Filter = "all" | "1" | "2" | "3" | "4" | "incompleta" | "eliminado"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "3", label: "Students" },
  { value: "2", label: "Residents" },
  { value: "1", label: "Licensed Health Pros" },
  { value: "4", label: "Non-health Pros" },
  { value: "incompleta", label: "Incomplete Registration" },
  { value: "eliminado", label: "Deleted accounts" },
]

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
          : filter === "eliminado"
            ? s.estado === ESTADO_ELIMINADO
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
                  {s.eliminado ? (
                    <>
                      <span className="font-body-md text-body-md text-on-surface line-through decoration-error/40 notranslate">
                        {s.eliminado.nombre}
                      </span>
                      {s.eliminado.email && (
                        <span className="block text-xs text-on-surface-variant font-mono break-all">{s.eliminado.email}</span>
                      )}
                    </>
                  ) : (
                    <Link href={`/admin/members/${s.id}`} className="font-body-md text-body-md text-primary hover:underline notranslate">
                      {nombreMap[s.usuario_id ?? ""] || "Unknown"}
                    </Link>
                  )}
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm text-on-surface">{memberLabels[s.tipo_miembro ?? 0] || "Unknown"}</span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-sm text-on-surface-variant notranslate">
                    {s.region ? `${s.region}${s.pais ? ` — ${s.pais}` : ""}` : "—"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {s.eliminado ? (
                    <>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[ESTADO_ELIMINADO]}`}>
                        {statusLabels[ESTADO_ELIMINADO]}
                      </span>
                      <span className="block mt-1 text-xs">
                        <span className="text-error font-semibold">{s.eliminado.motivo}</span>
                        {s.eliminado.estadoPrevio && (
                          <span className="text-on-surface-variant"> · was {s.eliminado.estadoPrevio}</span>
                        )}
                        <span className="block text-on-surface-variant">
                          {new Date(s.eliminado.cuando).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {!s.eliminado.suscripcionCancelada && " · Stripe cancellation pending"}
                        </span>
                      </span>
                    </>
                  ) : s.tipo_miembro === 3 ? (
                    <MemberStatusSelect solicitudId={s.id} estado={s.estado} />
                  ) : (
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[s.estado] || "bg-surface-container-high text-on-surface-variant"}`}>
                      {statusLabels[s.estado] || s.estado}
                    </span>
                  )}
                  {!s.eliminado && s.estado === "incompleta" && (
                    <span className="ml-2 inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-200/60 text-orange-900 border border-orange-300" title="This applicant never completed the payment step">
                      No payment
                    </span>
                  )}
                  {!s.eliminado && s.metodo_pago === "zelle" && (
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
                  {s.eliminado ? (
                    <span className="text-xs text-on-surface-variant">Account deleted</span>
                  ) : (
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
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}