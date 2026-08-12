"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateUserName } from "@/lib/supabase/users-actions"
import Icon from "@/components/Icon"

// Inline name editing for the admin panel. Updates perfiles.nombre_completo and
// the auth user_metadata so emails keep using the new name.
export default function EditableName({
  userId,
  name,
  onSaved,
  className = "",
}: {
  userId: string
  name: string
  onSaved?: (newName: string) => void
  className?: string
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  const display = name?.trim() || "Unnamed User"

  const save = async () => {
    const nuevo = draft.trim()
    if (!nuevo || nuevo === name) {
      setEditing(false)
      return
    }
    setBusy(true)
    setError(false)
    try {
      const res = await updateUserName(userId, nuevo)
      if (res?.error) throw new Error(res.error)
      setEditing(false)
      onSaved?.(nuevo)
      router.refresh()
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  const cancel = () => {
    setEditing(false)
    setDraft(name)
    setError(false)
  }

  if (!editing) {
    return (
      <span className={`group/name inline-flex items-center gap-1 ${className}`}>
        <span className="notranslate truncate">{display}</span>
        <button
          type="button"
          onClick={() => { setDraft(name); setEditing(true) }}
          className="opacity-0 group-hover/name:opacity-100 focus:opacity-100 text-on-surface-variant hover:text-primary transition p-1"
          title="Edit name"
          aria-label="Edit name"
        >
          <Icon name="edit" size={16} />
        </button>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save()
          if (e.key === "Escape") cancel()
        }}
        autoFocus
        disabled={busy}
        className="border border-primary rounded-md px-2 py-1 text-sm text-on-surface notranslate min-w-[10rem] outline-none focus:ring-2 focus:ring-primary/30"
      />
      {error && <span className="text-xs text-error">Could not save</span>}
      <button type="button" onClick={save} disabled={busy} title="Save" className="text-green-600 hover:text-green-800 p-1 disabled:opacity-50">
        <Icon name="check" size={16} />
      </button>
      <button type="button" onClick={cancel} disabled={busy} title="Cancel" className="text-on-surface-variant hover:text-error p-1 disabled:opacity-50">
        <Icon name="close" size={16} />
      </button>
    </span>
  )
}
