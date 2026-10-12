"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { reenviarEnlace } from "@/app/conferencia/actions"

/**
 * "Reenviar enlace": el botón principal del hero para quien ya está inscrito.
 *
 * Ocupa el sitio donde antes estaba "Inscríbete ahora", que ya no tenía sentido:
 * quien lo ve está confirmado, y lo único que puede necesitar es que le vuelva a
 * llegar la llave. Como no navega a ningún sitio —manda un correo— tiene que
 * contar qué ha pasado: enviando, enviado, espera o error. Un botón que no dice
 * nada deja al usuario pulsando dos veces.
 *
 * Es autónomo a propósito (lleva su propio mensaje debajo) para poder usarlo
 * desde un componente de servidor, que no puede pasarle funciones.
 */
export default function BotonReenviarEnlace({
  email,
  label,
  className,
}: {
  email: string
  label: string
  className?: string
}) {
  const t = useTranslations("Conferencia.form")
  const [estado, setEstado] = useState<"listo" | "enviando">("listo")
  const [aviso, setAviso] = useState("")

  async function enviar() {
    setEstado("enviando")
    setAviso("")
    const r = await reenviarEnlace(email)
    setEstado("listo")

    if (r.ok) return setAviso(t("confirmadoReenviado"))
    if (r.motivo === "espera") return setAviso(t("confirmadoEspera"))
    return setAviso(t("confirmadoError"))
  }

  return (
    <span className="inline-flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={enviar}
        disabled={estado === "enviando"}
        className={className}
      >
        {estado === "enviando" ? t("confirmadoReenviando") : label}
      </button>
      {aviso && (
        <span
          role="status"
          className="text-[clamp(min(0.7rem,1.04svh),min(0.68vw,1.2svh),0.85rem)] font-semibold text-[#3C4A56]"
        >
          {aviso}
        </span>
      )}
    </span>
  )
}
