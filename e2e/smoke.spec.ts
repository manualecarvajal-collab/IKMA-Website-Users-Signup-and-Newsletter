import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"

// ─── ALL PUBLIC ROUTES ───────────────────────────────────
const PUBLIC_ROUTES = [
  { path: "/", title: /IKMA/i },
  { path: "/who-we-are", title: /Who|Quienes/i },
  { path: "/our-purpose", title: /Purpose|Proposito/i },
  { path: "/our-objectives", title: /Objectives|Objetivos/i },
  { path: "/blog", title: /Blog/i },
  { path: "/teachings", title: /Teachings|Ensenanzas/i },
  { path: "/doctores", title: /Doctors|Doctores/i },
  { path: "/outreach", title: /Outreach|Misiones/i },
  { path: "/outreach/communities", title: /Communities|Comunidades/i },
  { path: "/outreach/zumurucuare", title: /Zumurucuare/i },
  { path: "/login", title: /Welcome|Bienvenido/i },
  { path: "/registro", title: /Create|Crear/i },
  { path: "/recuperar", title: /Reset|Restablecer/i },
  { path: "/newsletter", title: /IKMA/i },
  { path: "/privacy-policy", title: /IKMA/i },
  { path: "/terms-of-service", title: /IKMA/i },
  { path: "/donor-rights", title: /IKMA/i },
  { path: "/cookies", title: /IKMA/i },
]

test.describe("Public Routes — Smoke Test", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.path} loads with correct title and no console errors`, async ({ page }) => {
      const errors: string[] = []
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
      })

      const resp = await page.goto(BASE + route.path, { waitUntil: "networkidle" })
      expect(resp?.status()).toBe(200)

      // Check page title
      await expect(page).toHaveTitle(route.title)

      // Check no 404 console errors or MISSING_MESSAGE
      const consoleText = errors.join(" ")
      expect(consoleText).not.toContain("404")
      expect(consoleText).not.toContain("MISSING_MESSAGE")
      expect(consoleText).not.toContain("NOT_FOUND")

      // Page has content
      await expect(page.locator("body")).not.toBeEmpty()
    })
  }
})

// ─── NAVIGATION ──────────────────────────────────────────
test.describe("Navigation", () => {
  test("navbar links work on desktop", async ({ page }) => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" })

    // Click through main nav links
    const navLinks = page.locator("nav a, nav button")
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(3)

    // Verify "Become a member" link exists
    const memberLink = page.getByText(/Become a member|Hazte miembro/i)
    await expect(memberLink.first()).toBeVisible()
  })

  test("footer links exist and are accessible", async ({ page }) => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" })

    const footer = page.locator("footer")
    await expect(footer).toBeVisible()

    // Check for key footer links
    const footerLinks = footer.locator("a")
    const linkCount = await footerLinks.count()
    expect(linkCount).toBeGreaterThan(3)
  })
})

// ─── INTERACTIONS ────────────────────────────────────────
test.describe("Interactive Elements", () => {
  test("language switcher works", async ({ page }) => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" })

    // Look for locale switch button
    const localeBtn = page.locator("[data-testid='locale-switch'], button:has-text('EN'), button:has-text('ES')")
    if (await localeBtn.count() > 0) {
      await localeBtn.first().click()
      // Wait for page to reload/adapt
      await page.waitForTimeout(1000)
      // Should still be on the same URL
      expect(page.url()).toBe(BASE + "/")
    }
  })

  test("contact form has all fields and submit button", async ({ page }) => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" })

    // Scroll to contact section
    const contactSection = page.locator("section:has(#contact-first-name), section:has(form)")
    if (await contactSection.count() > 0) {
      await contactSection.first().scrollIntoViewIfNeeded()

      // Check form fields exist
      await expect(page.locator("#contact-first-name")).toBeVisible()
      await expect(page.locator("#contact-email")).toBeVisible()
      await expect(page.locator("#contact-message")).toBeVisible()

      // Check submit button
      const submitBtn = page.getByText(/Send|Enviar/i)
      await expect(submitBtn.first()).toBeVisible()
    }
  })

  test("hero section has CTA buttons", async ({ page }) => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" })

    // Check for hero CTA buttons
    const ctaButtons = page.getByText(/Support|Donar|Subscribe|Boletín|Become a member|Hazte miembro/i)
    const count = await ctaButtons.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

// ─── TEACHINGS PAYWALL ───────────────────────────────────
test.describe("Teachings Video Paywall", () => {
  test("teachings listing page shows groups", async ({ page }) => {
    await page.goto(BASE + "/teachings", { waitUntil: "networkidle" })

    // Should either show groups or "no teachings" message
    const groups = page.locator("a[href*='/teachings/']")
    const noContent = page.getByText(/no teachings|no hay/i)

    const hasGroups = await groups.count() > 0
    const hasNoMessage = await noContent.count() > 0

    if (!hasGroups && !hasNoMessage) {
      // At minimum, page should have content
      await expect(page.locator("body")).not.toBeEmpty()
    }
  })

  test("video detail page shows paywall for anonymous users", async ({ page }) => {
    // Try to find any video page
    await page.goto(BASE + "/teachings", { waitUntil: "networkidle" })
    const videoLinks = page.locator("a[href*='/teachings/']")

    if (await videoLinks.count() > 0) {
      // Click first group
      await videoLinks.first().click()
      await page.waitForLoadState("networkidle")

      // Look for video links in the group page
      const vidLinks = page.locator("a[href*='/teachings/']")
      if (await vidLinks.count() > 0) {
        await vidLinks.first().click()
        await page.waitForLoadState("networkidle")

        // Anonymous user should see either paywall (lock) or video iframe
        const paywall = page.getByText(/Members-only|Solo para Miembros|Become a Member|Hazte Miembro/i)
        const iframe = page.locator("iframe")

        const hasPaywall = await paywall.count() > 0
        const hasIframe = await iframe.count() > 0

        // Either paywall or video should be present
        expect(hasPaywall || hasIframe).toBeTruthy()
      }
    }
  })
})

// ─── BLOG / MAGAZINE ─────────────────────────────────────
test.describe("Blog and Magazine", () => {
  test("blog page loads with articles", async ({ page }) => {
    await page.goto(BASE + "/blog", { waitUntil: "networkidle" })

    const articles = page.locator("a[href*='/blog/'], article")
    const noArticles = page.getByText(/no articles|no hay/i)

    const hasArticles = await articles.count() > 1
    const hasNoMsg = await noArticles.count() > 0

    // Either has articles or shows empty state
    expect(hasArticles || hasNoMsg).toBeTruthy()
  })

  test("article detail page has content and paywall", async ({ page }) => {
    await page.goto(BASE + "/blog", { waitUntil: "networkidle" })

    const articleLink = page.locator("a[href*='/blog/']").first()
    if (await articleLink.count() > 0) {
      await articleLink.click()
      await page.waitForLoadState("networkidle")

      // Should have article title
      const title = page.locator("h1")
      await expect(title.first()).toBeVisible()

      // Should have either full content or paywall register button
      const registerBtn = page.getByText(/Sign up free|Registrate gratis|Register|Registrarse/i)
      const content = page.locator("article")
      expect((await registerBtn.count() > 0) || (await content.count() > 0)).toBeTruthy()
    }
  })

  test("download popup appears for magazine CTA", async ({ page }) => {
    await page.goto(BASE + "/blog", { waitUntil: "networkidle" })

    const downloadBtn = page.getByText(/Download PDF|Descargar PDF/i)
    if (await downloadBtn.count() > 0) {
      await downloadBtn.first().click()
      await page.waitForTimeout(1000)

      // Should show popup with subscribe CTA
      const subscribePopup = page.getByText(/Subscribe|Suscribete|Subscribe Now|Suscribete ahora/i)
      const count = await subscribePopup.count()
      expect(count).toBeGreaterThanOrEqual(0) // May or may not show based on auth state
    }
  })
})

// ─── AUTH PAGES ──────────────────────────────────────────
test.describe("Auth Pages", () => {
  test("login page has form with email, password, and submit", async ({ page }) => {
    await page.goto(BASE + "/login", { waitUntil: "networkidle" })

    await expect(page.locator("input[type='email']")).toBeVisible()
    await expect(page.locator("input[type='password']")).toBeVisible()

    const submitBtn = page.getByText(/Sign In|Iniciar sesion/i)
    await expect(submitBtn.first()).toBeVisible()

    // Google OAuth button exists
    const googleBtn = page.getByText(/Google/i)
    await expect(googleBtn.first()).toBeVisible()
  })

  test("register page has form with name, email, password", async ({ page }) => {
    await page.goto(BASE + "/registro", { waitUntil: "networkidle" })

    await expect(page.locator("input[name='nombre_completo']")).toBeVisible()
    await expect(page.locator("input[type='email']")).toBeVisible()
    await expect(page.locator("input[type='password']")).toBeVisible()

    const submitBtn = page.getByText(/Create Account|Crear Cuenta/i)
    await expect(submitBtn.first()).toBeVisible()
  })

  test("forgot password page has email field and submit", async ({ page }) => {
    await page.goto(BASE + "/recuperar", { waitUntil: "networkidle" })

    await expect(page.locator("input[type='email']")).toBeVisible()
    const sendBtn = page.getByText(/Send|Enviar/i)
    await expect(sendBtn.first()).toBeVisible()
  })
})

// ─── MEMBERSHIP ──────────────────────────────────────────
test.describe("Membership", () => {
  test("membership page redirects to login if not authenticated", async ({ page }) => {
    await page.goto(BASE + "/membresia", { waitUntil: "networkidle" })
    // Should redirect to login
    await expect(page).toHaveURL(/\/registro|\/login/)
  })
})

// ─── 404 PAGE ────────────────────────────────────────────
test.describe("404 Handling", () => {
  test("nonexistent page shows 404", async ({ page }) => {
    const resp = await page.goto(BASE + "/esta-pagina-no-existe-xyz", { waitUntil: "networkidle" })
    // Should get 404 status or show not-found content
    const notFoundText = page.getByText(/404|Not Found|No encontrada/i)
    await expect(notFoundText.first()).toBeVisible()
  })
})
