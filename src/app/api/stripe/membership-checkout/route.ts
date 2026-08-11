import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
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

  if (solicitud.estado !== "pendiente") {
    return NextResponse.json({ error: "Solicitud ya procesada" }, { status: 409 })
  }

  const priceId = PRICE_IDS[solicitud.tipo_miembro]?.[solicitud.region]?.[opcion]
  if (!priceId) {
    return NextResponse.json({ error: "Invalid pricing configuration" }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    ui_mode: "embedded_page",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    return_url: `${siteUrl}/suscripcion-exito`,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      solicitud_id: solicitudId,
      tipo_miembro: String(solicitud.tipo_miembro),
      region: solicitud.region,
      payment_option: String(opcion),
    },
  })

  return NextResponse.json({ clientSecret: session.client_secret })
}