"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { elegirPermanencia } from "@/app/conferencia/actions"

/**
 * Aviso que sale UNA vez, al entrar por primera vez en este navegador.
 *
 * QUÉ DECIDE. Si la sesión debe sobrevivir al cierre del navegador. Es la
 * pregunta que explica el problema que traían los usuarios: algunos cerraban el
 * móvil, volvían y se encontraban el formulario otra vez, así que se inscribían
 * de nuevo sin saber que ya estaban dentro.
 *
 *   · «Mantener la sesión» → cookie de 180 días.
 *   · «Solo esta vez»      → cookie de sesión, que el navegador borra al cerrarse.
 *
 * La respuesta se guarda aparte, así que no se vuelve a preguntar.
 *
 * Por qué un modal: es una decisión sobre datos del usuario en su dispositivo, y
 * tiene que verla para poder contestarla. Aparece una sola vez, se cierra
 * eligiendo, y el foco entra en el botón principal.
 */
export default function AvisoSesion({ onCerrar }: { onCerrar: () => void }) {
  const t = useTranslations("Conferencia.sesion")
  const mantenerRef = useRef<HTMLButtonElement>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    mantenerRef.current?.focus()
    const previo = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const alPulsar = (e: KeyboardEvent) => {
      // Escape equivale a «solo esta vez»: cerrar sin decidir no puede dejar la
      // sesión permanente por omisión.
      if (e.key === "Escape") void elegir(false)
    }
    window.addEventListener("keydown", alPulsar)
    return () => {
      document.body.style.overflow = previo
      window.removeEventListener("keydown", alPulsar)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function elegir(permanecer: boolean) {
    if (enviando) return
    setEnviando(true)
    await elegirPermanencia(permanecer)
    onCerrar()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sesion-titulo"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B1C2C]/55 px-4 py-6 backdrop-blur-[2px] motion-safe:animate-[conf-velo_240ms_ease-out]"
    >
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-[26px] bg-white shadow-[0_30px_80px_rgba(6,18,32,0.45)] motion-safe:animate-[conf-aviso_420ms_cubic-bezier(0.22,1,0.36,1)]">
        <div className="flex items-center gap-3 border-b border-[#123045]/8 px-7 pb-5 pt-6">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF1F7] text-[#11324F]"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M12 3a4 4 0 0 0-4 4v3H7a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1V7a4 4 0 0 0-4-4Z" />
              <path d="M9 10V7a3 3 0 0 1 6 0v3" />
            </svg>
          </span>
          <h2 id="sesion-titulo" className="text-[19px] font-bold leading-tight text-[#123045]">
            {t("titulo")}
          </h2>
        </div>

        <div className="px-7 py-6">
          <p className="text-[14.5px] leading-[1.6] text-[#3C4A56]">{t("texto")}</p>
          <p className="mt-3 text-[13px] leading-[1.55] text-[#5F5F66]">{t("matiz")}</p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
            <button
              ref={mantenerRef}
              type="button"
              disabled={enviando}
              onClick={() => elegir(true)}
              className="rounded-full bg-[#11324F] px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#1F4D75] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11324F] focus-visible:ring-offset-2"
            >
              {t("mantener")}
            </button>
            <button
              type="button"
              disabled={enviando}
              onClick={() => elegir(false)}
              className="rounded-full border border-[#123045]/20 px-6 py-2.5 text-[14px] font-semibold text-[#123045] transition-colors hover:bg-[#F1F3F5] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11324F] focus-visible:ring-offset-2"
            >
              {t("soloEstaVez")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
