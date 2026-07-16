"use client"
import Icon from "@/components/Icon"

export function DeleteButton({ action, label = "Delete" }: { action: (formData: FormData) => Promise<void>; label?: string }) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="text-error hover:text-error/70 p-1.5"
        onClick={(e) => { if (!confirm(`Delete this ${label.toLowerCase()}?`)) e.preventDefault() }}
      >
        <Icon name="delete" size={18} />
      </button>
    </form>
  )
}
