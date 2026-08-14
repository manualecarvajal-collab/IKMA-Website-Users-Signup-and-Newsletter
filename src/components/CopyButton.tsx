"use client"

import { useState } from "react"
import Icon from "@/components/Icon"

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
        } catch {
          const ta = document.createElement("textarea")
          ta.value = value
          ta.style.position = "fixed"
          ta.style.opacity = "0"
          document.body.appendChild(ta)
          ta.select()
          document.execCommand("copy")
          ta.remove()
        }
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer bg-transparent border-none"
      aria-label={`Copy ${value}`}
      title="Copy"
    >
      <Icon name={copied ? "check" : "copy"} size={15} />
    </button>
  )
}
