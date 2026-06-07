import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 503 })
  }

  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const userId = session.metadata?.user_id

    if (userId) {
      const supabase = await createAdminClient()
      await supabase
        .from("perfiles")
        .update({ suscripcion_activa: true, updated_at: new Date().toISOString() })
        .eq("id", userId)
    }
  }

  return NextResponse.json({ received: true })
}
