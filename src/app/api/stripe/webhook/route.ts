import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe/server"
import { createAdminClient } from "@/lib/supabase/server"
import { sendPaymentConfirmedEmail } from "@/lib/supabase/email-actions"

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

  const supabase = await createAdminClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object
      const userId = session.metadata?.user_id
      const solicitudId = session.metadata?.solicitud_id

      if (!userId) return NextResponse.json({ received: true })

      let errores = false
      if (solicitudId) {
        const { error } = await supabase
          .from("solicitudes_membresia")
          .update({ estado: "pagada" })
          .eq("id", solicitudId)
        if (error) {
          console.error("[webhook] solicitud update error:", error.message)
          errores = true
        }
      }

      // Access is granted only after an admin approves the membership.
      // Here we only record the customer id so renewals/cancellations still work.
      const { error: perfilError } = await supabase
        .from("perfiles")
        .update({
          stripe_customer_id: session.customer,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
      if (perfilError) {
        console.error("[webhook] perfiles update error:", perfilError.message)
        errores = true
      }

      // Only users whose payment was recorded without errors get the confirmation email
      if (!errores && solicitudId) {
        try {
          const { data: solicitud } = await supabase
            .from("solicitudes_membresia")
            .select("language")
            .eq("id", solicitudId)
            .single()
          const { data: { user } } = await supabase.auth.admin.getUserById(userId)
          const email = user?.email
          if (email) {
            const nombre =
              (user?.user_metadata?.nombre_completo as string) || email.split("@")[0] || ""
            await sendPaymentConfirmedEmail({
              email,
              nombre,
              lang: solicitud?.language === "es" ? "es" : "en",
            })
          }
        } catch (err) {
          console.error("[webhook] confirmation email error:", err)
        }
      }
      break
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object
      const customerId = invoice.customer as string | null
      if (!customerId) break

      if ((invoice as { subscription?: unknown }).subscription) {
        await supabase
          .from("perfiles")
          .update({ suscripcion_activa: true, updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", customerId)
      }
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object
      const customerId = subscription.customer
      if (!customerId) break

      await supabase
        .from("perfiles")
        .update({ suscripcion_activa: false, updated_at: new Date().toISOString() })
        .eq("stripe_customer_id", customerId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
