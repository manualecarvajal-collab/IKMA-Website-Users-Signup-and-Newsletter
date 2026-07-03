"use client"

import { useEffect, useState } from "react"

type ConsentStatus = "accepted" | "rejected"
type StoredConsent = { status: ConsentStatus; version: string } | null

const COOKIE_VERSION = "v2"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cookie-consent")
      if (!raw) return setVisible(true)
      const parsed = JSON.parse(raw) as StoredConsent
      if (!parsed || parsed.version !== COOKIE_VERSION) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const storeConsent = (status: ConsentStatus) => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({ status, version: COOKIE_VERSION })
    )
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-[200] animate-fadeInUp">
      <div className="bg-surface rounded-xl p-5 shadow-xl border border-outline-variant/20 w-auto max-w-md max-h-[70vh] overflow-y-auto">
        <h3 className="font-label-bold text-label-bold text-on-surface mb-2">
          Cookies and Tracking
        </h3>
        <div className="font-body-md text-body-md text-on-surface-variant text-sm leading-relaxed">
          <p>
            Cookies are small files transferred to your browser that enable
            sites to recognize you and remember your information. We use them
            to remember items, understand your preferences, and compile
            aggregate data about site traffic to offer better experiences.
          </p>
        </div>
        <a
          href="/cookies"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-primary font-label-bold text-label-bold mt-2 mb-3 hover:underline cursor-pointer"
        >
          Read More
        </a>
        <div className="flex gap-3 justify-start">
          <button
            onClick={() => storeConsent("accepted")}
            className="w-20 bg-primary text-on-primary font-label-bold text-label-bold px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Accept
          </button>
          <button
            onClick={() => storeConsent("rejected")}
            className="w-20 bg-surface-container-high text-on-surface font-label-bold text-label-bold px-4 py-2.5 rounded-lg hover:bg-surface-variant transition-colors cursor-pointer"
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
