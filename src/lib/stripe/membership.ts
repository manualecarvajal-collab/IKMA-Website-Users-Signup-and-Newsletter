import { getStripe } from "@/lib/stripe/server"

export type MembershipPayments = {
  subscription: {
    status: string
    periodEnd: number | null
    cancelAtPeriodEnd: boolean
  } | null
  paid: { id: string; created: number; periodEnd: number | null; amountPaid: number; currency: string }[]
  open: { id: string; created: number; periodEnd: number | null; amountDue: number; currency: string }[]
  nextChargeDate: number | null
}

// Each billing period of the subscription is one invoice = one "cuota".
export async function getMembershipPayments(stripeCustomerId: string): Promise<MembershipPayments> {
  const stripe = getStripe()
  const empty: MembershipPayments = { subscription: null, paid: [], open: [], nextChargeDate: null }
  if (!stripe) return empty

  const [subs, invoices] = await Promise.all([
    stripe.subscriptions.list({ customer: stripeCustomerId, status: "all", limit: 1 }),
    stripe.invoices.list({ customer: stripeCustomerId, limit: 24 }),
  ])

  const sub = subs.data[0]
  const subPeriodEnd = sub
    ? Math.max(...sub.items.data.map((i) => i.current_period_end ?? 0), 0) || null
    : null
  const paid = []
  const open = []
  for (const inv of invoices.data) {
    const periodEnd = inv.lines?.data[0]?.period?.end ?? null
    if (inv.status === "paid") {
      paid.push({ id: inv.id, created: inv.created, periodEnd, amountPaid: inv.amount_paid, currency: inv.currency })
    } else if (inv.status === "open" || inv.status === "uncollectible") {
      open.push({ id: inv.id, created: inv.created, periodEnd, amountDue: inv.amount_due, currency: inv.currency })
    }
  }

  let nextChargeDate: number | null = null
  try {
    const upcoming = await stripe.invoices.createPreview({ customer: stripeCustomerId })
    nextChargeDate = upcoming.lines?.data[0]?.period?.end ?? upcoming.created
  } catch {
    // No upcoming invoice (e.g. canceled subscription)
  }

  return {
    subscription: sub
      ? { status: sub.status, periodEnd: subPeriodEnd, cancelAtPeriodEnd: sub.cancel_at_period_end }
      : null,
    paid,
    open,
    nextChargeDate,
  }
}