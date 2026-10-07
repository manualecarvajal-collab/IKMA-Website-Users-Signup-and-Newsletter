"use client"

import { Fragment, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { EVENT_DATE } from "./event"

/**
 * Contador de la conferencia.
 *
 * La fecha límite NO vive aquí: se importa de `./event`, de modo que el hero y
 * el panel del directo cuentan siempre hacia el mismo instante.
 *
 * El primer render (servidor y cliente) usa ceros para que no haya desajuste de
 * hidratación; el valor real se calcula ya en el cliente.
 *
 * Variantes:
 *   - `hero`  — como un reloj, 39:17:26:58: cuatro grupos separados por dos
 *     puntos y sin etiquetas, en el azul marino del diseño. Los días entran en
 *     la cuenta porque faltan más de 900 horas: un contador de
 *     horas:minutos:segundos mentiría. Al quitar las etiquetas de la vista, el
 *     `sr-only` se las devuelve a quien use lector de pantalla.
 *   - `panel` — números con su etiqueta debajo, para la tarjeta del directo.
 */

type Variant = "hero" | "panel"

interface Remaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const ZERO: Remaining = { days: 0, hours: 0, minutes: 0, seconds: 0 }

/**
 * Clases por variante. Van en un mapa (y no con un ternario dentro del JSX) para
 * que las dos presentaciones se lean de un vistazo y no se mezclen a medias.
 */
const STYLES: Record<
  Variant,
  { wrapper: string; value: string; label: string; sep: string }
> = {
  hero: {
    wrapper: "mt-1 flex items-baseline justify-center text-[#123045]",
    value:
      "text-[clamp(min(2rem,2.96svh),min(3.4vw,6.05svh),5rem)] font-bold leading-none tracking-[-0.01em] tabular-nums",
    sep: "text-[clamp(min(2rem,2.96svh),min(3.4vw,6.05svh),5rem)] font-bold leading-none text-[#123045]/45",
    label: "",
  },
  panel: {
    wrapper:
      "flex flex-wrap items-start justify-center gap-x-8 gap-y-5 md:gap-x-16",
    value:
      "text-[clamp(2.25rem,6vw,5.5rem)] font-bold leading-none text-[#0068B6] tabular-nums",
    label:
      "mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0068B6]/70 md:text-[14px] md:tracking-[0.2em]",
    sep: "",
  },
}

function remaining(target: number): Remaining {
  const ms = Math.max(0, target - Date.now())
  const total = Math.floor(ms / 1000)
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

function Unit({
  value,
  label,
  styles,
}: {
  value: number
  label: string
  styles: { value: string; label: string }
}) {
  return (
    <div className="flex flex-col items-center">
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}

export default function ConferenciaCountdown({
  variant = "hero",
}: {
  variant?: Variant
}) {
  const t = useTranslations("Conferencia.hero")
  const [left, setLeft] = useState<Remaining>(ZERO)
  const styles = STYLES[variant]

  useEffect(() => {
    if (!EVENT_DATE) return
    const target = new Date(EVENT_DATE).getTime()
    if (Number.isNaN(target)) return

    const tick = () => setLeft(remaining(target))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  const dosDigitos = (valor: number) => String(valor).padStart(2, "0")

  if (variant === "hero") {
    const grupos = [left.days, left.hours, left.minutes, left.seconds]

    return (
      <div className={styles.wrapper} aria-live="off">
        {grupos.map((valor, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <span className={styles.sep} aria-hidden="true">
                :
              </span>
            )}
            <span className={styles.value}>{dosDigitos(valor)}</span>
          </Fragment>
        ))}
        {/* Las etiquetas que el diseño quita de la vista siguen existiendo para
            quien no ve la pantalla: sin ellas, "39:17:26:58" son cifras sin
            unidades. */}
        <span className="sr-only">
          {t("days", { count: left.days })}, {t("hours", { count: left.hours })},{" "}
          {t("minutes", { count: left.minutes })},{" "}
          {t("seconds", { count: left.seconds })}
        </span>
      </div>
    )
  }

  return (
    <div className={styles.wrapper} aria-live="off">
      <Unit value={left.days} label={t("days", { count: left.days })} styles={styles} />
      <Unit value={left.hours} label={t("hours", { count: left.hours })} styles={styles} />
      <Unit
        value={left.minutes}
        label={t("minutes", { count: left.minutes })}
        styles={styles}
      />
      <Unit
        value={left.seconds}
        label={t("seconds", { count: left.seconds })} 
        styles={styles}
      />
    </div>
  )
}
