"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { deleteAccount } from "@/lib/supabase/profile-actions"
import { createClient } from "@/lib/supabase/client"
import LoadingOverlay from "@/components/LoadingOverlay"

// Mirrors the regular sign-out flow: the server deletes the user, then we
// clear the browser session locally (no API call — the user is already gone
// server-side) and hard-reload so the navbar re-reads the cleared session
// and drops the logged-in UI instead of keeping stale React state.
export default function DeleteAccountForm() {
  const t = useTranslations("Perfil")
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    const ok = await deleteAccount()
    if (!ok) {
      setPending(false)
      return
    }
    const supabase = createClient()
    await supabase.auth.signOut({ scope: "local" })
    window.location.href = "/"
  }

  return (
    <>
      {pending && <LoadingOverlay message={t("deletingAccount")} />}
      <form onSubmit={handleSubmit}>
      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input type="checkbox" required className="mt-1 accent-error" />
        <span className="font-body-md text-body-md text-on-surface-variant">{t("deleteConfirm")}</span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-error text-white font-label-bold text-label-bold py-3 px-6 rounded-lg hover:bg-error/90 transition-all cursor-pointer disabled:opacity-50"
      >
        {t("deleteAccount")}
      </button>
    </form>
    </>
  )
}
