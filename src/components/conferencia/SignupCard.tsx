"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import {
  reenviarCodigo,
  solicitarCodigo,
  verificarCodigo,
  type PerfilProfesional,
} from "@/app/conferencia/actions"
import { countryOptions } from "./countries"

/**
 * Tarjeta de inscripción de la conferencia, en dos pasos.
 *
 *   Paso 1 `form` — datos del asistente. Al enviar se guarda el registro con
 *     `estado = 'nuevo'` y se le manda un código al correo.
 *   Paso 2 `code` — la tarjeta se convierte en la casilla del código OTP.
 *     Al acertar, el registro pasa a `estado = 'confirmado'`, que es la
 *     PUERTA DE ACCESO a la transmisión.
 *
 * Al confirmar NO se muestra una pantalla de "ya estás dentro": se pide al
 * servidor que vuelva a renderizar la página. Como la inscripción ya está
 * confirmada, el servidor deja de pintar este formulario y el riel arranca
 * directamente en las tarjetas. Así el estado de la página y el de la base no
 * pueden contradecirse.
 *
 * Esta tarjeta solo se monta cuando el usuario NO está inscrito; si lo
 * estuviera, `page.tsx` no la renderiza.
 *
 * Desde el paso 2 se puede reenviar el código (con espera) o volver al
 * formulario para corregir el correo, conservando lo escrito.
 */

const ACCENT = "#11324F"
const ERROR = "#BA1A1A"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CODE_LENGTH = 6

/** Valores almacenados; las etiquetas salen de i18n. */
const PERFILES: PerfilProfesional[] = [
  "student",
  "licensed_health_professional",
  "resident",
  "non_professional",
]

type Step = "form" | "code"
type Tone = "error" | "info" | "success"

export default function SignupCard() {
  const t = useTranslations("Conferencia.form")
  const router = useRouter()
  const locale = useLocale()

  const [step, setStep] = useState<Step>("form")

  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [pais, setPais] = useState("")
  const [perfil, setPerfil] = useState<PerfilProfesional | "">("")
  const [consent, setConsent] = useState(false)

  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  /** El email ya estaba confirmado: está volviendo desde otro navegador. */
  const [vuelve, setVuelve] = useState(false)
  const [message, setMessage] = useState("")
  const [tone, setTone] = useState<Tone>("info")

  /**
   * Segundos que faltan para poder pedir otro código. Lo fija el servidor
   * (cooldown de 60 s) y aquí solo se dibuja la cuenta atrás.
   */
  const [cooldown, setCooldown] = useState(0)
  const codeInput = useRef<HTMLInputElement>(null)

  // Nombres de país localizados. Se rellenan en el cliente a propósito:
  // Intl.DisplayNames produce resultados distintos en Node y en el navegador,
  // y renderizarlos en el servidor provocaba un fallo de hidratación.
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([])
  useEffect(() => {
    setCountries(countryOptions(locale))
  }, [locale])

  // Cuenta atrás del reenvío.
  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(id)
  }, [cooldown])

  // Al entrar en el paso del código, el foco va ahí: es lo único que hay que
  // hacer y el usuario viene de pulsar "enviar".
  useEffect(() => {
    if (step === "code") codeInput.current?.focus()
  }, [step])

  function fail(msg: string) {
    setTone("error")
    setMessage(msg)
  }

  function ok(msg: string) {
    setTone("success")
    setMessage(msg)
  }

  function showCooldown(seconds: number) {
    setCooldown(seconds)
    setTone("info")
    setMessage(t("codeResendIn", { seconds }))
  }

  async function onSubmitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!nombre.trim() || !EMAIL_RE.test(email.trim())) {
      fail(t("error"))
      return
    }
    if (!consent) {
      fail(t("consentRequired"))
      return
    }

    setBusy(true)
    setMessage("")

    const res = await solicitarCodigo({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      ...(pais ? { pais } : {}),
      ...(perfil ? { perfilProfesional: perfil } : {}),
      consentimiento: true,
    })
    setBusy(false)

    if (res.ok) {
      setStep("code")
      setCode("")
      setMessage("")
      // El servidor manda cuánto dura el cooldown, así no hay dos constantes
      // que puedan separarse.
      setCooldown(res.cooldownSeconds)
      // Distingue "te acabas de inscribir" de "ya estabas inscrito y vuelves
      // desde otro navegador": el texto del paso 2 cambia.
      setVuelve(res.alreadyRegistered)
      return
    }

    switch (res.reason) {
      case "cooldown":
        showCooldown(res.retryInSeconds)
        return
      case "tooManyRequests":
        fail(t("errTooManyRequests"))
        return
      case "sendFailed":
        fail(t("errSendFailed"))
        return
      default:
        fail(t("error"))
    }
  }

  async function onSubmitCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (code.replace(/\D/g, "").length !== CODE_LENGTH) {
      fail(t("errCodeIncomplete"))
      return
    }

    setBusy(true)
    setMessage("")
    const res = await verificarCodigo(email, code)

    if (res.ok) {
      // Se deja `busy` en true a propósito: el botón queda en "Comprobando…"
      // hasta que llega el render nuevo, que ya no incluye este formulario.
      // Si volviera a `false` habría un instante en el que el usuario vería la
      // casilla del código otra vez, ya confirmada.
      router.refresh()
      return
    }
    setBusy(false)

    switch (res.reason) {
      case "wrongCode":
        fail(t("errWrongCode", { attempts: res.attemptsLeft }))
        setCode("")
        codeInput.current?.focus()
        return
      case "expired":
        fail(t("errExpired"))
        return
      case "invalid":
        fail(t("errCodeIncomplete"))
        return
      case "tooManyAttempts":
        fail(t("errTooManyAttempts"))
        return
      case "notFound":
        fail(t("errNotFound"))
        return
      default:
        fail(t("error"))
    }
  }

  async function onResend() {
    if (cooldown > 0 || busy) return
    setBusy(true)
    setMessage("")
    const res = await reenviarCodigo(email)
    setBusy(false)

    if (res.ok) {
      ok(t("codeSent"))
      setCooldown(res.cooldownSeconds)
      return
    }
    if (res.reason === "cooldown") {
      showCooldown(res.retryInSeconds)
      return
    }
    if (res.reason === "tooManyRequests") {
      fail(t("errTooManyRequests"))
      return
    }
    fail(res.reason === "sendFailed" ? t("errSendFailed") : t("error"))
  }

  const labelClass =
    "block text-[15px] leading-none text-[#8A8A8E] transition-colors group-focus-within:text-[#11324F]"
  const inputClass =
    "mt-2 w-full border-0 border-b border-[#D5D1D1] bg-transparent pb-2 text-[15px] text-[#2E2E30] " +
    "outline-none transition-colors placeholder:text-transparent focus:border-[#11324F]"
  const buttonClass =
    "mt-6 w-full rounded-full bg-[#11324F] py-3.5 text-[15px] font-bold text-white transition-colors " +
    "hover:bg-[#1F4D75] focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-[#11324F] focus-visible:ring-offset-2 " +
    "disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"

  const messageNode = message && (
    <p
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className="mt-4 text-[13px]"
      style={{ color: tone === "error" ? ERROR : ACCENT }}
    >
      {message}
    </p>
  )

  // ------------------------------------------------------------- paso 2
  if (step === "code") {
    return (
      <form onSubmit={onSubmitCode} noValidate className="w-full">
        <h2 className="text-[20px] font-bold leading-[1.25] text-[#123045] md:text-[24px]">
          {t("codeTitle")}
        </h2>
        <p className="mt-3 text-[12.5px] leading-[1.55] text-[#8A8A8E]">
          {t(vuelve ? "codeDescriptionReturning" : "codeDescription", { email })}
        </p>

        <div className="group mt-7">
          <label htmlFor="codigo" className={labelClass}>
            {t("codeLabel")}
          </label>
          <input
            id="codigo"
            name="codigo"
            ref={codeInput}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            className={
              inputClass +
              " text-center text-[26px] font-bold tracking-[0.32em] tabular-nums md:text-[30px]"
            }
          />
        </div>

        {messageNode}

        <button type="submit" disabled={busy} className={buttonClass}>
          {busy ? t("codeVerifying") : t("codeSubmit")}
        </button>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={onResend}
            disabled={busy || cooldown > 0}
            className="text-[12.5px] font-semibold text-[#11324F] underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-[#8A8A8E] disabled:no-underline"
          >
            {cooldown > 0
              ? t("codeResendIn", { seconds: cooldown })
              : t("codeResend")}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("form")
              setCode("")
              setMessage("")
              setCooldown(0)
              setVuelve(false)
            }}
            className="text-[12.5px] text-[#8A8A8E] underline-offset-2 hover:text-[#11324F] hover:underline"
          >
            {t("codeChangeEmail")}
          </button>
        </div>
      </form>
    )
  }

  // ------------------------------------------------------------- paso 1
  return (
    <form onSubmit={onSubmitForm} noValidate className="w-full">
      <h2 className="text-[20px] font-bold leading-[1.25] text-[#123045] md:text-[24px]">
        {t("title")}
      </h2>
      <p className="mt-3 text-[12.5px] leading-[1.55] text-[#8A8A8E]">{t("description")}</p>

      <div className="mt-7 space-y-6">
        <div className="group">
          <label htmlFor="nombre" className={labelClass}>
            {t("nombre")}
          </label>
          <input
            id="nombre"
            name="nombre"
            autoComplete="name"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="group">
          <label htmlFor="email" className={labelClass}>
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* País: lista completa, nombres localizados */}
        <div className="group">
          <label htmlFor="pais" className={labelClass}>
            {t("pais")}
          </label>
          <div className="relative">
            <select
              id="pais"
              name="pais"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              className={
                inputClass + " cursor-pointer appearance-none pr-7" + (pais ? "" : " text-[#8A8A8E]")
              }
            >
              <option value="">{t("paisPlaceholder")}</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute right-0 bottom-3.5 h-4 w-4 text-[#8A8A8E]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Perfil profesional: select con 4 opciones */}
        <div className="group">
          <label htmlFor="perfilProfesional" className={labelClass}>
            {t("perfilProfesional")}
          </label>
          <div className="relative">
            <select
              id="perfilProfesional"
              name="perfilProfesional"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as PerfilProfesional | "")}
              className={
                inputClass +
                " cursor-pointer appearance-none pr-7" +
                (perfil ? "" : " text-[#8A8A8E]")
              }
            >
              <option value="">{t("perfilPlaceholder")}</option>
              {PERFILES.map((p) => (
                <option key={p} value={p}>
                  {t(`perfilOptions.${p}`)}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute right-0 bottom-3.5 h-4 w-4 text-[#8A8A8E]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-xl bg-[#EDE9E9]/70 p-3">
        <input
          type="checkbox"
          name="consentimiento"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded-[5px] border border-[#B9B4B4]"
          style={{ accentColor: ACCENT }}
        />
        <span className="text-[11.5px] leading-[1.45] text-[#8A8A8E]">{t("consent")}</span>
      </label>

      {messageNode}

      <button type="submit" disabled={busy} className={buttonClass}>
        {busy ? t("sending") : t("submit")}
      </button>
    </form>
  )
}
