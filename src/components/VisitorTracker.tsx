"use client"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function VisitorTracker() {
  const pathname = usePathname()
  useEffect(() => {
    fetch("/api/track", { method: "POST", body: JSON.stringify({ path: pathname }), headers: { "Content-Type": "application/json" } }).catch(() => {})
  }, [pathname])
  return null
}
