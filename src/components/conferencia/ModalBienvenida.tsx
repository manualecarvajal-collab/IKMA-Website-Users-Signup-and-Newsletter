"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { reenviarEnlace } from "@/app/conferencia/actions"

/**
 * Aviso emergente que aparece UNA vez, justo después de confirmar el código.
 *
 * POR QUÉ UN MODAL, Y POR QUÉ SOLO AQUÍ.
 *
 * Lo normal sería no interrumpir. Aquí la interrupción está justificada y es la
 * única del recorrido: el usuario acaba de terminar algo y su siguiente paso NO
 * está en esta pantalla —está en su bandeja de correo—, así que si no se lo
 * decimos aquí, se queda mirando una página que no le explica por qué ya no ve
 * el formulario y pensará que tiene que inscribirse otra vez. Es la duda exacta
 * que hay que evitar el día de la conferencia.
 *
 * Por eso: aparece una sola vez, en ese momento, se cierra con Escape, con la
 * equis o pulsando fuera, y el foco entra en el botón principal al abrirse.
 */
export default function ModalBienvenida({
  email,
  onCerrar,
}: {
  email: string
  onCerrar: () => void
}) {
  const t = useTranslations("Conferencia.form")
  const cerrarRef = useRef<HTMLButtonElement>(null)
  const [aviso, setAviso] = useState("")
  const [enviando, setEnviando] = useState(false)

  // Foco al abrir, y Escape para cerrar. Y bloqueo del scroll de detrás: si el
  // fondo se mueve mientras el aviso está delante, el aviso deja de ser un aviso.
  useEffect(() => {
    cerrarRef.current?.focus()
    const previo = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar()
    }
    window.addEventListener("keydown", alPulsar)
    return () => {
      document.body.style.overflow = previo
      window.removeEventListener("keydown", alPulsar)
    }
  }, [onCerrar])

  async function reenviar() {
    setEnviando(true)
    setAviso("")
    const r = await reenviarEnlace(email)
    setEnviando(false)
    if (r.ok) return setAviso(t("confirmadoReenviado"))
    if (r.motivo === "espera") return setAviso(t("confirmadoEspera"))
    return setAviso(t("confirmadoError"))
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bienvenida-titulo"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B1C2C]/55 px-4 py-6 backdrop-blur-[2px] motion-safe:animate-[conf-velo_240ms_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[26px] bg-white shadow-[0_30px_80px_rgba(6,18,32,0.45)] motion-safe:animate-[conf-aviso_420ms_cubic-bezier(0.22,1,0.36,1)]">
        {/* Cabecera: el icono dibujado, en el azul de la casa. */}
        <div className="flex items-center gap-3 border-b border-[#123045]/8 px-7 pb-5 pt-6">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF1F7] text-[#11324F]"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9A1.5 1.5 0 0 1 19.5 18h-15A1.5 1.5 0 0 1 3 16.5v-9Z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </span>
          <div>
            <h2
              id="bienvenida-titulo"
              className="text-[19px] font-bold leading-tight text-[#123045]"
            >
              {t("bienvenidaTitulo")}
            </h2>
            <p className="mt-0.5 text-[12.5px] font-semibold text-[#11324F]">
              {t("bienvenidaSaludo")}
            </p>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onCerrar}
            aria-label={t("bienvenidaCerrar")}
            className="ml-auto -mr-1 flex h-9 w-9 items-center justify-center rounded-full text-[#8A8A8E] transition-colors hover:bg-[#F1F3F5] hover:text-[#123045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11324F]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="px-7 py-6">
          <p className="text-[14px] leading-[1.6] text-[#3C4A56]">{t("bienvenidaTexto")}</p>

          {/* El recordatorio, destacado: es LA información que evita que el día
              del evento vuelva a inscribirse. */}
          <p className="mt-4 rounded-[14px] bg-[#F4F7FA] px-4 py-3 text-[14px] font-semibold leading-[1.55] text-[#11324F]">
            {t("bienvenidaRecordatorio")}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-full bg-[#11324F] px-7 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#1F4D75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11324F] focus-visible:ring-offset-2"
            >
              {t("bienvenidaCta")}
            </button>
            <button
              type="button"
              onClick={reenviar}
              disabled={enviando}
              className="text-[12.5px] font-semibold text-[#11324F] underline-offset-2 hover:underline disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11324F] focus-visible:ring-offset-2"
            >
              {enviando ? t("confirmadoReenviando") : t("bienvenidaReenviar")}
            </button>
          </div>

          {aviso && (
            <p className="mt-4 text-[12.5px] leading-[1.5] text-[#8A8A8E]" role="status">
              {aviso}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
