import { test, expect } from "@playwright/test"
import { embedSrcSeguro, extraerEmbedSrc } from "../src/lib/video-embed"
import { extensionSegura, randomStoragePathForUser, rutaLicenciaValida } from "../src/lib/storage-paths"
import { puedeCambiarPlan } from "../src/lib/membership"

/**
 * Puertas de acceso (bloque 3): que el muro de pago no se pueda saltar, que los
 * expedientes no se puedan cruzar entre solicitantes y que una membresía pagada
 * no se pueda recalificar sola.
 *
 * Todo lógica pura: sin red y sin base de datos.
 *
 * Run with: npx playwright test --config e2e/playwright.config.ts access-gates.spec.ts
 */

test.describe("embed de video", () => {
  test("acepta solo https de los proveedores permitidos", () => {
    expect(embedSrcSeguro("https://subsplash.com/u/emmint/media/embed/d/abc")).toContain("subsplash.com")
    expect(embedSrcSeguro("https://www.youtube.com/embed/xyz")).toContain("youtube.com")
    expect(embedSrcSeguro("https://player.vimeo.com/video/123")).toContain("vimeo.com")
  })

  test("extrae la URL del bloque iframe que pega el admin", () => {
    const snippet = '<div class="sap-embed-player"><iframe src="https://subsplash.com/u/x/media/embed/d/dqw3" frameborder="0"></iframe></div>'
    expect(embedSrcSeguro(snippet)).toBe("https://subsplash.com/u/x/media/embed/d/dqw3")
  })

  test("rechaza http, otros dominios y valores vacíos", () => {
    // Un embed http se bloquearía en el navegador; otro dominio podría cargar
    // contenido ajeno dentro del sitio.
    expect(embedSrcSeguro("http://subsplash.com/u/x")).toBeNull()
    expect(embedSrcSeguro("https://evil.example.com/x")).toBeNull()
    expect(embedSrcSeguro("javascript:alert(1)")).toBeNull()
    expect(embedSrcSeguro("")).toBeNull()
    expect(embedSrcSeguro(null)).toBeNull()
    expect(embedSrcSeguro(undefined)).toBeNull()
  })

  test("guarda el src tal cual, sin validar (el admin puede añadir proveedores)", () => {
    expect(extraerEmbedSrc('<iframe src="https://nuevo-proveedor.com/e/1"></iframe>')).toBe("https://nuevo-proveedor.com/e/1")
    expect(extraerEmbedSrc("https://suelto.com/x")).toBe("https://suelto.com/x")
  })
})

test.describe("rutas de expedientes", () => {
  const USER = "9c7ea0d0-95c8-4841-9963-2e37ffcaa804"

  test("acepta la ruta generada para el propio usuario", () => {
    const path = randomStoragePathForUser(USER, "licencia.pdf")
    expect(rutaLicenciaValida(path, USER)).toBe(true)
    expect(path.startsWith(`${USER}/`)).toBe(true)
  })

  test("rechaza la carpeta de otro solicitante", () => {
    const ajena = randomStoragePathForUser("b166e092-5e13-44d9-89a9-bbb74190f1ef", "licencia.pdf")
    expect(rutaLicenciaValida(ajena, USER)).toBe(false)
  })

  test("rechaza retrocesos de carpeta y subcarpetas", () => {
    expect(rutaLicenciaValida(`${USER}/../otro/expediente.pdf`, USER)).toBe(false)
    expect(rutaLicenciaValida(`${USER}/sub/expediente.pdf`, USER)).toBe(false)
    expect(rutaLicenciaValida("../expediente.pdf", USER)).toBe(false)
    expect(rutaLicenciaValida("", USER)).toBe(false)
    expect(rutaLicenciaValida(null, USER)).toBe(false)
    // El prefijo del usuario no basta si no hay separador.
    expect(rutaLicenciaValida(`${USER}otro.pdf`, USER)).toBe(false)
  })

  test("la extensión no puede colar barras ni arrastrar el nombre", () => {
    expect(extensionSegura("licencia.pdf")).toBe("pdf")
    expect(extensionSegura("foto.JPEG")).toBe("jpeg")
    expect(extensionSegura("x.a/b")).toBe("bin")
    expect(extensionSegura("sinextension")).toBe("bin")
    expect(extensionSegura("raro.tar.gz")).toBe("gz")
  })
})

test.describe("cambio de categoría", () => {
  test("se permite mientras no haya dinero de por medio", () => {
    expect(puedeCambiarPlan("incompleta")).toBe(true)
    expect(puedeCambiarPlan("pendiente")).toBe(true)
    expect(puedeCambiarPlan("rechazada")).toBe(true)
    expect(puedeCambiarPlan(null)).toBe(true)
  })

  test("se bloquea una vez pagada o aprobada", () => {
    // Si no, alguien que paga la cuota de Residente puede recalificarse como
    // Licenciado (o cambiar de región) sin que Stripe se entere.
    expect(puedeCambiarPlan("pagada")).toBe(false)
    expect(puedeCambiarPlan("aprobada")).toBe(false)
  })
})
