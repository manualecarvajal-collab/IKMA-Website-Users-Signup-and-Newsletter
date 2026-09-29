"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { EVENT_DATE } from "./event"

/**
 * Contador de la conferencia.
 *
 * La fecha límite NO vive aquí: se importa de `./event`, de modo que el hero y
 * el panel del directo cuentan siempre hacia el mismo instante.
 *
 * Muestra **días, horas, minutos y segundos**, cada uno con su denominación, y
 * se actualiza cada segundo (los segundos son los que dan el movimiento).
 *
 * El primer render (servidor y cliente) usa ceros para que no haya desajuste de
 * hidratación; el valor real se calcula ya en el cliente.
 *
 * Variantes:
 *   - `hero`  — blanco sobre el azul de fondo.
 *   - `panel` — azul corporativo sobre la tarjeta blanca del riel.
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
  { wrapper: string; value: string; label: string }
> = {
  hero: {
    wrapper:
      "mt-4 flex flex-wrap items-start justify-center gap-x-7 gap-y-4 md:gap-x-12",
    value:
      "text-[clamp(1.75rem,5vw,3.25rem)] font-bold leading-none text-white tabular-nums",
    label:
      "mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80 md:text-[13px] md:tracking-[0.18em]",
  },
  panel: {
    wrapper:
      "flex flex-wrap items-start justify-center gap-x-8 gap-y-5 md:gap-x-16",
    value:
      "text-[clamp(2.25rem,6vw,5.5rem)] font-bold leading-none text-[#0068B6] tabular-nums",
    label:
      "mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0068B6]/70 md:text-[14px] md:tracking-[0.2em]",
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
