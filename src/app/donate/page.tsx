"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Icon from "@/components/Icon"

const AMOUNTS = [5, 10, 25, 50, 100]

export default function DonatePage() {
  const router = useRouter()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10)
  const [customAmount, setCustomAmount] = useState("")

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount

  const handleContinue = () => {
    if (!finalAmount || finalAmount <= 0) return
    router.push(`/donate/checkout?amount=${finalAmount}`)
  }

  return (
    <section className="py-section-padding bg-surface">
      <div className="max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
          <div className="text-center mb-8">
            <h1 className="font-headline-lg text-headline-md text-primary mb-2">
              Support This Mission
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
              Your generous donation helps IKMA provide medical care, education, and
              hope to communities around the world. Every gift makes a difference.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-3">
                Select an amount
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => { setSelectedAmount(amount); setCustomAmount("") }}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition ${
                      selectedAmount === amount && !customAmount
                        ? "border-primary text-primary bg-primary-container/20"
                        : "border-outline-variant/50 text-on-surface-variant bg-white hover:border-primary/50"
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="custom-amount">
                Or enter a custom amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                <input
                  id="custom-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
                  className="w-full rounded-xl bg-surface border border-outline-variant text-on-surface py-3 pl-8 pr-4 focus:border-primary focus:ring-0 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!finalAmount || finalAmount <= 0}
              className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-4 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Icon name="favorite" size={18} />
              Donate ${finalAmount || "0"}
            </button>

            <p className="text-center font-body-sm text-body-sm text-on-surface-variant/60">
              You will complete your donation securely on the next page, powered by Stripe.
            </p>

            <div className="border-t border-outline-variant/30 pt-6">
              <p className="text-center font-body-sm text-body-sm text-on-surface-variant/70 leading-relaxed">
                Donations to IKMA LLC are voluntary and support our mission of advancing
                health equity, education, and holistic transformation. IKMA LLC is a
                for-profit limited liability company and is not recognized as a tax-exempt
                charitable organization under Section 501(c)(3) of the Internal Revenue
                Code, so your donation may not be tax-deductible. Donations are generally
                non-refundable. Please review our{" "}
                <a href="/donor-rights" className="text-primary hover:underline">
                  Donor Rights Policy
                </a>{" "}
                for full details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
