"use client"

import { useRouter, useSearchParams } from "next/navigation"

export function ListFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const status = searchParams.get("status") ?? ""
  const sort = searchParams.get("sort") ?? "newest"

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="font-label-bold text-label-sm text-on-surface-variant">Status:</label>
        <select
          value={status}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="font-label-bold text-label-sm text-on-surface-variant">Sort:</label>
        <select
          value={sort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  )
}
