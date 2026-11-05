import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import FondoBarras from "@/components/conferencia/FondoBarras"
import FormularioAcceso from "@/components/conferencia/FormularioAcceso"
import "../fondo.css"

/**
 * Iniciar sesión, sin contraseña.
 *
 * La sesión de la conferencia vive en una cookie de ESTE navegador, así que
 * quien se inscribió en el móvil y entra desde el portátil veía el formulario
 * otra vez —y se volvía a inscribir—. Aquí escribe su correo y recibe un enlace
 * firmado que abre la sesión donde lo abra.
 *
 * `?error=enlace|registro` lo pone la ruta que canjea ese enlace cuando algo no
 * cuadra, para poder decírselo en vez de dejarlo en una página en blanco.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Conferencia.acceso")
  return {
    title: t("metaTitle"),
    description: t("texto"),
    // Es una pantalla de paso: no interesa que la indexe nadie.
    robots: { index: false, follow: false },
  }
}

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const t = await getTranslations("Conferencia.acceso")

  return (
    <>
      <FondoBarras />

      <main className="relative flex min-h-svh items-center justify-center px-5 py-16">
        <div className="w-full max-w-[520px] rounded-[28px] bg-white px-7 py-9 shadow-[0_24px_70px_rgba(4,14,32,0.16)] md:px-12 md:py-12">
          <FormularioAcceso errorInicial={error} />

          <div className="mt-7 border-t border-[#E7EAEE] pt-4 text-center">
            <Link
              href="/conferencia"
              className="text-[13px] font-semibold text-[#5F5F66] underline-offset-2 hover:text-[#11324F] hover:underline"
            >
              {t("volverLanding")}
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
