import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import { approveMembership, rejectMembership, deleteMembership } from "@/lib/supabase/admin-actions"
import { DeleteButton } from "@/components/DeleteButton"
import Icon from "@/components/Icon"

const statusColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  pagada: "bg-blue-100 text-blue-800",
}

const memberLabels: Record<number, string> = {
  1: "Licensed Health Professional",
  2: "Resident (Post-graduate)",
  3: "Student",
  4: "Associate (Non-health)",
}

export default async function AdminMembersPage() {
  const admin = await createAdminClient()

  const { data: solicitudes } = await admin
    .from("solicitudes_membresia")
    .select("*")
    .order("created_at", { ascending: false })

  const ids = solicitudes?.map((s) => s.usuario_id) || []
  const { data: perfiles } = ids.length
    ? await admin.from("perfiles").select("id, nombre_completo").in("id", ids)
    : { data: [] }
  const nombreMap = new Map(perfiles?.map((p) => [p.id, p.nombre_completo]) ?? [])

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Members</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage membership applications
          </p>
        </div>
      </div>

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
            {(!solicitudes || solicitudes.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center font-body-md text-body-md text-on-surface-variant">
                  No membership applications yet.
                </td>
              </tr>
            )}
            {solicitudes?.map((s) => (
              <tr key={s.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/admin/members/${s.id}`} className="font-body-md text-body-md text-primary hover:underline notranslate">
                    {nombreMap.get(s.usuario_id) || "Unknown"}
                  </Link>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm text-on-surface">{memberLabels[s.tipo_miembro] || `Type ${s.tipo_miembro}`}</span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-sm text-on-surface-variant notranslate">{s.region} — {s.pais}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[s.estado] || "bg-surface-container-high text-on-surface-variant"}`}>
                    {s.estado}
                  </span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="text-sm text-on-surface-variant">
                    {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {s.estado === "pendiente" && (
                      <>
                        <form action={approveMembership.bind(null, s.id)}>
                          <button type="submit" className="text-green-600 hover:text-green-800 p-1.5" title="Approve">
                            <Icon name="check_circle" size={18} />
                          </button>
                        </form>
                        <form action={rejectMembership.bind(null, s.id)}>
                          <button type="submit" className="text-red-600 hover:text-red-800 p-1.5" title="Reject">
                            <Icon name="cancel" size={18} />
                          </button>
                        </form>
                      </>
                    )}
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
