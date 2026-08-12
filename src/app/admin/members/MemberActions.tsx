"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { approveMembership, rejectMembership } from "@/lib/supabase/admin-actions"
import Icon from "@/components/Icon"

// Approving an "incompleta" application grants full membership access with no
// payment on record. The admin is warned and must confirm before proceeding.
const WARNING =
  "This application has NO payment record (incomplete registration). " +
  "Approving will grant full membership access. Only do this if the member " +
  "paid outside the system. Continue?"

export default function MemberActions({
  solicitudId,
  estado,
}: {
  solicitudId: string
  estado: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null)

  const run = async (action: "approve" | "reject") => {
    if (action === "approve" && estado === "incompleta") {
      if (!window.confirm(WARNING)) return
    }
    setBusy(action)
    try {
      if (action === "approve") await approveMembership(solicitudId)
      else await rejectMembership(solicitudId)
    } finally {
      setBusy(null)
      router.refresh()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => run("approve")}
        disabled={busy !== null}
        title={estado === "incompleta" ? "Approve — no payment on record" : "Approve"}
        className="text-green-600 hover:text-green-800 p-1.5 disabled:opacity-50"
      >
        <Icon name="check_circle" size={18} />
      </button>
      <button
        type="button"
        onClick={() => run("reject")}
        disabled={busy !== null}
        title="Reject"
        className="text-red-600 hover:text-red-800 p-1.5 disabled:opacity-50"
      >
        <Icon name="remove_circle" size={18} />
      </button>
    </>
  )
}
