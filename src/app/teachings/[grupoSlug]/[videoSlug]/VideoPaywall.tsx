"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

export default function VideoPaywall() {
  const t = useTranslations("VideoPaywall")

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-primary/30 p-8">
      <h3 className="font-headline-md text-headline-md text-on-primary text-center mb-2">
        {t("title")}
      </h3>
      <p className="font-body-md text-body-md text-on-primary/80 text-center max-w-md mb-6">
        {t("description")}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/membresia"
          className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg text-center"
        >
          {t("becomeMember")}
        </Link>
      </div>
    </div>
  )
}
