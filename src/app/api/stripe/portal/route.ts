import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe/server"
import { createClient } from "@/lib/supabase/server"

// Members have no way to pay a declined invoice or replace an expired card in
// the app, so without this they simply churn when their card dies. The portal
// only exposes what the Stripe configuration allows: card update and invoice
// history (plan changes and cancellation stay off - the site owns those).
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const stripe = getStripe()
  if (!stripe) return NextResponse.redirect(`${siteUrl}/perfil?billing=unavailable`)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${siteUrl}/login`)

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single()

  if (!perfil?.stripe_customer_id) return NextResponse.redirect(`${siteUrl}/perfil?billing=none`)

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: perfil.stripe_customer_id,
      return_url: `${siteUrl}/perfil`,
    })
    return NextResponse.redirect(session.url)
  } catch (err) {
    console.error("[stripe-portal] error:", err instanceof Error ? err.message : err)
    return NextResponse.redirect(`${siteUrl}/perfil?billing=error`)
  }
}
