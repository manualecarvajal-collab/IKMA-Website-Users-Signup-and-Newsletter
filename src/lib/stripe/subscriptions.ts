import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe/server"

// Billing lifecycle helpers shared by the self-service flows (/perfil, account
// deletion) and the admin flows (reject / delete application, delete user).
//
// Every Stripe call in the app that can stop money from moving lives here, so
// the question "what counts as a live subscription?" has exactly one answer.
// The client is injectable so the cancellation rules can be tested without
// touching the live account.

type StripeClient = NonNullable<ReturnType<typeof getStripe>>

// Statuses Stripe will never charge again for: canceled, an expired first
// payment, or a subscription whose creation was never paid for.
const DEAD_STATUSES = new Set(["canceled", "incomplete_expired", "incomplete"])

export type BillingActionResult = {
  /** Subscription ids we successfully acted on. */
  cancelled: string[]
  /** Subscription ids Stripe refused to touch, with the reason. */
  failed: { id: string; error: string }[]
}

export function isLiveSubscription(sub: Stripe.Subscription): boolean {
  return !DEAD_STATUSES.has(sub.status)
}

// current_period_end moved to the subscription items in the 2026 API versions.
export function currentPeriodEnd(sub: Stripe.Subscription): number | null {
  return Math.max(...sub.items.data.map((i) => i.current_period_end ?? 0), 0) || null
}

/**
 * Subscriptions that can still produce a charge (active, trialing, past_due,
 * unpaid, paused). Used both to cancel billing and to refuse a second checkout.
 */
export async function listLiveSubscriptions(
  customerId: string | null,
  client?: StripeClient
): Promise<Stripe.Subscription[]> {
  const stripe = client ?? getStripe()
  if (!stripe || !customerId) return []

  const subs: Stripe.Subscription[] = []
  for await (const sub of stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  })) {
    if (isLiveSubscription(sub)) subs.push(sub)
  }
  return subs
}

/**
 * Stops billing for a customer.
 *
 * `atPeriodEnd` keeps the current paid period (the member paid for it, so the
 * access stays until Stripe fires `customer.subscription.deleted`); the default
 * cancels immediately, which is what a revocation or an account deletion needs.
 *
 * Never throws: callers decide what to do with `failed`, and an empty result
 * means there was nothing to cancel.
 */
export async function cancelCustomerSubscriptions(
  customerId: string | null,
  options: { atPeriodEnd?: boolean; client?: StripeClient } = {}
): Promise<BillingActionResult> {
  const result: BillingActionResult = { cancelled: [], failed: [] }
  const stripe = options.client ?? getStripe()
  if (!stripe || !customerId) return result

  for (const sub of await listLiveSubscriptions(customerId, stripe)) {
    try {
      if (options.atPeriodEnd) {
        // Already scheduled to end: nothing to do, and it counts as cancelled.
        if (!sub.cancel_at_period_end) {
          await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true })
        }
      } else {
        await stripe.subscriptions.cancel(sub.id)
      }
      result.cancelled.push(sub.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[stripe] could not cancel ${sub.id} (${sub.status}):`, message)
      result.failed.push({ id: sub.id, error: message })
    }
  }
  return result
}

/**
 * Undoes a "cancel at period end" so the membership renews again.
 */
export async function resumeCustomerSubscriptions(
  customerId: string | null,
  client?: StripeClient
): Promise<BillingActionResult> {
  const result: BillingActionResult = { cancelled: [], failed: [] }
  const stripe = client ?? getStripe()
  if (!stripe || !customerId) return result

  for (const sub of await listLiveSubscriptions(customerId, stripe)) {
    if (!sub.cancel_at_period_end) continue
    try {
      await stripe.subscriptions.update(sub.id, { cancel_at_period_end: false })
      result.cancelled.push(sub.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[stripe] could not resume ${sub.id}:`, message)
      result.failed.push({ id: sub.id, error: message })
    }
  }
  return result
}
