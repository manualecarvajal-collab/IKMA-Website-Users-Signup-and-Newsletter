import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe/server"
import { createClient } from "@/lib/supabase/server"
import { PRICE_IDS } from "@/app/membresia/data"

export async function POST(req: Request) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { tipoMiembro, region, solicitudId, paymentOption } = await req.json()

  const priceId = PRICE_IDS[tipoMiembro]?.[region]?.[paymentOption]
  if (!priceId) {
    return NextResponse.json({ error: "Invalid pricing" }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/suscripcion-exito`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/membresia`,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      solicitud_id: solicitudId,
      tipo_miembro: String(tipoMiembro),
      region,
      payment_option: String(paymentOption),
    },
  })

  return NextResponse.json({ url: session.url })
}
