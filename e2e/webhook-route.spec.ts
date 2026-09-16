import { test, expect } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import { POST } from "../src/app/api/stripe/webhook/route"

/**
 * Prueba de integración del webhook: llama a la función POST real con eventos
 * sintéticos firmados con el secreto real. Verifica firma, guarda de modo test,
 * tolerancia a la migración pendiente y que un evento de un miembro inexistente
 * no rompa ni toque datos.
 *
 * Usa el `.env.local` del proyecto (por eso se salta si no está). Los eventos
 * usan ids/cliente ficticios que nunca coinciden con un miembro real.
 *
 * Run with: npx playwright test --config e2e/playwright.config.ts webhook-route.spec.ts
 */

function cargarEnvLocal() {
  const p = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(p)) return
  for (const linea of fs.readFileSync(p, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(linea)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "")
  }
}
cargarEnvLocal()

const SECRETO = process.env.STRIPE_WEBHOOK_SECRET
const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const CLAVE_LIVE = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_")

// Cliente y suscripción que no existen: ninguna ruta de código puede tocar un
// miembro real con estos datos.
const CLIENTE_FALSO = "cus_TEST_PROBE_IKMA"
const SUSCRIPCION_FALSA = "sub_TEST_PROBE_IKMA"

function firmar(payload: string): string {
  const t = Math.floor(Date.now() / 1000)
  const v1 = crypto.createHmac("sha256", SECRETO!).update(`${t}.${payload}`).digest("hex")
  return `t=${t},v1=${v1}`
}

function factura(eventId: string, type: string, livemode = true) {
  return JSON.stringify({
    id: eventId,
    object: "event",
    type,
    livemode,
    api_version: "2026-05-27.dahlia",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: "in_TEST_PROBE_IKMA",
        object: "invoice",
        customer: CLIENTE_FALSO,
        status: type === "invoice.payment_failed" ? "open" : "paid",
        attempt_count: 1,
        next_payment_attempt: type === "invoice.payment_failed" ? 1_900_000_000 : null,
        parent: {
          subscription_details: { subscription: SUSCRIPCION_FALSA, metadata: {} },
        },
      },
    },
  })
}

function evento(eventId: string, type: string, livemode = true) {
  const esFactura = type.startsWith("invoice.")
  const objeto = esFactura
    ? JSON.parse(factura(eventId, type, livemode)).data.object
    : {
        id: SUSCRIPCION_FALSA,
        object: "subscription",
        customer: CLIENTE_FALSO,
        status: type === "customer.subscription.deleted" ? "canceled" : "unpaid",
        metadata: {},
        items: { data: [{ current_period_end: 1_900_000_000 }] },
      }
  return JSON.stringify({
    id: eventId,
    object: "event",
    type,
    livemode,
    api_version: "2026-05-27.dahlia",
    created: Math.floor(Date.now() / 1000),
    data: { object: objeto },
  })
}

async function enviar(payload: string, firma?: string) {
  const req = new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(firma ? { "stripe-signature": firma } : {}),
    },
    body: payload,
  })
  const res = await POST(req)
  return { status: res.status, body: await res.json() }
}

async function limpiarEvento(id: string) {
  if (!URL_SUPABASE || !SERVICE_KEY) return
  await fetch(`${URL_SUPABASE}/rest/v1/stripe_events?event_id=eq.${id}`, {
    method: "DELETE",
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  }).catch(() => {})
}

async function tablaDeEventosExiste(): Promise<boolean> {
  if (!URL_SUPABASE || !SERVICE_KEY) return false
  const res = await fetch(`${URL_SUPABASE}/rest/v1/stripe_events?select=event_id&limit=1`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  })
  return res.ok
}

test.beforeAll(() => {
  test.skip(!SECRETO || !process.env.STRIPE_SECRET_KEY, "Falta .env.local con las claves de Stripe")
})

test("una firma inválida se rechaza con 400", async () => {
  const payload = evento("evt_probe_firma", "ping.probe")
  const res = await enviar(payload, "t=1,v1=deadbeef")
  expect(res.status).toBe(400)
  expect(res.body.error).toBe("Invalid signature")
})

test("sin cabecera de firma se rechaza con 400", async () => {
  const res = await enviar(evento("evt_probe_sin_firma", "ping.probe"))
  expect(res.status).toBe(400)
})

test("un evento de modo test se ignora en producción", async () => {
  test.skip(!CLAVE_LIVE, "La clave no es live: la guarda de modo test no aplica")
  const res = await enviar(evento("evt_probe_test_mode", "invoice.payment_succeeded", false), firmar(evento("evt_probe_test_mode", "invoice.payment_succeeded", false)))
  expect(res.status).toBe(200)
  expect(res.body.ignored).toBe("test_mode")
})

test("un evento no manejado responde 200 sin efectos", async () => {
  const payload = evento("evt_probe_noop", "ping.probe")
  const res = await enviar(payload, firmar(payload))
  expect(res.status).toBe(200)
  expect(res.body.received).toBe(true)
  await limpiarEvento("evt_probe_noop")
})

test("una factura pagada de un miembro inexistente no rompe ni toca datos", async () => {
  const payload = evento("evt_probe_invoice", "invoice.payment_succeeded")
  const res = await enviar(payload, firmar(payload))
  // 200 = procesado sin efectos; 500 solo sería aceptable por un fallo real de DB.
  expect(res.status).toBe(200)
  expect(res.body.received).toBe(true)
  await limpiarEvento("evt_probe_invoice")
})

test("un cobro rechazado de un miembro inexistente no rompe", async () => {
  const payload = evento("evt_probe_failed", "invoice.payment_failed")
  const res = await enviar(payload, firmar(payload))
  expect(res.status).toBe(200)
  await limpiarEvento("evt_probe_failed")
})

test("la cancelación de una suscripción inexistente no rompe", async () => {
  const payload = evento("evt_probe_deleted", "customer.subscription.deleted")
  const res = await enviar(payload, firmar(payload))
  expect(res.status).toBe(200)
  await limpiarEvento("evt_probe_deleted")
})

test("un user_id inválido en la metadata no revienta el webhook", async () => {
  // `getUserById` lanza si el id no es UUID, y la metadata la puede escribir
  // cualquiera desde el dashboard de Stripe: debe caer al respaldo por cliente.
  const id = `evt_probe_baduser_${Date.now()}`
  const payload = JSON.stringify({
    id,
    object: "event",
    type: "invoice.payment_succeeded",
    livemode: true,
    api_version: "2026-05-27.dahlia",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: "in_TEST_PROBE_IKMA",
        object: "invoice",
        customer: CLIENTE_FALSO,
        status: "paid",
        parent: { subscription_details: { subscription: SUSCRIPCION_FALSA, metadata: { user_id: "no-soy-un-uuid" } } },
      },
    },
  })
  const res = await enviar(payload, firmar(payload))
  expect(res.status).toBe(200)
  await limpiarEvento(id)
})

test("el mismo evento entregado dos veces no se procesa dos veces", async () => {
  test.skip(!(await tablaDeEventosExiste()), "Falta aplicar la migración 00044 (stripe_events)")
  const id = `evt_probe_dup_${Date.now()}`
  const payload = evento(id, "invoice.payment_succeeded")

  const primera = await enviar(payload, firmar(payload))
  expect(primera.status).toBe(200)
  expect(primera.body.duplicate).toBeUndefined()

  const segunda = await enviar(payload, firmar(payload))
  expect(segunda.status).toBe(200)
  expect(segunda.body.duplicate).toBe(true)

  await limpiarEvento(id)
})
