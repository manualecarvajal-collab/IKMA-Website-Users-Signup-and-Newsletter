"use client"

import { useEffect } from "react"
import { activateSubscription } from "@/lib/supabase/admin-actions"
import { useRouter } from "next/navigation"

export default function ActivateSubscription() {
  const router = useRouter()
  useEffect(() => {
    activateSubscription().then(() => {
      router.refresh()
    }).catch(console.error)
  }, [router])

  return null
}
