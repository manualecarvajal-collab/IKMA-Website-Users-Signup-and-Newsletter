"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Icon from "@/components/Icon"

const AMOUNTS = [5, 10, 25, 50, 100]

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10)
  const [customAmount, setCustomAmount] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? "")
        supabase
          .from("perfiles")
          .select("nombre_completo")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data?.nombre_completo) setName(data.nombre_completo)
          })
      }
    })
  }, [])

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount

  const handleDonate = () => {
    if (!finalAmount || finalAmount <= 0) return
    const paypalUrl = `https://www.paypal.com/donate?business=YOUR_PAYPAL_EMAIL&amount=${finalAmount}&currency_code=USD&item_name=IKMA+Donation`
    window.open(paypalUrl, "_blank")
  }

  return (
    <section className="py-section-padding bg-surface">
      <div className="max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="favorite" size={32} className="text-primary" />
            </div>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="donor-name">
                  Name
                </label>
                <input
                  id="donor-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                />
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="donor-email">
                  Email
                </label>
                <input
                  id="donor-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleDonate}
              disabled={!finalAmount || finalAmount <= 0}
              className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-4 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Icon name="favorite" size={18} />
              Donate ${finalAmount || "0"} via PayPal
            </button>

            <p className="text-center font-body-sm text-body-sm text-on-surface-variant/60">
              You will be redirected to PayPal to complete your donation securely.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
