import { test, expect } from "@playwright/test"
import {
  cancelCustomerSubscriptions,
  currentPeriodEnd,
  isLiveSubscription,
  listLiveSubscriptions,
  resumeCustomerSubscriptions,
} from "../src/lib/stripe/subscriptions"
import { hasVigenteAcceso } from "../src/lib/membership"

/**
 * Billing rules that decide who stops being charged (audit finding A1).
 *
 * Get these wrong and members keep paying for nothing, or an approved member
 * loses their subscription because an admin rejected a duplicate application.
 * No network and no Stripe account needed: the Stripe client is faked, so this
 * file is pure logic and safe to run against a live environment.
 *
 * Run with: npx playwright test --config e2e/playwright.config.ts billing.spec.ts
 */

type FakeSub = {
  id: string
  status: string
  cancel_at_period_end: boolean
  items: { data: { current_period_end: number | null }[] }
}
type FakeClient = Parameters<typeof listLiveSubscriptions>[1]

function sub(id: string, status: string, cancelAtPeriodEnd = false, periodEnd = 1_800_000_000): FakeSub {
  return {
    id,
    status,
    cancel_at_period_end: cancelAtPeriodEnd,
    items: { data: [{ current_period_end: periodEnd }] },
  }
}

function fakeStripe(subs: FakeSub[], failFor: string[] = []) {
  const updates: { id: string; params: unknown }[] = []
  const cancels: string[] = []
  const lists: unknown[] = []

  const client = {
    subscriptions: {
      list(params: unknown) {
        lists.push(params)
        return {
          async *[Symbol.asyncIterator]() {
            for (const s of subs) yield s
          },
        }
      },
      async update(id: string, params: unknown) {
        if (failFor.includes(id)) throw new Error(`stripe refused ${id}`)
        updates.push({ id, params })
        return {}
      },
      async cancel(id: string) {
        if (failFor.includes(id)) throw new Error(`stripe refused ${id}`)
        cancels.push(id)
        return {}
      },
    },
  }

  return { client: client as unknown as FakeClient, updates, cancels, lists }
}

test.describe("stripe subscription lifecycle", () => {
  test("classifies subscription statuses", () => {
    for (const dead of ["canceled", "incomplete_expired", "incomplete"]) {
      expect(isLiveSubscription(sub("x", dead) as never), `${dead} must be dead`).toBe(false)
    }
    for (const live of ["active", "trialing", "past_due", "unpaid", "paused"]) {
      expect(isLiveSubscription(sub("x", live) as never), `${live} must be live`).toBe(true)
    }
  })

  test("reads the period end from the subscription items", () => {
    expect(
      currentPeriodEnd({ items: { data: [{ current_period_end: 100 }, { current_period_end: 300 }] } } as never)
    ).toBe(300)
    expect(currentPeriodEnd({ items: { data: [{ current_period_end: null }] } } as never)).toBeNull()
  })

  test("lists only subscriptions that can still produce a charge", async () => {
    const { client } = fakeStripe([sub("a", "active"), sub("b", "canceled"), sub("c", "past_due")])
    const live = await listLiveSubscriptions("cus_1", client)
    expect(live.map((s) => s.id)).toEqual(["a", "c"])
  })

  test("does nothing without a customer id", async () => {
    const { client, lists } = fakeStripe([sub("a", "active")])
    expect(await listLiveSubscriptions(null, client)).toEqual([])
    expect(lists).toHaveLength(0)
  })

  test("cancels every live subscription, ignoring dead ones", async () => {
    const { client, cancels } = fakeStripe([
      sub("live1", "active"),
      sub("live2", "past_due"),
      sub("dead", "canceled"),
    ])
    const result = await cancelCustomerSubscriptions("cus_1", { client })

    expect(cancels).toEqual(["live1", "live2"])
    expect(result.cancelled).toEqual(["live1", "live2"])
    expect(result.failed).toEqual([])
  })

  test("self-service cancel schedules the period end instead of cutting it", async () => {
    const { client, cancels, updates } = fakeStripe([sub("live1", "active"), sub("live2", "active", true)])
    const result = await cancelCustomerSubscriptions("cus_1", { client, atPeriodEnd: true })

    // Never a hard cancel: the member paid for the current period.
    expect(cancels).toEqual([])
    expect(updates).toEqual([{ id: "live1", params: { cancel_at_period_end: true } }])
    // Already-scheduled subscriptions count as cancelled without a second call.
    expect(result.cancelled).toEqual(["live1", "live2"])
  })

  test("resume clears the flag only on scheduled subscriptions", async () => {
    const { client, updates } = fakeStripe([sub("scheduled", "active", true), sub("normal", "active")])
    const result = await resumeCustomerSubscriptions("cus_1", client)

    expect(updates).toEqual([{ id: "scheduled", params: { cancel_at_period_end: false } }])
    expect(result.cancelled).toEqual(["scheduled"])
  })

  test("one failing subscription does not block the others", async () => {
    const { client, cancels } = fakeStripe([sub("boom", "active"), sub("ok", "active")], ["boom"])
    const result = await cancelCustomerSubscriptions("cus_1", { client })

    expect(cancels).toEqual(["ok"])
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0].id).toBe("boom")
  })
})

test.describe("membership entitlement", () => {
  const rows = (...r: [number | null, string | null][]) =>
    r.map(([tipo_miembro, estado]) => ({ tipo_miembro, estado }))

  test("keeps access for approved and paid members", () => {
    expect(hasVigenteAcceso(rows([1, "aprobada"]))).toBe(true)
    // Money is in and the admin verdict is pending: billing must stay alive.
    expect(hasVigenteAcceso(rows([1, "pagada"]))).toBe(true)
    expect(hasVigenteAcceso(rows([3, "aprobada"]))).toBe(true)
  })

  test("grants nothing without an approval", () => {
    expect(hasVigenteAcceso(rows([1, "rechazada"]))).toBe(false)
    expect(hasVigenteAcceso(rows([4, "incompleta"]))).toBe(false)
    expect(hasVigenteAcceso(rows([3, "pendiente"]))).toBe(false)
    // Students never pay, so a "pagada" student row is not an entitlement.
    expect(hasVigenteAcceso(rows([3, "pagada"]))).toBe(false)
    expect(hasVigenteAcceso([])).toBe(false)
  })

  test("rejecting a duplicate never revokes a member who is still approved", () => {
    expect(hasVigenteAcceso(rows([1, "rechazada"], [1, "aprobada"]))).toBe(true)
    expect(hasVigenteAcceso(rows([3, "rechazada"], [3, "aprobada"]))).toBe(true)
  })
})
