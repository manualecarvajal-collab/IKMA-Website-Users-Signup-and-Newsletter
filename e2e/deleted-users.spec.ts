import { test, expect } from "@playwright/test"
import {
  ESTADO_ELIMINADO,
  estadoPrevio,
  motivoLabel,
  nombreEliminado,
  pendientesDeCancelar,
  snapshotsDeMiembros,
  type SnapshotEliminado,
} from "../src/lib/deleted-accounts"
import { hasVigenteAcceso, statusColors, statusLabels } from "../src/lib/membership"

/**
 * Rules behind "a user can always delete their account, and the admin still
 * sees it": who shows up in which list, what the deleted rows say, and which
 * Stripe cancellations still need retrying.
 *
 * Pure logic, no network: safe to run against a live environment.
 *
 * Run with: npx playwright test --config e2e/playwright.config.ts deleted-users.spec.ts
 */

function snapshot(over: Partial<SnapshotEliminado> = {}): SnapshotEliminado {
  return {
    id: "snap-1",
    usuario_id: "user-1",
    email: "ana@example.com",
    nombre_completo: "Ana Pérez",
    rol: "lector",
    motivo: "usuario",
    eliminado_por_nombre: null,
    tipo_miembro: 1,
    region: "B",
    estado_solicitud: "aprobada",
    stripe_customer_id: "cus_123",
    suscripcion_cancelada: true,
    detalle: null,
    visto_at: null,
    usuario_created_at: "2026-01-05T10:00:00Z",
    deleted_at: "2026-09-16T10:00:00Z",
    ...over,
  }
}

test.describe("deleted account snapshots", () => {
  test("has its own status in both admin lists", () => {
    expect(ESTADO_ELIMINADO).toBe("eliminado")
    // The badge has to render, not fall back to a grey "unknown" chip.
    expect(statusLabels[ESTADO_ELIMINADO]).toBe("Deleted")
    expect(statusColors[ESTADO_ELIMINADO]).toBeTruthy()
  })

  test("names a row even when the profile had no name", () => {
    expect(nombreEliminado(snapshot())).toBe("Ana Pérez")
    expect(nombreEliminado(snapshot({ nombre_completo: null }))).toBe("ana@example.com")
    expect(nombreEliminado(snapshot({ nombre_completo: "  ", email: null }))).toBe("Deleted account")
  })

  test("says who deleted the account", () => {
    expect(motivoLabel(snapshot({ motivo: "usuario" }))).toBe("Deleted by the user")
    expect(motivoLabel(snapshot({ motivo: "admin", eliminado_por_nombre: "Board" }))).toBe(
      "Deleted by an admin (Board)"
    )
    // An admin deletion without a recorded name still reads correctly.
    expect(motivoLabel(snapshot({ motivo: "admin", eliminado_por_nombre: null }))).toBe(
      "Deleted by an admin"
    )
  })

  test("keeps the membership status the account had when it left", () => {
    expect(estadoPrevio(snapshot())).toBe("Approved")
    expect(estadoPrevio(snapshot({ estado_solicitud: "incompleta" }))).toBe("Incomplete")
    expect(estadoPrevio(snapshot({ estado_solicitud: null }))).toBeNull()
  })

  test("only ex-applicants belong in the members list", () => {
    const miembros = snapshotsDeMiembros([
      snapshot({ id: "m1", tipo_miembro: 2 }),
      snapshot({ id: "r1", tipo_miembro: null, estado_solicitud: null }),
      snapshot({ id: "m2", tipo_miembro: 3 }),
    ])
    // A plain reader who deleted their account is a user, not a member.
    expect(miembros.map((s) => s.id)).toEqual(["m1", "m2"])
  })

  test("retries only the cancellations Stripe did not confirm", () => {
    const pendientes = pendientesDeCancelar([
      snapshot({ id: "ok", suscripcion_cancelada: true }),
      snapshot({ id: "pendiente", suscripcion_cancelada: false }),
      // Nothing to cancel: the account never had a subscription.
      snapshot({ id: "sin-cliente", suscripcion_cancelada: false, stripe_customer_id: null }),
    ])
    expect(pendientes.map((s) => s.id)).toEqual(["pendiente"])
  })

  test("a deleted account never grants access on its own", () => {
    // The snapshot is an audit record, not an entitlement.
    expect(hasVigenteAcceso([{ tipo_miembro: 1, estado: ESTADO_ELIMINADO }])).toBe(false)
    expect(hasVigenteAcceso([{ tipo_miembro: 3, estado: ESTADO_ELIMINADO }])).toBe(false)
  })
})
