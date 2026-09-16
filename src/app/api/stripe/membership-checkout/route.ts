import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { PRICE_IDS } from "@/app/membresia/data"
import { listLiveSubscriptions } from "@/lib/stripe/subscriptions"

type StripeClient = NonNullable<ReturnType<typeof getStripe>>

// One member = one Stripe customer, reused for every payment.
//
// Letting Checkout create the customer (the previous behaviour) minted a new
// one per completed payment and then overwrote perfiles.stripe_customer_id, so
// any earlier subscription stopped matching a profile: its renewals were
// invisible and the member could end up with two live subscriptions.
async function ensureCustomer(
  stripe: StripeClient,
  userId: string,
  email: string | undefined,
  existing: string | null
): Promise<string> {
  if (existing) {
    try {
      const customer = await stripe.customers.retrieve(existing)
      if (!customer.deleted) return existing
    } catch (err) {
      // A stale id (customer deleted in the dashboard, or a test-mode id in a
      // live key) would otherwise dead-end every future checkout for this user.
      if ((err as { code?: string }).code !== "resource_missing") throw err
      console.warn("[membership-checkout] stripe_customer_id invalido, se recrea:", existing)
    }
  }

  const customer = await stripe.customers.create(
    { email: email || undefined, metadata: { user_id: userId } },
    // Two parallel requests from the same user reuse the in-flight creation.
    { idempotencyKey: `ikma-customer-${userId}` }
  )
  return customer.id
}

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

  const { solicitudId, paymentOption } = await req.json()

  if (!solicitudId) {
    return NextResponse.json({ error: "Solicitud ID required" }, { status: 400 })
  }

  const opcion = Number(paymentOption)
  if (![1, 2, 3].includes(opcion)) {
    return NextResponse.json({ error: "Invalid payment option" }, { status: 400 })
  }

  // Fetch from DB instead of trusting client-supplied tipoMiembro/region
  const admin = await createAdminClient()
  const { data: solicitud, error } = await admin
    .from("solicitudes_membresia")
    .select("id, tipo_miembro, region, estado")
    .eq("id", solicitudId)
    .eq("usuario_id", user.id)
    .single()

  if (error || !solicitud) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
  }

  // Card applicants start as "incompleta" (form filled, payment pending);
  // zelle applicants are "pendiente" until manually verified. Either way they
  // may (re)open a Stripe checkout session. Approved/rejected/paid applications
  // cannot be re-processed.
  if (!["pendiente", "incompleta"].includes(solicitud.estado)) {
    return NextResponse.json({ error: "Solicitud ya procesada" }, { status: 409 })
  }

  const priceId = PRICE_IDS[solicitud.tipo_miembro]?.[solicitud.region]?.[opcion]
  if (!priceId) {
    return NextResponse.json({ error: "Invalid pricing configuration" }, { status: 400 })
  }

  const { data: perfil } = await admin
    .from("perfiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single()

  // Refuse a second subscription for a member who already has a live one: it
  // would double-charge them, and only one of the two could be tracked by the
  // webhook. /perfil already lets them cancel, resume or update the card.
  if (perfil?.stripe_customer_id) {
    const live = await listLiveSubscriptions(perfil.stripe_customer_id)
    if (live.length) {
      return NextResponse.json({ error: "already_subscribed" }, { status: 409 })
    }
  }

  const customerId = await ensureCustomer(stripe, user.id, user.email ?? undefined, perfil?.stripe_customer_id ?? null)

  // Persist the customer before the payment: the webhook matches renewals by
  // stripe_customer_id, so a first invoice arriving before
  // checkout.session.completed would otherwise find no profile to update.
  if (perfil?.stripe_customer_id !== customerId) {
    const { error: customerError } = await admin
      .from("perfiles")
      .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq("id", user.id)
    if (customerError) {
      console.error("[membership-checkout] no se pudo guardar stripe_customer_id:", customerError.message)
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const metadata = {
    user_id: user.id,
    solicitud_id: solicitudId,
    tipo_miembro: String(solicitud.tipo_miembro),
    region: solicitud.region,
    payment_option: String(opcion),
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    ui_mode: "embedded_page",
    payment_method_types: ["card"],
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    return_url: `${siteUrl}/suscripcion-exito`,
    client_reference_id: user.id,
    metadata,
    // The same metadata on the subscription itself, so renewals and the Stripe
    // dashboard identify the member without going through the session.
    subscription_data: { metadata },
  })

  return NextResponse.json({ clientSecret: session.client_secret })
}