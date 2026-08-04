"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { showToast } from "./Toast"
import { sendMagazineToEmail } from "@/lib/supabase/admin-actions"
import Icon from "@/components/Icon"

export default function DownloadPopup({
  isAuthenticated,
  isSubscribed,
  isFreeMember,
  revistaId,
}: {
  isAuthenticated: boolean
  isSubscribed: boolean
  isFreeMember: boolean
  revistaId?: string
}) {
  const t = useTranslations("Download")
  const [open, setOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [open, timeLeft])

  const formatTime = useCallback(() => {
    const m = Math.floor(timeLeft / 60)
    const s = timeLeft % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }, [timeLeft])

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push("/registro")
      return
    }

    // Free members skip the upsell popup; the server validates the first-edition rule
    if (!isSubscribed && !isFreeMember) {
      setTimeLeft(600)
      setOpen(true)
      return
    }

    if (!revistaId) {
      showToast(t("noMagazine"), "error")
      return
    }

    setLoading(true)
    try {
      const result = await sendMagazineToEmail(revistaId, "")
      if (result.success) {
        showToast(t("sentSuccess"), "success")
      } else if (result.error) {
        showToast(result.error, "error")
        if (result.error.includes("Subscription not active")) {
          router.refresh()
        }
      }
    } catch (err) {
      showToast(t("sendError"), "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
      >
        {loading ? t("sending") : t("downloadPdf")}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[200]">
          <div className="bg-surface rounded-xl max-w-md w-full mx-4 p-8 shadow-xl relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <Icon name="close" size={24} />
            </button>

            <div className="text-center">
              <h3 className="font-headline-md text-headline-md text-primary mb-2">{t("subscribeTitle")}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                {t("subscribeDesc")}{" "}
                <strong className="text-primary">{t("fiftyOff")}</strong> {t("firstYear")}
              </p>

              <div className="bg-primary-container/20 rounded-lg py-4 px-6 mb-6">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">{t("offerExpires")}</span>
                <div className="font-headline-xl text-headline-xl text-primary font-bold mt-1">{formatTime()}</div>
              </div>

              <Link
                href="/suscripcion-exito"
                className="block w-full bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all mb-3"
              >
                {t("subscribeNow")}
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                {t("maybeLater")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
