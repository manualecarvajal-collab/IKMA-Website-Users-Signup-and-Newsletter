"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"

export default function DownloadPopup() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const resetTimer = () => {
    setTimeLeft(600)
    setOpen(true)
  }

  return (
    <>
      <button
        onClick={resetTimer}
        className="w-full bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
      >
        Download PDF
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[200]">
          <div className="bg-surface rounded-xl max-w-md w-full mx-4 p-8 shadow-xl relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <div className="text-center">
              <h3 className="font-headline-md text-headline-md text-primary mb-2">Subscribe to Our Newsletter</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                Get the full magazine delivered straight to your inbox. Subscribe now and receive{" "}
                <strong className="text-primary">50% off</strong> your first year!
              </p>

              <div className="bg-primary-container/20 rounded-lg py-4 px-6 mb-6">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Offer expires in</span>
                <div className="font-headline-xl text-headline-xl text-primary font-bold mt-1">{formatTime()}</div>
              </div>

              <Link
                href="/registro"
                className="block w-full bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all mb-3"
              >
                Subscribe Now
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
