"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { EVENT_DATE } from "./event"

/**
 * Contador de la conferencia.
 *
 * La fecha límite NO vive aquí: se importa de `./event`.
 *
 * El primer render (servidor y cliente) usa ceros para que no haya desajuste de
 * hidratación; el valor real se calcula ya en el cliente.
 *
 * Tuvo dos variantes de estilo (`hero` y `panel`, esta última para el marco del
 * directo). Quitado el reproductor solo se usa en el hero, así que mantener el
 * mapa de estilos para una sola presentación era código muerto esperando a que
 * alguien lo copiara.
 */

interface Remaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const ZERO: Remaining = { days: 0, hours: 0, minutes: 0, seconds: 0 }

/** Estilos del contador en el hero: en el azul marino del titular. */
const STYLES = {
  wrapper:
    "mt-[0.6svh] flex flex-wrap items-start justify-center gap-x-[min(2.4vw,4.2svh)] gap-y-[0.8svh] text-[#123045]",
  value:
    "text-[clamp(min(2rem,2.96svh),min(3.4vw,6.05svh),5rem)] font-bold leading-none tracking-[-0.01em] tabular-nums",
  label:
    "mt-[0.5svh] text-[clamp(min(0.55rem,0.8svh),min(0.6vw,1svh),0.85rem)] font-semibold uppercase tracking-[0.14em] text-[#123045]/70",
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

export default function ConferenciaCountdown() {
  const t = useTranslations("Conferencia.hero")
  const [left, setLeft] = useState<Remaining>(ZERO)

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
    <div className={STYLES.wrapper} aria-live="off">
      <Unit value={left.days} label={t("days", { count: left.days })} styles={STYLES} />
      <Unit value={left.hours} label={t("hours", { count: left.hours })} styles={STYLES} />
      <Unit
        value={left.minutes}
        label={t("minutes", { count: left.minutes })}
        styles={STYLES}
      />
      <Unit
        value={left.seconds}
        label={t("seconds", { count: left.seconds })} 
        styles={STYLES}
      />
    </div>
  )
}
