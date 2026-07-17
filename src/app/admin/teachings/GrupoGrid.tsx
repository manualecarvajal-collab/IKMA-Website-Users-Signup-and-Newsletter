"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Icon from "@/components/Icon"

interface Grupo {
  id: string
  nombre: string
  slug: string
  created_at: string
}

export function GrupoGrid({
  grupos: initial,
  videoCount,
  createGrupo,
  reordenarGrupos,
}: {
  grupos: Grupo[]
  videoCount: Record<string, number>
  createGrupo: (formData: FormData) => Promise<{ error?: string; data?: { id: string; nombre: string } } | undefined>
  reordenarGrupos: (formData: FormData) => Promise<void>
}) {
  const [grupos, setGrupos] = useState(initial)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [openNew, setOpenNew] = useState(false)
  const [newName, setNewName] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const router = useRouter()
  const dragItem = useRef<number | null>(null)

  function handleDragStart(e: React.DragEvent, idx: number) {
    dragItem.current = idx
    setDragIndex(idx)
    e.dataTransfer.effectAllowed = "move"
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    const dragged = dragItem.current
    if (dragged === null || dragged === idx) return
    const updated = [...grupos]
    const [moved] = updated.splice(dragged, 1)
    updated.splice(idx, 0, moved)
    dragItem.current = idx
    setGrupos(updated)
  }

  function handleDragEnd() {
    setDragIndex(null)
    dragItem.current = null
    const orderedIds = grupos.map((g) => g.id)
    const originalIds = initial.map((g) => g.id)
    if (orderedIds.join(",") === originalIds.join(",")) return
    const fd = new FormData()
    fd.set("ids", JSON.stringify(orderedIds))
    reordenarGrupos(fd)
    router.refresh()
  }

  const handleNewGroup = useCallback(async () => {
    if (!newName.trim()) return
    setPending(true)
    setError("")
    const fd = new FormData()
    fd.set("nombre", newName.trim())
    const result = await createGrupo(fd)
    if (result?.error) {
      setError(result.error)
      setPending(false)
      return
    }
    setNewName("")
    setOpenNew(false)
    setPending(false)
    if (result?.data) {
      router.push(`/admin/teachings/${result.data.id}`)
    }
    router.refresh()
  }, [newName, createGrupo, router])

  return (
    <>
      <div className="mb-6">
        {!openNew ? (
          <button onClick={() => setOpenNew(true)}
            className="bg-primary text-on-primary font-label-bold text-label-bold px-5 py-2.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors inline-flex items-center justify-center gap-2"
          >
            <Icon name="add" size={14} /> Create New Group
          </button>
        ) : (
          <div className="flex items-center gap-2 max-w-lg">
            <input
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setError("") }}
              placeholder="Group name"
              autoFocus
              className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {error && <p className="text-error text-sm whitespace-nowrap">{error}</p>}
            <button onClick={handleNewGroup} disabled={pending || !newName.trim()}
              className="bg-primary text-on-primary font-label-bold text-label-bold px-4 py-2.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {pending ? "Creating..." : "Create"}
            </button>
            <button onClick={() => { setOpenNew(false); setNewName(""); setError("") }}
              className="bg-surface-container-high text-on-surface-variant font-label-bold text-label-bold px-4 py-2.5 rounded-lg hover:bg-outline-variant/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {grupos.length === 0 && (
          <div className="col-span-full text-center py-16">
            <Icon name="folder_open" size={48} className="text-on-surface-variant/40 mx-auto mb-4" />
            <p className="font-body-md text-body-md text-on-surface-variant">No groups yet. Create your first one!</p>
          </div>
        )}
        {grupos.map((g, idx) => (
          <Link
            key={g.id}
            href={`/admin/teachings/${g.id}`}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={`group bg-surface-container-lowest rounded-xl border p-6 transition-all cursor-grab active:cursor-grabbing ${
              dragIndex === idx ? "border-primary opacity-60 shadow-md" : "border-outline-variant/20 hover:border-primary/30 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="drag_indicator" size={18} className="text-on-surface-variant/40" />
                <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
                  <Icon name="folder" size={22} className="text-primary" />
                </div>
              </div>
              <span className="font-label-bold text-label-sm text-on-surface-variant">
                {videoCount[g.id] ?? 0} videos
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors mb-1 truncate">{g.nombre}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">/{g.slug}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
