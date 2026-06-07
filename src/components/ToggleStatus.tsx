"use client"

import { useRouter } from "next/navigation"

export function ToggleStatus({
  id,
  published,
  toggleAction,
}: {
  id: string
  published: boolean
  toggleAction: (id: string, published: boolean) => Promise<void>
}) {
  const router = useRouter()

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value === "true"
    await toggleAction(id, newValue)
    router.refresh()
  }

  return (
    <select
      value={published ? "true" : "false"}
      onChange={handleChange}
      className={`font-label-sm text-label-sm px-2.5 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
        published
          ? "bg-tertiary-fixed-dim text-on-tertiary-fixed"
          : "bg-surface-container-high text-on-surface-variant"
      }`}
    >
      <option value="true">Published</option>
      <option value="false">Draft</option>
    </select>
  )
}
