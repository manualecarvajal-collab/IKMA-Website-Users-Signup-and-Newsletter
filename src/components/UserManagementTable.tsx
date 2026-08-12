"use client"

import { useState } from "react"
import { showToast } from "./Toast"
import { deleteUser } from "@/lib/supabase/admin-actions"
import Icon from "@/components/Icon"
import EditableName from "@/components/EditableName"

interface Membership {
  tipo_miembro: number | null
  estado: string | null
}

interface User {
  id: string
  nombre_completo: string
  email: string
  membresia: Membership | null
  rol: string
  created_at: string
}

const memberLabels: Record<number, string> = {
  1: "Licensed Health Professional",
  2: "Resident",
  3: "Student",
  4: "Associate",
}

const estadoColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800 border-amber-300",
  aprobada: "bg-green-100 text-green-800 border-green-300",
  pagada: "bg-blue-100 text-blue-800 border-blue-300",
  rechazada: "bg-red-100 text-red-800 border-red-300",
  incompleta: "bg-orange-100 text-orange-800 border-orange-300",
}

function membershipBadge(m: Membership | null) {
  if (!m) {
    return <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-surface-container-high text-on-surface-variant border border-outline-variant/30">REGISTERED</span>
  }
  const tipo = m.tipo_miembro != null ? memberLabels[m.tipo_miembro] : null
  if (m.estado === "incompleta") {
    return (
      <span
        className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300"
        title="Filled the form but never paid — has no membership access"
      >
        INCOMPLETE REGISTRATION
      </span>
    )
  }
  if (m.estado === "aprobada" || m.estado === "pagada") {
    return (
      <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${estadoColors[m.estado]} border`}>
        {tipo ?? "MEMBER"}
      </span>
    )
  }
  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${estadoColors[m.estado ?? ""] || "bg-surface-container-high text-on-surface-variant border-outline-variant/30"} border`}>
      {tipo ? `${tipo} — ${(m.estado ?? "").toUpperCase()}` : (m.estado ?? "").toUpperCase()}
    </span>
  )
}

export default function UserManagementTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers)

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete user "${name}"? This action cannot be undone.`)) return

    try {
      await deleteUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      showToast("User deleted successfully", "success")
    } catch (err) {
      showToast("Failed to delete user", "error")
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20">
                <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider">Membership</th>
                <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Joined Date</th>
                <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Delete Account</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">No registered users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-6 py-4">
                      <EditableName
                        userId={u.id}
                        name={u.nombre_completo}
                        onSaved={(n) => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, nombre_completo: n } : x))}
                        className="font-label-bold text-on-surface"
                      />
                      <p className="text-sm text-on-surface-variant font-mono">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {u.rol === "administrador" ? (
                        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/30">
                          ADMIN
                        </span>
                      ) : (
                        membershipBadge(u.membresia)
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-on-surface-variant text-sm">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.rol !== "administrador" && (
                        <button
                          onClick={() => handleDelete(u.id, u.nombre_completo)}
                          className="p-2 text-on-surface-variant hover:text-error transition-all cursor-pointer"
                          title="Delete Account Permanently"
                        >
                          <Icon name="person_remove" size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-outline-variant/10">
          {users.length === 0 ? (
            <div className="px-6 py-12 text-center text-on-surface-variant">No registered users found.</div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <EditableName
                        userId={u.id}
                        name={u.nombre_completo}
                        onSaved={(n) => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, nombre_completo: n } : x))}
                        className="font-label-bold text-on-surface"
                      />
                      <p className="text-xs text-on-surface-variant font-mono break-all">{u.email}</p>
                    </div>
                    {u.rol !== "administrador" && (
                      <button
                        onClick={() => handleDelete(u.id, u.nombre_completo)}
                        className="p-2 text-on-surface-variant hover:text-error"
                        title="Delete Account Permanently"
                      >
                        <Icon name="person_remove" size={18} />
                      </button>
                    )}
                  </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    Joined: {new Date(u.created_at).toLocaleDateString()}
                  </span>
                  {u.rol === "administrador" ? (
                    <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/30">
                      ADMIN
                    </span>
                  ) : (
                    membershipBadge(u.membresia)
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}