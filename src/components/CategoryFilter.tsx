"use client"

import { useRouter, useSearchParams } from "next/navigation"

export function CategoryFilter({
  categorias,
  current,
}: {
  categorias: { id: string; nombre: string }[]
  current: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set("categoria", value)
    else params.delete("categoria")
    router.push(`?${params.toString()}`)
  }

  if (categorias.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <label className="font-label-bold text-label-sm text-on-surface-variant">Category:</label>
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
      >
        <option value="">All</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>
    </div>
  )
}
