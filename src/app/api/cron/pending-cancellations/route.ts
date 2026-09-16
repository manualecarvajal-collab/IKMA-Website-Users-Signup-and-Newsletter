import { NextResponse } from "next/server"
import { reintentarCancelacionesPendientes } from "@/lib/supabase/deleted-users"

// Vercel Cron — daily.
//
// Deleting an account never waits for Stripe (the member's decision must go
// through even if the API is down), so a subscription that could not be
// cancelled at that moment stays marked as pending in the snapshot. This job
// retries it every day until Stripe confirms, which is what guarantees that
// nobody keeps being charged after their account is gone.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await reintentarCancelacionesPendientes()
  if (result.fallidas > 0) {
    console.error("[cron-pending-cancellations] cancelaciones que Stripe sigue rechazando:", result)
  }

  return NextResponse.json(result)
}

export const dynamic = "force-dynamic"
