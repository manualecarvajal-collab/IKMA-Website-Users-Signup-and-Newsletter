"use client"

import { Children, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

/**
 * Secuencia de paneles centrados, avanzada por el scroll vertical.
 *
 * Un tramo de scroll = un panel. El patrón es siempre el mismo:
 *
 *   panel 0            el formulario, centrado y luego se va a la izquierda
 *   paneles 1..n-2     las tarjetas: cada una llega al centro y, al asentarse,
 *                      se abre en ABANICO (giradas desde su base, −13°/0°/+13°)
 *   panel n-1          el vídeo: llega al centro y se expande a horizontal
 *
 * Cada panel se posiciona de forma independiente, así que ninguno arrastra a
 * los demás: entran de uno en uno.
 */
/**
 * Píxeles de scroll vertical que equivalen a avanzar un panel.
 *
 * Se exporta porque quien quiera mover la secuencia (por ejemplo un botón de
 * "sigue hacia abajo") necesita exactamente este valor: duplicarlo crearía dos
 * números que se separarían al primer ajuste.
 */
export const SCROLL_PER_STEP = 520

/**
 * Separación y giro del abanico, según el ancho disponible.
 *
 * Antes eran dos constantes (150 px y 13°), que valían para TRES tarjetas. Con
 * seis, 150 px de separación deja cada tarjeta tapada por la siguiente y las de
 * los extremos se salen de la pantalla en ventanas normales. Ahora la
 * separación sale del ancho (un 11,5 %, con suelo de 96 px) y el giro va en
 * proporción a ella, así que el abanico se abre en pantallas grandes y se
 * aprieta —sin giros exagerados— en las pequeñas.
 */
function abanico(ancho: number) {
  const sep = Math.max(96, Math.min(FAN_OFFSET, ancho * 0.115))
  return { sep, angulo: Math.max(4, Math.min(FAN_ANGLE, sep / 11)) }
}
const OFFSCREEN = 980 // desde dónde entran los paneles
const FAN_OFFSET = 150 // separación lateral dentro del abanico
const FAN_ANGLE = 13 // grados de cada tarjeta del abanico

interface Placement {
  x: number
  y: number
  rot: number
  opacity: number
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

/**
 * @param i        índice del panel
 * @param p        posición continua (0 = primer panel centrado, count-1 = último)
 * @param count    total de paneles
 * @param hasForm  si el panel 0 es el formulario
 *
 * `hasForm` NO es cosmético. Sin él, un usuario ya inscrito —que no ve el
 * formulario— tendría la primera tarjeta en el índice 0 y se comportaría como
 * el formulario: se iría hacia la izquierda en vez de entrar al abanico, y las
 * ranuras saldrían desplazadas. Por eso el índice y el desfase de llegada se
 * calculan a partir de este flag.
 */
function place(
  i: number,
  p: number,
  count: number,
  hasForm: boolean,
  sep: number,
  angulo: number
): Placement {
  const isForm = hasForm && i === 0
  const isVideo = i === count - 1
  const t = p - i // 0 → este panel está centrado

  if (isForm) {
    // Centrado al principio y se marcha a la izquierda.
    return {
      x: t >= 0 ? -OFFSCREEN * clamp(t, 0, 1) : OFFSCREEN * clamp(-t, 0, 1),
      y: 0,
      rot: 0,
      opacity: Math.max(0, 1 - Math.max(0, t)),
    }
  }

  if (isVideo) {
    // El frame del vídeo SUBE desde abajo y se queda centrado.
    return {
      x: 0,
      y: -Math.min(0, t) * OFFSCREEN,
      rot: 0,
      opacity: clamp((t + 0.7) / 0.7, 0, 1),
    }
  }

  // Tarjetas del abanico. Cada una llega durante su tramo y, al asentarse, se
  // reparte en una ranura simétrica. Como las ranuras dependen de cuántas han
  // llegado (k), el abanico se va abriendo y re-centrando solo:
  //   1 card  → centrada
  //   2 cards → −0,5 y +0,5
  //   3 cards → −1, 0, +1
  //
  // Sin formulario, la primera tarjeta ocupa la posición 0, así que todo el
  // cálculo va un paso por delante: si no, en el arranque del riel estaría
  // todavía fuera de pantalla y no se vería nada.
  const shift = hasForm ? 0 : 1
  const cardIndex = hasForm ? i - 1 : i
  const fanSize = count - (hasForm ? 2 : 1)
  const arrive = clamp(p - cardIndex + shift, 0, 1)
  const settled = clamp(p + shift, 0, fanSize)
  const slot = cardIndex - (settled - 1) / 2

  return {
    x: OFFSCREEN * (1 - arrive) + slot * sep * arrive,
    y: 0,
    rot: slot * angulo * arrive,
    opacity: clamp(arrive / 0.35, 0, 1),
  }
}

export default function HorizontalRail({
  children,
  id,
  hasForm = true,
}: {
  children: ReactNode
  id?: string
  /**
   * `false` cuando el primer hijo NO es el formulario (usuario ya inscrito).
   * Ver `place()`: sin este dato el abanico se descoloca.
   */
  hasForm?: boolean
}) {
  const panels = Children.toArray(children)
  const count = panels.length
  const sectionRef = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)
  const [ancho, setAncho] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const distance = rect.height - window.innerHeight
      setProgress(distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0)
      setAncho(window.innerWidth)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
    // `count` en las dependencias a propósito: al confirmarse la inscripción el
    // número de paneles cambia (5 → 4) y con él la altura de la sección, así que
    // hay que recalcular el progreso sin esperar a que el usuario haga scroll.
  }, [count])

  const p = progress * Math.max(0, count - 1)
  const { sep, angulo } = abanico(ancho || 1440)

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative"
      style={{
        height: `calc(100svh + ${Math.max(0, count - 1) * SCROLL_PER_STEP}px)`,
      }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {panels.map((panel, i) => {
          const { x, y, rot, opacity } = place(i, p, count, hasForm, sep, angulo)
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 origin-bottom"
              style={{
                transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`,
                opacity,
                pointerEvents: opacity > 0.9 ? "auto" : "none",
              }}
              aria-hidden={opacity < 0.5}
            >
              {panel}
            </div>
          )
        })}
      </div>
    </section>
  )
}
