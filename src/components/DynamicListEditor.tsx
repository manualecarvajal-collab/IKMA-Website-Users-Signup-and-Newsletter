"use client"

import { useState } from "react"
import Icon from "@/components/Icon"

interface Column {
  key: string
  label: string
  placeholder?: string
  type?: "text" | "textarea"
}

export function DynamicListEditor({
  name,
  columns,
  defaultValue,
  emptyItem,
}: {
  name: string
  columns: Column[]
  defaultValue?: unknown[] | null
  emptyItem: Record<string, string>
}) {
  const [items, setItems] = useState<Record<string, string>[]>(
    (defaultValue as Record<string, string>[])?.length
      ? (defaultValue as Record<string, string>[])
      : []
  )

  const addRow = () => {
    setItems([...items, { ...emptyItem }])
  }

  const removeRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const updateRow = (idx: number, key: string, value: string) => {
    const next = items.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
    setItems(next)
  }

  return (
    <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              {columns.map((col) => (
                <th key={col.key} className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              <th className="w-16 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center font-body-md text-body-md text-on-surface-variant">
                  No entries yet. Click &ldquo;Add Row&rdquo; to begin.
                </td>
              </tr>
            )}
            {items.map((row, i) => (
              <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2">
                    {col.type === "textarea" ? (
                      <textarea
                        value={row[col.key] ?? ""}
                        onChange={(e) => updateRow(i, col.key, e.target.value)}
                        rows={2}
                        placeholder={col.placeholder}
                        className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    ) : (
                      <input
                        type="text"
                        value={row[col.key] ?? ""}
                        onChange={(e) => updateRow(i, col.key, e.target.value)}
                        placeholder={col.placeholder}
                        className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    )}
                  </td>
                ))}
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-error hover:text-error/70 p-1.5 cursor-pointer"
                    title="Remove row"
                  >
                    <Icon name="remove_circle" size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-outline-variant/20">
        {items.length === 0 && (
          <div className="px-4 py-8 text-center font-body-md text-body-md text-on-surface-variant">
            No entries yet. Click &ldquo;Add Row&rdquo; to begin.
          </div>
        )}
        {items.map((row, i) => (
          <div key={i} className="p-4 space-y-4 relative bg-white">
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="absolute top-2 right-2 text-error p-2 cursor-pointer"
              title="Remove row"
            >
              <Icon name="delete" />
            </button>
            {columns.map((col) => (
              <div key={col.key} className="space-y-1">
                <label className="block font-label-bold text-[10px] uppercase tracking-wider text-on-surface-variant/70">
                  {col.label}
                </label>
                {col.type === "textarea" ? (
                  <textarea
                    value={row[col.key] ?? ""}
                    onChange={(e) => updateRow(i, col.key, e.target.value)}
                    rows={3}
                    placeholder={col.placeholder}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                ) : (
                  <input
                    type="text"
                    value={row[col.key] ?? ""}
                    onChange={(e) => updateRow(i, col.key, e.target.value)}
                    placeholder={col.placeholder}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-surface-container-low px-4 py-3 border-t border-outline-variant/20">
        <button
          type="button"
          onClick={addRow}
          className="text-primary font-label-bold text-label-sm hover:text-primary-fixed-dim transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <Icon name="add_circle" size={14} /> Add Row
        </button>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  )
}
