import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion"

/**
 * Fondo animado del hero de la conferencia IKMA.
 *
 * Estilo tomado del vídeo de referencia (barridos de formas curvas, bandas
 * azules, arcos blancos y un arco punteado), pero SIN el wordmark IKMA.
 *
 * Dos decisiones importantes:
 *
 * 1. El fondo se queda AZUL todo el tiempo. El vídeo de referencia arranca en
 *    blanco, pero aquí el hero lleva texto blanco encima: si el fondo pasara
 *    por blanco, el texto desaparecería.
 * 2. Las formas fuertes van hacia los BORDES y el centro queda tranquilo, para
 *    no pelear con el texto.
 *
 * Bucle perfecto: toda la animación es periódica sobre la duración de la
 * composición (senos/cosenos de ciclo completo) y los arcos tienen opacidad 0
 * en los extremos, así que el último frame empalma con el primero.
 */

const TAU = Math.PI * 2

/** Onda periódica: devuelve -1..1 y completa un ciclo por composición. */
const wave = (frame: number, duration: number, phase = 0) =>
  Math.sin((frame / duration + phase) * TAU)

/** Opacidad con rampa de entrada y salida; 0 en los bordes de la ventana. */
const windowOpacity = (
  frame: number,
  start: number,
  end: number,
  fade = 36
) => {
  if (frame <= start || frame >= end) return 0
  const fadeIn = Math.min(1, (frame - start) / fade)
  const fadeOut = Math.min(1, (end - frame) / fade)
  return Math.min(fadeIn, fadeOut)
}

/** Progreso 0..1 dentro de la ventana (para dibujar trazos). */
const windowProgress = (frame: number, start: number, end: number) =>
  Math.min(1, Math.max(0, (frame - start) / (end - start)))

/** Forma tipo pétalo/ola, la silueta característica de la referencia. */
const PETAL =
  "M 0 0 C 380 -260, 980 -170, 1290 240 C 900 520, 300 430, 0 0 Z"

const ARCS: { d: string; start: number; end: number; width: number }[] = [
  {
    d: "M 1340 300 A 300 300 0 0 1 1780 620",
    start: 60,
    end: 250,
    width: 5,
  },
  {
    d: "M 200 780 A 260 260 0 0 0 620 980",
    start: 120,
    end: 320,
    width: 4,
  },
  {
    d: "M 1560 880 A 150 150 0 0 1 1810 1000",
    start: 170,
    end: 350,
    width: 3,
  },
]

/** Espacio de diseño: todas las coordenadas SVG viven aquí, así la
 *  composición es resolución-independiente y se puede renderizar a 1080p,
 *  1440p o 4K sin que las formas se descoloquen ni cambie su grosor relativo. */
const DESIGN_W = 1920
const DESIGN_H = 1080

export const ConferenciaHeroBg: React.FC = () => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  // — Fondo base: azul constante con un brillo que se desplaza despacio.
  const glowX = 50 + wave(frame, durationInFrames) * 10
  const glowY = 38 + wave(frame, durationInFrames, 0.25) * 8

  // — Pétalos que barren por los bordes.
  const petalA = {
    x: -260 + wave(frame, durationInFrames, 0.1) * 120,
    y: 520 + wave(frame, durationInFrames, 0.35) * 70,
    rot: -18 + wave(frame, durationInFrames, 0.15) * 12,
    scale: 1.05 + wave(frame, durationInFrames, 0.4) * 0.06,
  }
  const petalB = {
    x: 1180 + wave(frame, durationInFrames, 0.6) * 110,
    y: 120 + wave(frame, durationInFrames, 0.85) * 60,
    rot: 196 + wave(frame, durationInFrames, 0.65) * 10,
    scale: 0.95 + wave(frame, durationInFrames, 0.9) * 0.07,
  }

  // — Bandas que derivan en diagonal.
  const bands = [0, 1, 2].map((i) => {
    const phase = i * 0.33
    return {
      top: 12 + i * 30 + wave(frame, durationInFrames, phase) * 7,
      height: 15 + wave(frame, durationInFrames, phase + 0.5) * 5,
      opacity: 0.16 + (i % 2 === 0 ? 0.06 : 0.02),
    }
  })

  // — Arco punteado que gira.
  const dottedOpacity = windowOpacity(frame, 140, 355, 50)
  const dottedRotation = windowProgress(frame, 140, 355) * 90 - 20

  return (
    <AbsoluteFill style={{ backgroundColor: "#0068B6" }}>
      {/* Fondo base con brillo desplazándose */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 120% at ${glowX}% ${glowY}%, #1289D4 0%, #0068B6 45%, #004A85 100%)`,
        }}
      />

      {/* Pétalos barriendo por los bordes */}
      <svg
        viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <g
          transform={`translate(${petalA.x} ${petalA.y}) rotate(${petalA.rot}) scale(${petalA.scale})`}
        >
          <path d={PETAL} fill="#1289D4" opacity={0.55} />
        </g>
        <g
          transform={`translate(${petalB.x} ${petalB.y}) rotate(${petalB.rot}) scale(${petalB.scale})`}
        >
          <path d={PETAL} fill="#4A96CB" opacity={0.32} />
        </g>
      </svg>

      {/* Bandas en diagonal */}
      {bands.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "-15%",
            right: "-15%",
            top: `${b.top}%`,
            height: `${b.height}%`,
            background: "#4A96CB",
            opacity: b.opacity,
            transform: "rotate(-9deg)",
          }}
        />
      ))}

      {/* Arcos blancos que se dibujan y se desvanecen */}
      <svg
        viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {ARCS.map((arc, i) => {
          const progress = windowProgress(frame, arc.start, arc.end)
          const draw = Math.min(1, progress / 0.6)
          const opacity = windowOpacity(frame, arc.start, arc.end, 40)
          return (
            <path
              key={i}
              d={arc.d}
              fill="none"
              stroke="#F8FDFC"
              strokeWidth={arc.width}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
              opacity={opacity}
            />
          )
        })}

        {/* Arco punteado girando */}
        <circle
          cx={1680}
          cy={300}
          r={190}
          fill="none"
          stroke="#F8FDFC"
          strokeWidth={3}
          strokeDasharray="2 15"
          strokeLinecap="round"
          opacity={dottedOpacity * 0.85}
          transform={`rotate(${dottedRotation} 1680 300)`}
        />
      </svg>

      {/* Viñeta: oscurece bordes y asienta el centro para el texto */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(90% 75% at 50% 45%, rgba(0,40,80,0.10) 0%, rgba(0,40,80,0.28) 60%, rgba(0,32,66,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  )
}
