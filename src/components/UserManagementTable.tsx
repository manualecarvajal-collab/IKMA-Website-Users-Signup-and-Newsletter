"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { showToast } from "./Toast"
import { updateUsersBatch, deleteUser } from "@/lib/supabase/admin-actions"

interface User {
  id: string
  nombre_completo: string
  email: string
  suscripcion_activa: boolean
  rol: string
  created_at: string
}

export default function UserManagementTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [originalUsers, setOriginalUsers] = useState<User[]>(initialUsers)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const nonAdmin = (u: User) => u.rol !== "administrador"
    const isDifferent = JSON.stringify(users.filter(nonAdmin).map(u => ({ id: u.id, s: u.suscripcion_activa }))) !== 
                        JSON.stringify(originalUsers.filter(nonAdmin).map(u => ({ id: u.id, s: u.suscripcion_activa })))
    setHasChanges(isDifferent)
  }, [users, originalUsers])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasChanges])

  const toggleSubscription = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, suscripcion_activa: !u.suscripcion_activa } : u
    ))
  }

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete user "${name}"? This action cannot be undone.`)) return
    
    try {
      await deleteUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      setOriginalUsers(prev => prev.filter(u => u.id !== userId))
      showToast("User deleted successfully", "success")
    } catch (err) {
      showToast("Failed to delete user", "error")
    }
  }

  const saveChanges = async () => {
    setIsSaving(true)
    const updates = users
      .filter((u, i) => u.rol !== "administrador" && u.suscripcion_activa !== originalUsers[i].suscripcion_activa)
      .map(u => ({ id: u.id, suscripcion_activa: u.suscripcion_activa }))

    try {
      await updateUsersBatch(updates)
      setOriginalUsers([...users])
      setHasChanges(false)
      showToast("Changes saved successfully", "success")
      router.refresh()
    } catch (err) {
      showToast("Failed to save changes", "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end sticky top-20 md:top-24 z-10">
        <button
          onClick={saveChanges}
          disabled={!hasChanges || isSaving}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-label-bold text-label-bold flex items-center justify-center gap-2 transition-all shadow-md ${
            hasChanges 
              ? "bg-primary text-on-primary hover:bg-primary/90 cursor-pointer" 
              : "bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined">save</span>
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20">
                <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider">Subscription Status</th>
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
                      <p className="font-label-bold text-on-surface">{u.nombre_completo || "Unnamed User"}</p>
                      <p className="text-sm text-on-surface-variant font-mono">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {u.rol === "administrador" ? (
                        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/30">
                          ADMIN
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleSubscription(u.id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                            u.suscripcion_activa 
                              ? "bg-tertiary/10 text-tertiary border-tertiary/30 hover:bg-tertiary/20" 
                              : "bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-highest"
                          }`}
                        >
                          {u.suscripcion_activa ? "ACTIVE SUBSCRIBER" : "FREE USER"}
                        </button>
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
                          <span className="material-symbols-outlined text-lg">person_remove</span>
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
                      <p className="font-label-bold text-on-surface">{u.nombre_completo || "Unnamed User"}</p>
                      <p className="text-xs text-on-surface-variant font-mono break-all">{u.email}</p>
                    </div>
                    {u.rol !== "administrador" && (
                      <button
                        onClick={() => handleDelete(u.id, u.nombre_completo)}
                        className="p-2 text-on-surface-variant hover:text-error"
                        title="Delete Account Permanently"
                      >
                        <span className="material-symbols-outlined text-lg">person_remove</span>
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
                    <button
                      onClick={() => toggleSubscription(u.id)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                        u.suscripcion_activa 
                          ? "bg-tertiary/10 text-tertiary border-tertiary/30" 
                          : "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
                      }`}
                    >
                      {u.suscripcion_activa ? "ACTIVE SUBSCRIBER" : "FREE USER"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {hasChanges && (
        <div className="bg-primary-container/30 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-lg">info</span>
          <p className="text-sm text-on-primary-container font-body-md">
            You have unsaved changes. Make sure to click <strong>"Save Changes"</strong> before leaving this page.
          </p>
        </div>
      )}
    </div>
  )
}
