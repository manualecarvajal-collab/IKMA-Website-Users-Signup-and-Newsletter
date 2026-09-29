import { Composition } from "remotion"
import { ConferenciaHeroBg } from "./ConferenciaHeroBg"

/**
 * Composiciones del fondo animado del hero de la conferencia.
 *
 * La animación es resolución-independiente (coordenadas en espacio de diseño
 * 1920×1080), así que la misma composición se registra en varias resoluciones:
 *  - `ConferenciaHeroBg`      1920×1080  (móvil / respaldo)
 *  - `ConferenciaHeroBg1440`  2560×1440  (escritorio)
 *  - `ConferenciaHeroBg4K`    3840×2160  (pantallas 4K / HiDPI)
 *
 * Todas: 30 fps · 12 s · 360 frames · bucle perfecto · sin audio.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ConferenciaHeroBg"
        component={ConferenciaHeroBg}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ConferenciaHeroBg1440"
        component={ConferenciaHeroBg}
        durationInFrames={360}
        fps={30}
        width={2560}
        height={1440}
      />
      <Composition
        id="ConferenciaHeroBg4K"
        component={ConferenciaHeroBg}
        durationInFrames={360}
        fps={30}
        width={3840}
        height={2160}
      />
    </>
  )
}
