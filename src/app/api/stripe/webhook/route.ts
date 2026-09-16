import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe/server"
import { createAdminClient } from "@/lib/supabase/server"
import {
  accesoPorEstadoSuscripcion,
  accesoTrasFalloDeCobro,
  datosDeSuscripcionDeFactura,
  esPrimerRechazo,
  idDeCliente,
  userIdDeSuscripcion,
} from "@/lib/stripe/access"
import {
  aplicarAcceso,
  eventoYaProcesado,
  marcarEventoProcesado,
  resolverMiembro,
} from "@/lib/supabase/stripe-sync"
import { enviarCorreoPagoConfirmado, enviarCorreoPagoRechazado } from "@/lib/supabase/payment-email"

// Stripe webhook.
//
// Contract with Stripe: return 2xx only when the effect is fully applied. A
// failure returns 500 so Stripe retries instead of the change being lost
// silently, and every processed event is recorded so a redelivery does not
// repeat the side effects (Stripe delivers at-least-once).

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

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // A test-mode event arriving at a live endpoint means a misconfigured webhook:
  // never let it touch production data.
  const claveLive = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_")
  if (claveLive && !event.livemode) {
    console.warn("[webhook] evento de modo test ignorado en producción:", event.id, event.type)
    return NextResponse.json({ received: true, ignored: "test_mode" })
  }

  const admin = await createAdminClient()

  if (await eventoYaProcesado(admin, event.id)) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  const errores: string[] = []
  let resumen = "ignored"

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object
      const userId = session.metadata?.user_id
      const solicitudId = session.metadata?.solicitud_id
      if (!userId) break

      // Card-only checkout, so "paid" is the normal outcome. Anything else means
      // the money is not in yet and the application must not look settled.
      if (session.payment_status !== "paid") {
        resumen = `session ${session.id} completed with payment_status=${session.payment_status}: not marked as paid`
        console.warn("[webhook]", resumen)
        break
      }

      if (solicitudId) {
        const { error } = await admin
          .from("solicitudes_membresia")
          .update({ estado: "pagada" })
          .eq("id", solicitudId)
        if (error) {
          console.error("[webhook] solicitud update error:", error.message)
          errores.push(`solicitud:${error.message}`)
        }
      }

      // Access is still granted by the admin approval; here we only record the
      // customer so renewals and the billing portal keep working.
      const customerId = idDeCliente(session.customer)
      if (customerId) {
        const { error } = await admin
          .from("perfiles")
          .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
          .eq("id", userId)
        if (error) {
          console.error("[webhook] perfiles update error:", error.message)
          errores.push(`perfil:${error.message}`)
        }
      }

      if (!errores.length && solicitudId) {
        await enviarCorreoPagoConfirmado(userId, solicitudId)
      }
      resumen = `checkout completed (solicitud ${solicitudId ?? "-"})`
      break
    }

    // Both mean "this invoice got paid": one is the invoice-level event, the
    // other its charge-level twin, and they must behave identically.
    case "invoice.payment_succeeded":
    case "invoice.paid": {
      const invoice = event.data.object
      const { userId, customerId, subscriptionId } = datosDeSuscripcionDeFactura(invoice)

      // Invoices not tied to a subscription (one-off charges) are none of this
      // handler's business.
      if (!subscriptionId) {
        resumen = `invoice ${invoice.id} not linked to a subscription`
        break
      }

      const miembro = await resolverMiembro(admin, { userId, customerId })
      if (!miembro) {
        resumen = `invoice ${invoice.id}: member not found`
        console.warn("[webhook]", resumen)
        break
      }

      const { acceso, cambio } = await aplicarAcceso(admin, miembro.userId, true, `invoice ${invoice.id} paid`)
      resumen = `invoice ${invoice.id} paid -> access=${acceso}${cambio ? " (changed)" : ""}`
      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object
      const { userId, customerId, subscriptionId } = datosDeSuscripcionDeFactura(invoice)
      if (!subscriptionId) break

      const miembro = await resolverMiembro(admin, { userId, customerId })
      if (!miembro) {
        resumen = `invoice ${invoice.id} failed: member not found`
        break
      }

      // Keep access while Stripe still has a retry scheduled; revoke when it has
      // given up. A declined card must not cost a member their membership on the
      // first attempt, but an unpaid one cannot stay open forever.
      const sigueReintentando = accesoTrasFalloDeCobro(invoice)
      const { acceso } = await aplicarAcceso(
        admin,
        miembro.userId,
        sigueReintentando,
        `invoice ${invoice.id} failed (attempt ${invoice.attempt_count ?? "?"})`
      )

      if (esPrimerRechazo(invoice) || !sigueReintentando) {
        await enviarCorreoPagoRechazado(miembro, { definitivo: !sigueReintentando })
      }

      await admin.from("actividad_admin").insert({
        usuario_id: miembro.userId,
        usuario_nombre: miembro.nombre || miembro.email || "Member",
        tipo: "suscripcion_pago_rechazado",
        descripcion: `Payment failed (attempt ${invoice.attempt_count ?? "?"})${sigueReintentando ? ", Stripe will retry" : ", no more retries"}`,
        ref_tabla: "perfiles",
        ref_id: miembro.userId,
      })

      resumen = `invoice ${invoice.id} failed -> access=${acceso} retry=${sigueReintentando}`
      break
    }

    case "customer.subscription.updated": {
      const sub = event.data.object
      const acceso = accesoPorEstadoSuscripcion(sub.status)
      if (acceso === null) {
        resumen = `subscription ${sub.id}: unknown status ${sub.status}`
        break
      }

      const miembro = await resolverMiembro(admin, {
        userId: userIdDeSuscripcion(sub),
        customerId: idDeCliente(sub.customer),
      })
      if (!miembro) {
        resumen = `subscription ${sub.id} (${sub.status}): member not found`
        break
      }

      const resultado = await aplicarAcceso(admin, miembro.userId, acceso, `subscription ${sub.status}`)
      resumen = `subscription ${sub.id} ${sub.status} -> access=${resultado.acceso}${resultado.cambio ? " (changed)" : ""}`
      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object
      const miembro = await resolverMiembro(admin, {
        userId: userIdDeSuscripcion(sub),
        customerId: idDeCliente(sub.customer),
      })
      if (!miembro) {
        resumen = `subscription ${sub.id} deleted: member not found`
        break
      }

      const { cambio } = await aplicarAcceso(admin, miembro.userId, false, "subscription deleted")
      resumen = `subscription ${sub.id} deleted -> access=false${cambio ? " (changed)" : ""}`
      break
    }

    default:
      resumen = `unhandled type ${event.type}`
  }

  // A 500 makes Stripe retry with backoff, which is exactly what we want: the
  // event is only marked as processed once its effects landed.
  if (errores.length) {
    console.error("[webhook] efectos incompletos, se pedirá reintento:", errores)
    return NextResponse.json({ error: "processing failed", details: errores }, { status: 500 })
  }

  await marcarEventoProcesado(admin, event, resumen)
  return NextResponse.json({ received: true })
}
