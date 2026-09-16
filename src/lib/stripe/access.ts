// Decides what a billing event means for a member's access.
//
// The rule (agreed policy): a declined renewal does NOT cut access while Stripe
// is still retrying — that is how good-faith members with an expired card get
// lost. Access is only revoked once Stripe gives up (`unpaid` / `canceled`),
// and any successful payment restores it.
//
// Pure functions on purpose: this is the money-adjacent logic most worth
// pinning with tests, and it must not depend on the Stripe SDK.

/** Statuses where the subscription is alive or still being collected. */
const CON_ACCESO = new Set(["active", "trialing", "past_due"])

/** Statuses where Stripe has stopped trying to collect. */
const SIN_ACCESO = new Set(["unpaid", "canceled", "paused", "incomplete_expired", "incomplete"])

/**
 * ¿El estado de la suscripción habilita el acceso?
 * `null` = estado desconocido: no tocar nada (mejor no actuar que actuar mal).
 */
export function accesoPorEstadoSuscripcion(status: string | null | undefined): boolean | null {
  if (!status) return null
  if (CON_ACCESO.has(status)) return true
  if (SIN_ACCESO.has(status)) return false
  return null
}

/**
 * Un cobro rechazado mientras Stripe tenga programado otro intento mantiene el
 * acceso; cuando ya no hay reintentos, es el momento de retirarlo.
 */
export function accesoTrasFalloDeCobro(invoice: {
  next_payment_attempt?: number | null
}): boolean {
  return invoice.next_payment_attempt != null
}

/** ¿Es el primer rechazo? Solo entonces vale la pena mandar el correo. */
export function esPrimerRechazo(invoice: { attempt_count?: number | null }): boolean {
  return (invoice.attempt_count ?? 0) <= 1
}

/** Resumen legible para el log de eventos y la actividad del panel. */
export function resumenDeAcceso(acceso: boolean, motivo: string): string {
  return acceso ? `Access restored (${motivo})` : `Access revoked (${motivo})`
}

// --- Extracción de datos de los objetos de Stripe -------------------------
//
// Aislado aquí (y probado) porque es donde estaba el fallo: en las versiones de
// API de 2026 la suscripción de una factura vive en
// `parent.subscription_details`, NO en el campo `invoice.subscription` que usaba
// el código anterior. Al leer el campo equivocado, la rama de renovaciones nunca
// se ejecutaba: el cobro entraba y el acceso no se actualizaba.

export type FacturaMinima = {
  id?: string
  customer?: string | { id: string } | null
  parent?: {
    subscription_details?: {
      // Stripe lo tipa como `string | Subscription`: llega como id, pero puede
      // venir expandido como objeto si alguien recupera la factura con expand.
      subscription?: string | { id?: string; metadata?: Record<string, string> | null } | null
      metadata?: Record<string, string> | null
    } | null
  } | null
}

export type SuscripcionMinima = {
  id?: string
  status?: string | null
  customer?: string | { id: string } | null
  metadata?: Record<string, string> | null
}

export function idDeCliente(customer: FacturaMinima["customer"]): string | null {
  if (!customer) return null
  return typeof customer === "string" ? customer : customer.id
}

export function datosDeSuscripcionDeFactura(invoice: FacturaMinima) {
  const detalles = invoice.parent?.subscription_details
  const sub = detalles?.subscription

  return {
    subscriptionId: typeof sub === "string" ? sub : sub?.id ?? null,
    /**
     * `user_id` llega desde `subscription_data.metadata` en los checkouts
     * nuevos; si la suscripción viene expandida, la metadata puede estar ahí.
     */
    userId: detalles?.metadata?.user_id ?? (typeof sub === "object" ? sub?.metadata?.user_id ?? null : null),
    customerId: idDeCliente(invoice.customer),
  }
}

/** `user_id` de la suscripción; null en las creadas antes de añadir metadata. */
export function userIdDeSuscripcion(sub: SuscripcionMinima): string | null {
  return sub.metadata?.user_id ?? null
}
