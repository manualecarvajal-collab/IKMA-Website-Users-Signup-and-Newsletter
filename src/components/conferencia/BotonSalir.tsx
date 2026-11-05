"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { cerrarSesion } from "@/app/conferencia/actions"

/**
 * «Cerrar sesión», en el hero de quien ya está inscrito.
 *
 * Es un botón de texto pequeño y a propósito poco llamativo: la acción principal
 * de esa pantalla es entrar a la conferencia, y salir es lo raro. Pide
 * confirmación con una segunda pulsación —no con un diálogo— porque cerrar la
 * sesión sin querer obliga a ir al correo a por el enlace de acceso.
 *
 * Al terminar recarga la página: el estado de sesión lo decide el servidor, así
 * que refrescar es lo que devuelve la landing al estado de visitante sin tener
 * que duplicar esa lógica en el cliente.
 */
export default function BotonSalir({ className }: { className?: string }) {
  const t = useTranslations("Conferencia.sesion")
  const [confirmando, setConfirmando] = useState(false)
  const [pendiente, start] = useTransition()

  if (confirmando) {
    return (
      <span className="inline-flex items-center gap-3">
        <button
          type="button"
          disabled={pendiente}
          onClick={() =>
            start(async () => {
              await cerrarSesion()
              window.location.assign("/conferencia")
            })
          }
          className="text-[13px] font-bold text-[#8A5A1E] underline underline-offset-2 disabled:opacity-60"
        >
          {pendiente ? t("saliendo") : t("salirConfirmar")}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="text-[13px] font-semibold text-[#5F5F66] underline-offset-2 hover:underline"
        >
          {t("cancelar")}
        </button>
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      className={className ?? "text-[13px] font-semibold text-[#5F5F66] underline-offset-2 hover:underline"}
    >
      {t("salir")}
    </button>
  )
}
