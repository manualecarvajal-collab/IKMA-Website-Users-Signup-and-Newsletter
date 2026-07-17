"use client"

import { useState, useRef, useEffect } from "react"
import { updateGrupo } from "@/lib/supabase/admin-actions"

export function EditableGroupTitle({ grupoId, nombre: initial }: { grupoId: string; nombre: string }) {
  const [nombre, setNombre] = useState(initial)
  const dirty = useRef(false)
  const nombreRef = useRef(nombre)

  useEffect(() => {
    nombreRef.current = nombre
  }, [nombre])

  useEffect(() => {
    return () => {
      if (!dirty.current) return
      const fd = new FormData()
      fd.set("nombre", nombreRef.current)
      updateGrupo(grupoId, fd)
    }
  }, [])

  function save() {
    if (!dirty.current) return
    dirty.current = false
    const fd = new FormData()
    fd.set("nombre", nombre)
    updateGrupo(grupoId, fd)
  }

  return (
    <input
      value={nombre}
      onChange={(e) => { setNombre(e.target.value); dirty.current = true }}
      onBlur={save}
      className="font-headline-md text-headline-md text-primary bg-transparent border-0 border-b-2 border-transparent focus:border-primary/40 focus:outline-none transition-colors -ml-1 px-1"
    />
  )
}
