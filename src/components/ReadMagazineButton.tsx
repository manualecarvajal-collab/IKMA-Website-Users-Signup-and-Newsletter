"use client"

import { useTranslations } from "next-intl"

export default function ReadMagazineButton({
  isAuthenticated,
  canRead,
  revistaId,
}: {
  isAuthenticated: boolean
  canRead: boolean
  revistaId: string
}) {
  const t = useTranslations("ReadMagazine")
  const handleClick = () => {
    if (!canRead) {
      if (!isAuthenticated) {
        window.location.href = "/registro"
      } else {
        window.location.href = "/suscripcion-exito"
      }
      return
    }
    window.open(`/api/download-magazine?id=${revistaId}`, "_blank")
  }

  return (
    <button
      onClick={handleClick}
      className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all w-full cursor-pointer"
    >
      {t("read")}
    </button>
  )
}
