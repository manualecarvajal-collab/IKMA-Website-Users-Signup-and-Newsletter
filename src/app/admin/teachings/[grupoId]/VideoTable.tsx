"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { deleteVideo, toggleVideoStatus } from "@/lib/supabase/admin-actions"
import { DeleteButton } from "@/components/DeleteButton"
import { ToggleStatus } from "@/components/ToggleStatus"

interface Video {
  id: string
  titulo: string
  slug: string
  embed_url: string
  publicado: boolean
  created_at: string
}

export function VideoTable({
  videos,
  grupoId,
  reordenarVideos,
}: {
  videos: Video[]
  grupoId: string
  reordenarVideos: (formData: FormData) => Promise<void>
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const router = useRouter()
  const from = useRef<number | null>(null)
  const to = useRef<number | null>(null)

  function handleDragStart(e: React.DragEvent, idx: number) {
    from.current = idx
    to.current = idx
    setDragIndex(idx)
    e.dataTransfer.effectAllowed = "move"
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    to.current = idx
  }

  function handleDragEnd() {
    setDragIndex(null)
    const f = from.current
    const t = to.current
    from.current = null
    to.current = null
    if (f === null || t === null || f === t) return
    const ids = videos.map((v) => v.id)
    const [moved] = ids.splice(f, 1)
    ids.splice(t, 0, moved)
    const fd = new FormData()
    fd.set("grupo_id", grupoId)
    fd.set("ids", JSON.stringify(ids))
    reordenarVideos(fd)
    router.refresh()
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/20">
            <th className="w-10 px-2 py-4"></th>
            <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4">Title</th>
            <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden md:table-cell">Embed Code</th>
            <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Status</th>
            <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden md:table-cell">Date</th>
            <th className="text-right font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {videos.length === 0 && (
            <tr><td colSpan={6} className="px-6 py-12 text-center font-body-md text-body-md text-on-surface-variant">No videos in this group yet.</td></tr>
          )}
          {videos.map((v, idx) => (
            <tr
              key={v.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`border-b border-outline-variant/10 transition-colors cursor-grab active:cursor-grabbing ${
                dragIndex === idx ? "bg-primary-container/20 opacity-70" : "hover:bg-surface-container-low/50"
              }`}
            >
              <td className="px-2 py-4 text-center">
                <svg className="w-[18px] h-[18px] inline text-on-surface-variant/40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </td>
              <td className="px-6 py-4">
                <p className="font-label-bold text-label-bold text-on-surface notranslate">{v.titulo}</p>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">/{v.slug}</p>
              </td>
              <td className="px-6 py-4 hidden md:table-cell">
                <span className="font-body-md text-body-md text-on-surface-variant text-sm truncate block max-w-[200px]">{v.embed_url}</span>
              </td>
              <td className="px-6 py-4 hidden sm:table-cell">
                <ToggleStatus id={v.id} published={v.publicado} toggleAction={toggleVideoStatus} />
              </td>
              <td className="px-6 py-4 hidden md:table-cell font-body-md text-body-md text-on-surface-variant">
                {new Date(v.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/teachings/${grupoId}/${v.id}/editar`} className="text-primary hover:text-primary-fixed-dim p-1.5">
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                  </Link>
                  <DeleteButton action={deleteVideo.bind(null, v.id)} label="Video" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
