"use client"

import { useEffect, useState } from "react"

type Consent = "accepted" | "rejected" | null

export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("cookie-consent") as Consent | null
    if (!stored) {
      setVisible(true)
    }
    setConsent(stored)
  }, [])

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setConsent("accepted")
    setVisible(false)
  }

  const reject = () => {
    localStorage.setItem("cookie-consent", "rejected")
    setConsent("rejected")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 z-[200] max-w-sm w-full animate-fadeInUp">
      <div className="bg-surface rounded-xl p-5 shadow-xl border border-outline-variant/20">
        <h3 className="font-label-bold text-label-bold text-on-surface mb-2">
          🍪 Cookie Consent
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-4 leading-relaxed">
          We use cookies to enhance your browsing experience, analyze site traffic,
          and provide authentication services. By clicking "Accept", you consent to
          our use of cookies.
        </p>
        <div className="flex gap-3">
          <button
            onClick={accept}
            className="flex-1 bg-primary text-on-primary font-label-bold text-label-bold px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Accept
          </button>
          <button
            onClick={reject}
            className="flex-1 bg-surface-container-high text-on-surface font-label-bold text-label-bold px-4 py-2.5 rounded-lg hover:bg-surface-variant transition-colors cursor-pointer"
          >
            Reject
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out; }
      `}</style>
    </div>
  )
}
