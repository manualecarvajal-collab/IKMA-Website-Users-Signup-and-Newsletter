import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe/server"

export async function POST(req: Request) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 503 })
  }

  const { amount } = await req.json()
  const cents = Math.round(Number(amount) * 100)
  if (!Number.isFinite(cents) || cents < 100 || cents > 999900) {
    return NextResponse.json({ error: "Invalid donation amount" }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ui_mode: "embedded_page",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: cents,
          product_data: { name: "IKMA Donation" },
        },
      },
    ],
    return_url: `${siteUrl}/donate/checkout?donation=success`,
  })

  return NextResponse.json({ clientSecret: session.client_secret })
}
