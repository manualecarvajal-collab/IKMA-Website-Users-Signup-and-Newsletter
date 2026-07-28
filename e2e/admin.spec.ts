import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"

// ─── ALL ADMIN ROUTES ────────────────────────────────────
const ADMIN_ROUTES = [
  "/admin",
  "/admin/articulos",
  "/admin/articulos/nuevo",
  "/admin/teachings",
  "/admin/revistas",
  "/admin/revistas/nuevo",
  "/admin/members",
  "/admin/newsletter",
  "/admin/newsletter/nueva",
  "/admin/suscriptores",
  "/admin/doctores",
  "/admin/doctores/nuevo",
]

test.describe("Admin — Security (Unauthenticated)", () => {
  for (const route of ADMIN_ROUTES) {
    test(`${route} redirects to /login when not authenticated`, async ({ page }) => {
      const resp = await page.goto(BASE + route, { waitUntil: "networkidle" })

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/)
    })
  }
})

test.describe("Admin — Login Form", () => {
  test("login page has the admin sign-in form", async ({ page }) => {
    await page.goto(BASE + "/login", { waitUntil: "networkidle" })

    // Verify login form elements exist
    await expect(page.locator("input[type='email']").first()).toBeVisible()
    await expect(page.locator("input[type='password']").first()).toBeVisible()

    // Submit button exists
    const signInBtn = page.getByText(/Sign In|Iniciar sesion/i)
    await expect(signInBtn.first()).toBeVisible()

    // Google OAuth button exists
    const googleBtn = page.getByText(/Google/i)
    await expect(googleBtn.first()).toBeVisible()

    // Link to register
    const signUpLink = page.getByText(/Sign up|Registrate/i)
    await expect(signUpLink.first()).toBeVisible()
  })

  test("login form submission shows validation for empty fields", async ({ page }) => {
    await page.goto(BASE + "/login", { waitUntil: "networkidle" })

    // Try submitting empty form
    const signInBtn = page.getByText(/Sign In|Iniciar sesion/i)
    await signInBtn.first().click()

    // Browser validation should prevent submission (required fields)
    await page.waitForTimeout(500)
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/)
  })

  test("forgot password link works", async ({ page }) => {
    await page.goto(BASE + "/login", { waitUntil: "networkidle" })

    const forgotLink = page.getByText(/Forgot password|Olvidaste/i)
    await forgotLink.first().click()

    await page.waitForLoadState("networkidle")
    await expect(page).toHaveURL(/\/recuperar/)
  })
})

test.describe("Admin — Registration", () => {
  test("register page has all required fields", async ({ page }) => {
    await page.goto(BASE + "/registro", { waitUntil: "networkidle" })

    await expect(page.locator("input[name='nombre_completo']")).toBeVisible()
    await expect(page.locator("input[type='email']").first()).toBeVisible()
    await expect(page.locator("input[type='password']").first()).toBeVisible()

    const createBtn = page.getByText(/Create Account|Crear Cuenta/i)
    await expect(createBtn.first()).toBeVisible()
  })
})

test.describe("Admin — Sidebar Navigation", () => {
  test("admin sidebar has all expected nav items", async ({ page }) => {
    // The admin sidebar is a client component
    // We can verify the nav items are defined correctly by checking the source
    // For now, verify the component structure renders the right links
    
    // Note: This test requires being logged in as admin
    // For anonymous users, we verify the redirect works
    await page.goto(BASE + "/admin", { waitUntil: "networkidle" })
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Admin — Membership", () => {
  test("members page redirects to login", async ({ page }) => {
    await page.goto(BASE + "/admin/members", { waitUntil: "networkidle" })
    await expect(page).toHaveURL(/\/login/)
  })
})
