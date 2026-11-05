"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

/**
 * «Cerrar sesión», en el hero de quien ya está inscrito.
 *
 * Es un botón de texto pequeño y a propósito poco llamativo: la acción principal
 * de esa pantalla es entrar a la conferencia, y salir es lo raro. Pide
 * confirmación con una segunda pulsación —no con un diálogo— porque cerrar la
 * sesión sin querer obliga a ir al correo a por el enlace de acceso.
 *
 * Al confirmar, navega a `/conferencia/salir`, que es una ruta GET: borra la
 * cookie de sesión (en sus dos ámbitos posibles) y devuelve a la landing. El
 * estado de sesión lo decide el servidor, así que recargar es lo que devuelve la
 * página al estado de visitante sin duplicar esa lógica en el cliente.
 */
export default function BotonSalir({ className }: { className?: string }) {
  const t = useTranslations("Conferencia.sesion")
  const [confirmando, setConfirmando] = useState(false)
  const [pendiente, setPendiente] = useState(false)

  if (confirmando) {
    return (
      <span className="inline-flex items-center gap-3">
        <button
          type="button"
          disabled={pendiente}
          onClick={() => {
            // Navegar a la ruta que borra la cookie: es un GET normal, así que
            // el cierre funciona aunque el JavaScript falle a mitad.
            setPendiente(true)
            window.location.assign("/conferencia/salir")
          }}
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
