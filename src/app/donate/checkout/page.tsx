"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { getStripe } from "@/lib/stripe/client"
import Icon from "@/components/Icon"
import CopyButton from "@/components/CopyButton"

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-2.5 rounded-full font-label-bold text-sm transition ${
        active
          ? "bg-primary text-on-primary shadow"
          : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-high/70"
      }`}
    >
      {children}
    </button>
  )
}

function CheckoutContent() {
  const params = useSearchParams()
  const amount = params.get("amount")
  const success = params.get("donation") === "success"
  const amountNum = Number(amount)
  const invalid = !success && (!Number.isFinite(amountNum) || amountNum <= 0)
  const [error, setError] = useState<string | null>(null)
  const [method, setMethod] = useState<"card" | "zelle">("card")
  const [zelleSent, setZelleSent] = useState(false)
  const mounted = useRef(false)
  const showThanks = success || zelleSent
  const [zelleRef, setZelleRef] = useState("")

  useEffect(() => {
    if (success || zelleSent || invalid || method !== "card" || mounted.current) return
    mounted.current = true

    ;(async () => {
      try {
        const res = await fetch("/api/stripe/donation-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountNum }),
        })
        const { clientSecret, error: apiError } = await res.json()
        if (!clientSecret) throw new Error(apiError || "Failed to start checkout")

        const stripe = await getStripe()
        if (!stripe) throw new Error("Stripe failed to load")
        const checkout = await stripe.createEmbeddedCheckoutPage({ clientSecret })
        checkout.mount("#donation-checkout")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong")
      }
    })()
  }, [amountNum, invalid, method, success, zelleSent])

  if (showThanks) {
    return (
      <div className="text-center py-24">
        <Icon name="check_circle" size={60} className="text-primary mb-4" />
        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Thank you for your donation!</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">
          {zelleSent
            ? "Your donation is on its way! Our team will verify your Zelle transfer and email your receipt."
            : "Your generous support helps IKMA continue its mission. A receipt has been sent to your email."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-bold text-label-bold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-all"
        >
          <Icon name="arrow_back" size={16} /> Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/donate" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
        <Icon name="arrow_back" size={16} /> Donate another amount
      </Link>
      <div className="bg-surface rounded-xl p-6 md:p-10 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
        <h1 className="font-headline-lg text-headline-md text-primary mb-2 text-center">Complete your donation</h1>
        <p className="font-body-md text-body-md text-on-surface-variant text-center mb-8">
          {amount ? `Donating $${Number(amount).toFixed(2)} USD` : ""}
        </p>
        {invalid && (
          <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3 mb-6">
            Invalid donation amount.
          </p>
        )}
        {error && (
          <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3 mb-6">{error}</p>
        )}
        {!invalid && (
          <div className="flex justify-center gap-2 mb-8">
            <Tab active={method === "card"} onClick={() => setMethod("card")}>
              Card
            </Tab>
            <Tab active={method === "zelle"} onClick={() => setMethod("zelle")}>
              Zelle
            </Tab>
          </div>
        )}
        <div className={method === "card" ? "" : "hidden"} id="donation-checkout" />
        {!invalid && (
          <div className={`${method === "zelle" ? "" : "hidden"} p-6 bg-purple-50 border border-purple-200 rounded-2xl space-y-4`}>
            <div className="flex items-center gap-2 text-purple-800 font-bold">
              <img src="/Zelle_Logo.png" alt="Zelle" className="h-6 w-auto object-contain" />
              <h4>Transfer Instructions</h4>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-44 shrink-0 mx-auto sm:mx-0 bg-white p-2 rounded-xl border border-purple-100">
                <img
                  src="/zelle-qr.jpeg"
                  alt="IKMA Zelle payment QR code"
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Scan the QR code or use the following official IKMA details to send your donation of{" "}
                  <strong className="text-on-surface">${Number(amount).toFixed(2)} USD</strong>:
                </p>
                <div className="bg-white p-3.5 rounded-xl border border-purple-100 text-xs font-mono space-y-1.5 text-on-surface">
                  <div className="flex items-center justify-between gap-2">
                    <span><strong>Recipient Email:</strong> ikma@emmint.com</span>
                    <CopyButton value="ikma@emmint.com" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span><strong>Account Name:</strong> ikma lc</span>
                    <CopyButton value="ikma lc" />
                  </div>
                  <div>
                    <label htmlFor="zelle-memo" className="block text-sm font-semibold text-purple-900 mb-1.5">
                      Reference / Memo
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="zelle-memo"
                        type="text"
                        placeholder="e.g. Juan Pérez (your first and last name)"
                        value={zelleRef}
                        onChange={(e) => setZelleRef(e.target.value)}
                        className="w-full bg-white border border-purple-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-400"
                      />
                      <CopyButton value={zelleRef} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setZelleSent(true)}
              className="w-full bg-primary text-on-primary font-label-bold px-6 py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 hover:bg-primary/90"
            >
              <Icon name="check_circle" size={18} /> I&apos;ve sent the payment
            </button>
            <p className="text-xs text-on-surface-variant text-center leading-relaxed">
              Our team will verify your transfer and email your receipt.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DonateCheckoutPage() {
  return (
    <section className="py-section-padding bg-surface">
      <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">
        <Suspense fallback={<p className="text-center text-on-surface-variant">Loading secure checkout...</p>}>
          <CheckoutContent />
        </Suspense>
      </div>
    </section>
  )
}
