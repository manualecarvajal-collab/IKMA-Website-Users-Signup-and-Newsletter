"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { solicitarAcceso } from "@/app/conferencia/actions"

/**
 * Formulario de «iniciar sesión» sin contraseña.
 *
 * Un solo campo: el correo con el que se inscribió. Si está en la lista, le
 * llega un enlace firmado que abre la sesión en cualquier navegador; si no,
 * se le dice claramente que ese correo no está inscrito y se le ofrece el
 * formulario de inscripción.
 *
 * Los cuatro finales se dicen con sus palabras —enlace enviado, correo sin
 * inscribir, espera y fallo— porque desde aquí no hay otra forma de saber qué
 * pasó, y «algo salió mal» deja al usuario sin salida.
 */
export default function FormularioAcceso({ errorInicial }: { errorInicial?: string }) {
  const t = useTranslations("Conferencia.acceso")
  const [email, setEmail] = useState("")
  const [estado, setEstado] = useState<
    "listo" | "enviando" | "enviado" | "noRegistrado" | "espera" | "fallo"
  >(errorInicial === "registro" ? "noRegistrado" : "listo")
  const [espera, setEspera] = useState(0)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (estado === "enviando") return
    setEstado("enviando")
    const r = await solicitarAcceso(email)
    if (r.ok) {
      setEstado("enviado")
      return
    }
    if (r.reason === "noRegistrado") return setEstado("noRegistrado")
    if (r.reason === "espera") {
      setEspera(r.retryInSeconds ?? 60)
      return setEstado("espera")
    }
    setEstado("fallo")
  }

  if (estado === "enviado") {
    return (
      <div className="text-center">
        <h1 className="text-[24px] font-bold leading-[1.2] text-[#123045] md:text-[30px]">
          {t("enviadoTitulo")}
        </h1>
        <p className="mx-auto mt-3 max-w-[42ch] text-[15px] leading-[1.6] text-[#3C4A56]">
          {t("enviadoTexto", { email })}
        </p>
        <p className="mx-auto mt-4 max-w-[42ch] rounded-[16px] bg-[#F4F7FA] px-4 py-3 text-[13.5px] font-semibold leading-[1.5] text-[#11324F]">
          {t("enviadoAviso")}
        </p>
        <Link
          href="/conferencia"
          className="mt-6 inline-block text-[13.5px] font-bold text-[#11324F] underline-offset-2 hover:underline"
        >
          {t("volver")}
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center">
        <span className="inline-block rounded-full bg-[#E7EEFF] px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#0435CF]">
          {t("badge")}
        </span>
        <h1 className="mt-4 text-[24px] font-bold leading-[1.2] text-[#123045] md:text-[30px]">
          {t("titulo")}
        </h1>
        <p className="mx-auto mt-3 max-w-[42ch] text-[15px] leading-[1.6] text-[#3C4A56]">
          {t("texto")}
        </p>
      </div>

      <form onSubmit={enviar} noValidate className="mt-6">
        <label htmlFor="acceso-email" className="block text-[13px] font-semibold text-[#123045]">
          {t("emailLabel")}
        </label>
        <input
          id="acceso-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          // 16 px: por debajo de eso, iOS hace zoom al enfocar y descoloca el
          // formulario justo cuando el usuario va a escribir.
          className="mt-2 w-full rounded-[14px] border border-[#D5DAE1] bg-white px-4 py-3 text-[16px] text-[#123045] outline-none transition-colors focus:border-[#11324F] focus:ring-2 focus:ring-[#11324F]/20"
        />

        <button
          type="submit"
          disabled={estado === "enviando" || !email.trim()}
          className="mt-4 w-full rounded-full bg-[#11324F] px-7 py-3 text-[16px] font-bold text-white transition-colors hover:bg-[#1F4D75] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11324F] focus-visible:ring-offset-2"
        >
          {estado === "enviando" ? t("enviando") : t("enviar")}
        </button>
      </form>

      {estado === "noRegistrado" && (
        <div className="mt-5 rounded-[16px] bg-[#FDF3E7] px-4 py-3 text-[13.5px] leading-[1.5] text-[#8A5A1E]">
          <p className="font-bold">{t("noRegistradoTitulo")}</p>
          <p className="mt-1">{t("noRegistradoTexto")}</p>
          <Link
            href="/conferencia#registro"
            className="mt-2 inline-block font-bold text-[#8A5A1E] underline underline-offset-2"
          >
            {t("noRegistradoCta")}
          </Link>
        </div>
      )}

      {estado === "espera" && (
        <p className="mt-5 rounded-[16px] bg-[#F4F7FA] px-4 py-3 text-[13.5px] leading-[1.5] text-[#11324F]">
          {t("espera", { seconds: espera })}
        </p>
      )}

      {estado === "fallo" && (
        <p className="mt-5 rounded-[16px] bg-[#FDF3E7] px-4 py-3 text-[13.5px] leading-[1.5] text-[#8A5A1E]">
          {t("fallo")}
        </p>
      )}

      {errorInicial === "enlace" && estado === "listo" && (
        <p className="mt-5 rounded-[16px] bg-[#FDF3E7] px-4 py-3 text-[13.5px] leading-[1.5] text-[#8A5A1E]">
          {t("enlaceCaducado")}
        </p>
      )}
    </div>
  )
}
