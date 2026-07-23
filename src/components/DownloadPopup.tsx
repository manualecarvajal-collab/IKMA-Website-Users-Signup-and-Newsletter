"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/useLanguage"
import { showToast } from "./Toast"
import { sendMagazineToEmail } from "@/lib/supabase/admin-actions"
import Icon from "@/components/Icon"

export default function DownloadPopup({
  isAuthenticated,
  isSubscribed,
  revistaId,
}: {
  isAuthenticated: boolean
  isSubscribed: boolean
  revistaId?: string
}) {
  const lang = useLanguage()
  const t = (en: string, es: string) => lang === "es" ? es : en
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

    if (!isSubscribed) {
      setTimeLeft(600)
      setOpen(true)
      return
    }

    if (!revistaId) {
      showToast(t("No magazine available for download", "No hay revista disponible para descargar"), "error")
      return
    }

    // Is subscribed
    setLoading(true)
    try {
      const result = await sendMagazineToEmail(revistaId, "")
      if (result.success) {
        showToast(t("The magazine has been sent to your registered email successfully", "La revista ha sido enviada a tu correo registrado exitosamente"), "success")
      } else if (result.error) {
        showToast(result.error, "error")
        // Si el error dice que no está activa, refrescamos la página para actualizar el estado del componente
        if (result.error.includes("Subscription not active")) {
          router.refresh()
        }
      }
    } catch (err) {
      showToast(t("An error occurred while sending the magazine", "Ocurrió un error al enviar la revista"), "error")
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
        {loading ? t("Sending...", "Enviando...") : t("Download PDF", "Descargar PDF")}
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
              <h3 className="font-headline-md text-headline-md text-primary mb-2">{t("Subscribe to Our Newsletter", "Suscríbete a nuestro Boletín")}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                {t("Get the full magazine delivered straight to your inbox. Subscribe now and receive", "Recibe la revista completa directamente en tu bandeja de entrada. ¡Suscríbete ahora y recibe")}{" "}
                <strong className="text-primary">{t("50% off", "50% de descuento")}</strong> {t("your first year!", "en tu primer año!")}
              </p>

              <div className="bg-primary-container/20 rounded-lg py-4 px-6 mb-6">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">{t("Offer expires in", "Oferta expira en")}</span>
                <div className="font-headline-xl text-headline-xl text-primary font-bold mt-1">{formatTime()}</div>
              </div>

              <Link
                href="/suscripcion-exito"
                className="block w-full bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all mb-3"
              >
                {t("Subscribe Now", "Suscríbete ahora")}
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                {t("Maybe later", "Quizás después")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
