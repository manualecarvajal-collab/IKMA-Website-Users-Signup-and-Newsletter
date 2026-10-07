import type { CSSProperties } from "react"

/**
 * Fondo de la conferencia: campo claro con barras flotantes.
 *
 * Sustituye al vídeo azul de Remotion. En el prototipo de referencia lo único
 * que se mueve son estas barras —comprobado con una imagen de diferencias entre
 * el segundo 0,5 y el 13: la foto, el titular y el contador salen idénticos—,
 * así que el movimiento se resuelve con CSS (ver `fondo.css`) y no con un vídeo
 * de varios megas que solo animaría unas cajas de color.
 *
 * Posiciones, anchos, altos y colores salen de medir el fotograma del
 * prototipo: barras de 1 a 2 px de ancho por cada 100 de ventana, de 11 a 89 de
 * alto, en tres tintes (#CFD5DD frío, #E3E5E2 verdoso, #E7DDD7 beige). Los
 * anchos van en `clamp` porque un porcentaje puro las convertiría en un hilo de
 * un píxel en móvil, y las dos primeras y las dos últimas quedan a medio salir
 * del encuadre, como en el prototipo.
 *
 * Ninguna barra pisa la franja central mientras el hero está en pantalla: ahí
 * van la foto y el titular.
 */
interface Barra {
  /** Separación izquierda, en % del ancho de ventana. */
  left: number
  /** Separación superior, en % del alto de ventana. */
  top: number
  /** Ancho en CSS; `clamp` evita que desaparezca en pantallas estrechas. */
  ancho: string
  /** Alto, en % del alto de ventana. */
  alto: number
  color: string
  /** Duración del ciclo, en segundos. */
  dur: number
  /** Retardo negativo: arranca el ciclo ya empezado, sin esperas visibles. */
  delay: number
  /** Deriva máxima vertical, en píxeles. */
  dy: number
  /** Estirón vertical en la mitad del ciclo. */
  sy: number
}

const BARRAS: Barra[] = [
  { left: -0.9, top: 34, ancho: "clamp(12px,1.6vw,46px)", alto: 22, color: "#E7DDD7", dur: 8, delay: -3.2, dy: -80, sy: 1.12 },
  { left: 8.7, top: 69.8, ancho: "clamp(12px,1.08vw,42px)", alto: 28.1, color: "#CFD5DD", dur: 7.5, delay: 0, dy: -95, sy: 1.14 },
  { left: 15.2, top: 12.5, ancho: "clamp(16px,2.16vw,60px)", alto: 24.8, color: "#E3E5E2", dur: 10, delay: -2.7, dy: 85, sy: 0.86 },
  { left: 27.3, top: 80.6, ancho: "clamp(12px,1.08vw,42px)", alto: 11.2, color: "#E7DDD7", dur: 7, delay: -1.2, dy: -70, sy: 1.18 },
  { left: 76.5, top: 42, ancho: "clamp(12px,1.35vw,44px)", alto: 19, color: "#E3E5E2", dur: 8, delay: -0.8, dy: -75, sy: 1.15 },
  { left: 82.2, top: 86.7, ancho: "clamp(11px,0.97vw,38px)", alto: 11.4, color: "#E8DDD7", dur: 9, delay: -4.3, dy: -80, sy: 1.11 },
  { left: 91, top: 9.2, ancho: "clamp(16px,2.16vw,60px)", alto: 88.7, color: "#CDD5DF", dur: 12, delay: -2, dy: 110, sy: 0.9 },
  { left: 99.2, top: 5.9, ancho: "clamp(14px,2vw,56px)", alto: 24.5, color: "#E3E5E2", dur: 9.5, delay: -5, dy: 90, sy: 1.14 },
]

export default function FondoBarras() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden bg-[#F8F8F9]"
    >
      {BARRAS.map((barra, i) => (
        <span
          key={i}
          className="conf-barra"
          style={
            {
              left: `${barra.left}%`,
              top: `${barra.top}%`,
              width: barra.ancho,
              height: `${barra.alto}%`,
              backgroundColor: barra.color,
              "--conf-dur": `${barra.dur}s`,
              "--conf-delay": `${barra.delay}s`,
              "--conf-dy": `${barra.dy}px`,
              "--conf-sy": barra.sy,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
