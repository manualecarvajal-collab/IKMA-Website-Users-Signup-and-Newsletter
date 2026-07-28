"use client"

import { createPortal } from "react-dom"
import Link from "next/link"
import { useTranslations } from "next-intl"
import Icon from "@/components/Icon"

interface MembershipPopupProps {
  open: boolean
  onClose: () => void
}

export default function MembershipPopup({ open, onClose }: MembershipPopupProps) {
  const t = useTranslations("MembershipPopup")

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[200] p-4">
      <div className="bg-surface rounded-2xl max-w-md w-full p-8 shadow-2xl relative animate-fadeInUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-none"
          aria-label="Close"
        >
          <Icon name="close" size={24} />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-container/20 flex items-center justify-center">
            <Icon name="lock" size={32} className="text-primary" />
          </div>

          <h3 className="font-headline-md text-headline-md text-primary mb-3">
            {t("title")}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
            {t("description")}
          </p>

          <div className="space-y-3">
            <Link
              href="/membresia"
              onClick={onClose}
              className="block w-full bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg"
            >
              {t("becomeMember")}
            </Link>
            <button
              onClick={onClose}
              className="w-full font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors py-2 cursor-pointer bg-transparent border-none"
            >
              {t("maybeLater")}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.3s ease-out; }
      `}</style>
    </div>,
    document.body
  )
}
