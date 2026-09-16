import { test, expect } from "@playwright/test"
import {
  accesoPorEstadoSuscripcion,
  accesoTrasFalloDeCobro,
  datosDeSuscripcionDeFactura,
  esPrimerRechazo,
  idDeCliente,
  resumenDeAcceso,
  userIdDeSuscripcion,
} from "../src/lib/stripe/access"
import { hasAprobacionPagada, hasVigenteAcceso } from "../src/lib/membership"

/**
 * Política de cobros acordada: un cobro rechazado NO corta el acceso mientras
 * Stripe siga reintentando; se retira cuando Stripe se rinde, y cualquier pago
 * correcto lo devuelve. Estas pruebas fijan esa política.
 *
 * Run with: npx playwright test --config e2e/playwright.config.ts webhook-access.spec.ts
 */

test.describe("acceso según el estado de la suscripción", () => {
  test("mantiene el acceso en los estados vivos y en el período de reintentos", () => {
    for (const status of ["active", "trialing", "past_due"]) {
      expect(accesoPorEstadoSuscripcion(status), status).toBe(true)
    }
  })

  test("retira el acceso cuando Stripe se rinde", () => {
    for (const status of ["unpaid", "canceled", "paused", "incomplete_expired", "incomplete"]) {
      expect(accesoPorEstadoSuscripcion(status), status).toBe(false)
    }
  })

  test("no actúa ante un estado desconocido", () => {
    // Mejor no tocar nada que tocar mal: un estado nuevo de Stripe no debe
    // revocar accesos por accidente.
    expect(accesoPorEstadoSuscripcion("algo_nuevo")).toBeNull()
    expect(accesoPorEstadoSuscripcion(null)).toBeNull()
    expect(accesoPorEstadoSuscripcion(undefined)).toBeNull()
  })
})

test.describe("cobro rechazado", () => {
  test("con reintento programado mantiene el acceso", () => {
    expect(accesoTrasFalloDeCobro({ next_payment_attempt: 1_800_000_000 })).toBe(true)
  })

  test("sin reintentos (Stripe se rindió) retira el acceso", () => {
    expect(accesoTrasFalloDeCobro({ next_payment_attempt: null })).toBe(false)
    expect(accesoTrasFalloDeCobro({})).toBe(false)
  })

  test("solo el primer rechazo dispara el correo de aviso", () => {
    expect(esPrimerRechazo({ attempt_count: 0 })).toBe(true)
    expect(esPrimerRechazo({ attempt_count: 1 })).toBe(true)
    expect(esPrimerRechazo({ attempt_count: 2 })).toBe(false)
    expect(esPrimerRechazo({})).toBe(true)
  })

  test("el resumen distingue restaurar de revocar", () => {
    expect(resumenDeAcceso(true, "invoice in_1 paid")).toContain("restored")
    expect(resumenDeAcceso(false, "subscription unpaid")).toContain("revoked")
  })
})

test.describe("acceso = aprobación del admin y cobro al día", () => {
  const rows = (...r: [number | null, string | null][]) =>
    r.map(([tipo_miembro, estado]) => ({ tipo_miembro, estado }))

  test("un pago no sustituye la aprobación manual", () => {
    // Recién pagado: el dinero está, pero la revisión del admin sigue pendiente.
    expect(hasAprobacionPagada(rows([1, "pagada"]))).toBe(false)
    // Y sin aprobación no se concede acceso por mucho que el cobro funcione.
    expect(hasAprobacionPagada(rows([1, "incompleta"]))).toBe(false)
    expect(hasAprobacionPagada([])).toBe(false)
  })

  test("una renovación correcta sí devuelve el acceso a un miembro aprobado", () => {
    expect(hasAprobacionPagada(rows([1, "aprobada"]))).toBe(true)
    expect(hasAprobacionPagada(rows([2, "rechazada"], [2, "aprobada"]))).toBe(true)
  })

  test("un estudiante aprobado no entra por la vía de pago", () => {
    // Los estudiantes son gratis: su acceso es membresia_gratis, no una
    // suscripción, así que un evento de cobro nunca debe activarlos.
    expect(hasAprobacionPagada(rows([3, "aprobada"]))).toBe(false)
    expect(hasVigenteAcceso(rows([3, "aprobada"]))).toBe(true)
  })
})

test.describe("lectura de la factura (el bug de la API 2026)", () => {
  test("encuentra la suscripción en parent.subscription_details", () => {
    // Forma real de la API 2026-05-27: el campo top-level `invoice.subscription`
    // ya no existe, y leerlo dejaba la rama de renovaciones muerta.
    const datos = datosDeSuscripcionDeFactura({
      id: "in_123",
      customer: "cus_123",
      parent: { subscription_details: { subscription: "sub_123", metadata: { user_id: "user-1" } } },
    })
    expect(datos).toEqual({ subscriptionId: "sub_123", userId: "user-1", customerId: "cus_123" })
  })

  test("aguanta la suscripción expandida como objeto", () => {
    const datos = datosDeSuscripcionDeFactura({
      customer: { id: "cus_9" },
      parent: { subscription_details: { subscription: { id: "sub_9", metadata: { user_id: "user-9" } } } },
    })
    expect(datos.subscriptionId).toBe("sub_9")
    expect(datos.userId).toBe("user-9")
    expect(datos.customerId).toBe("cus_9")
  })

  test("las suscripciones antiguas no traen user_id (se resuelven por cliente)", () => {
    const datos = datosDeSuscripcionDeFactura({
      customer: "cus_V3RWoD1WeIi8dY",
      parent: { subscription_details: { subscription: "sub_vieja", metadata: {} } },
    })
    expect(datos.userId).toBeNull()
    expect(datos.customerId).toBe("cus_V3RWoD1WeIi8dY")
  })

  test("una factura sin suscripción no reporta ninguna", () => {
    const datos = datosDeSuscripcionDeFactura({ id: "in_x", customer: "cus_x", parent: null })
    expect(datos.subscriptionId).toBeNull()
  })

  test("resuelve el cliente venga como id o como objeto", () => {
    expect(idDeCliente("cus_1")).toBe("cus_1")
    expect(idDeCliente({ id: "cus_2" })).toBe("cus_2")
    expect(idDeCliente(null)).toBeNull()
    expect(idDeCliente(undefined)).toBeNull()
  })

  test("lee el user_id de la metadata de la suscripción", () => {
    expect(userIdDeSuscripcion({ metadata: { user_id: "u-1" } })).toBe("u-1")
    expect(userIdDeSuscripcion({ metadata: {} })).toBeNull()
    expect(userIdDeSuscripcion({})).toBeNull()
  })
})
