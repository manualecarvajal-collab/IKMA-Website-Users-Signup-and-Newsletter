import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import FondoBarras from "@/components/conferencia/FondoBarras"
import "../fondo.css"

/**
 * Página de aterrizaje para los enlaces ANTIGUOS.
 *
 * Los correos de bienvenida que se enviaron antes del cambio de mecanismo
 * llevaban a `/conferencia/entrar?t=…`: un enlace firmado que marcaba el
 * navegador como «dentro» del directo. Ese sistema ya no existe —la conferencia
 * se emite por Zoom y el enlace de la reunión llega por correo—, así que quien
 * abra uno de esos correos aterrizaría en un 404.
 *
 * En vez de un 404 (o de una redirección silenciosa, que deja al usuario sin
 * saber por qué su enlace ya no hace lo mismo), esta página explica qué ha
 * cambiado y cuándo recibirá el enlace bueno. El token de la URL se ignora a
 * propósito: su valor está en el correo, y aquí no desbloquea nada.
 *
 * NO lleva `ConferenciaNav`: la píldora flotante de la landing se coloca
 * siguiendo las secciones del riel, y aquí no hay riel. Un cierre limpio con un
 * solo botón es todo lo que hace falta en una página de cortesía.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Conferencia.entrar")
  return {
    title: t("metaTitle"),
    description: t("texto"),
    // Es una página de cortesía para un enlace muerto: no tiene nada que hacer
    // en un buscador.
    robots: { index: false, follow: false },
  }
}

export default async function EntrarPage() {
  const t = await getTranslations("Conferencia.entrar")

  return (
    <>
      <FondoBarras />

      <main className="relative flex min-h-svh items-center justify-center px-5 py-16">
        <div className="w-full max-w-[560px] rounded-[28px] bg-white px-7 py-9 text-center shadow-[0_24px_70px_rgba(4,14,32,0.16)] md:px-12 md:py-12">
          <span className="inline-block rounded-full bg-[#E7EEFF] px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#0435CF]">
            {t("badge")}
          </span>

          <h1 className="mt-4 text-[24px] font-bold leading-[1.2] text-[#123045] md:text-[30px]">
            {t("titulo")}
          </h1>

          <p className="mx-auto mt-3 max-w-[42ch] text-[15px] leading-[1.6] text-[#3C4A56]">
            {t("texto")}
          </p>

          {/* El dato que la persona ha venido a buscar: cuándo le llega. */}
          <p className="mt-5 rounded-[16px] bg-[#F4F7FA] px-4 py-3 text-[14.5px] font-semibold leading-[1.5] text-[#11324F]">
            {t("aviso")}
          </p>

          <Link
            href="/conferencia"
            className="mt-6 inline-block rounded-full bg-[#11324F] px-7 py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#1F4D75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11324F] focus-visible:ring-offset-2"
          >
            {t("cta")}
          </Link>

          <p className="mt-4 text-[12.5px] leading-[1.5] text-[#5F5F66]">{t("pie")}</p>
        </div>
      </main>
    </>
  )
}
