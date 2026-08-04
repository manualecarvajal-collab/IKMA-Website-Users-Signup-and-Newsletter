"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateGrupo } from "@/lib/supabase/admin-actions"

export function GroupFreeToggle({ grupoId, nombre, gratis: initial }: { grupoId: string; nombre: string; gratis: boolean }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setPending(true)
    const fd = new FormData()
    fd.set("nombre", nombre)
    fd.set("gratis", checked ? "on" : "")
    await updateGrupo(grupoId, fd)
    setPending(false)
    router.refresh()
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer select-none">
      <input
        type="checkbox"
        checked={initial}
        onChange={handleChange}
        disabled={pending}
        className="h-4 w-4 rounded border-outline-variant/50 text-primary focus:ring-primary/30 disabled:opacity-50"
      />
      Free for members
    </label>
  )
}
