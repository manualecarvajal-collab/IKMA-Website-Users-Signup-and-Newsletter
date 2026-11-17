"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Galería de la sección «Coro»: la foto grande, las tres de abajo, el carrusel
 * del final y el visor que se abre al tocar cualquiera de ellas.
 *
 * POR QUÉ ES CLIENTE. Todo lo demás de la sección es texto y va en servidor;
 * esto necesita estado (qué foto está abierta) y teclado, así que es el único
 * trozo que viaja al navegador.
 *
 * EL VISOR es un `role="dialog"` con fondo oscuro: se cierra con Escape, con el
 * botón o tocando el fondo, y se pasa de foto con las flechas ←/→. Mientras está
 * abierto se bloquea el scroll del documento, y al cerrar el foco vuelve al
 * botón que lo abrió.
 *
 * EL CARRUSEL (`animate-coro-ticker`, en globals.css) es una tira que se mueve
 * sola: se pinta dos mitades idénticas y la animación desplaza justo una de
 * ellas, así el salto es invisible. Cada mitad repite la lista cuatro veces para
 * que su ancho pase siempre del de la pantalla —si la mitad fuera más corta que
 * la ventana, al desplazarse quedaría un hueco a la derecha—. La segunda mitad
 * va oculta a lectores de pantalla y fuera del orden de tabulación, para no
 * duplicar ni fotos ni paradas de teclado.
 */

export type FotoCoro = {
  src: string
  alt: string
  pie: string
  /** Autor y licencia, para el pie del visor y el crédito del final. */
  autor: string
  licencia: string
  licenciaUrl: string
  pagina: string
  w: number
  h: number
}

type Props = {
  destacada: FotoCoro
  fotos: FotoCoro[]
  ticker: FotoCoro[]
  /** Textos del visor, ya traducidos. */
  etiquetas: { cerrar: string; anterior: string; siguiente: string }
}

/** Botón que envuelve una foto de la rejilla y la abre en el visor. */
function BotonFoto({
  foto,
  indice,
  abrir,
  clases,
  clasesImagen,
}: {
  foto: FotoCoro
  indice: number
  abrir: (indice: number, disparador: HTMLElement) => void
  clases: string
  clasesImagen: string
}) {
  return (
    <button
      type="button"
      onClick={(e) => abrir(indice, e.currentTarget)}
      className={`group relative block w-full cursor-zoom-in overflow-hidden bg-surface-container-low ${clases}`}
      aria-label={foto.pie}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={foto.src}
        alt={foto.alt}
        width={foto.w}
        height={foto.h}
        loading="lazy"
        className={`w-full object-cover transition duration-500 group-hover:scale-[1.03] ${clasesImagen}`}
      />
    </button>
  )
}

export default function CoroGaleria({ destacada, fotos, ticker, etiquetas }: Props) {
  const total = 1 + fotos.length + ticker.length
  const [abierta, setAbierta] = useState<number | null>(null)
  const disparador = useRef<HTMLElement | null>(null)

  const abrir = useCallback((indice: number, el: HTMLElement) => {
    disparador.current = el
    setAbierta(indice)
  }, [])

  const cerrar = useCallback(() => {
    setAbierta(null)
    disparador.current?.focus()
  }, [])

  const mover = useCallback(
    (paso: number) => setAbierta((i) => (i === null ? i : (i + paso + total) % total)),
    [total]
  )

  useEffect(() => {
    if (abierta === null) return
    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar()
      else if (e.key === "ArrowRight") mover(1)
      else if (e.key === "ArrowLeft") mover(-1)
    }
    window.addEventListener("keydown", alPulsar)
    return () => {
      window.removeEventListener("keydown", alPulsar)
      document.body.style.overflow = overflowPrevio
    }
  }, [abierta, cerrar, mover])

  const visor = abierta === null ? null : [destacada, ...fotos, ...ticker][abierta]

  return (
    <>
      {/* -------- foto grande -------- */}
      <figure className="mt-10">
        <BotonFoto
          foto={destacada}
          indice={0}
          abrir={abrir}
          clases="rounded-2xl"
          clasesImagen="aspect-[16/9] md:aspect-[21/9]"
        />
        <figcaption className="mt-2 text-[0.78rem] text-outline">{destacada.pie}</figcaption>
      </figure>

      {/* -------- tres fotos -------- */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {fotos.map((f, i) => (
          <figure key={f.src} className={i === fotos.length - 1 ? "col-span-2 md:col-span-1" : "col-span-1"}>
            <BotonFoto
              foto={f}
              indice={i + 1}
              abrir={abrir}
              clases="rounded-xl"
              clasesImagen="aspect-[4/3] md:aspect-auto md:h-[24rem]"
            />
            <figcaption className="mt-2 text-[0.78rem] leading-[1.4] text-outline">{f.pie}</figcaption>
          </figure>
        ))}
      </div>

      {/* -------- carrusel -------- */}
      <div className="relative mt-10 overflow-hidden">
        <div className="flex w-max animate-coro-ticker">
          {[0, 1].map((copia) => (
            <div key={copia} className="flex shrink-0" aria-hidden={copia === 1}>
              {[...ticker, ...ticker, ...ticker, ...ticker].map((f, i) => (
                <button
                  key={`${copia}-${i}-${f.src}`}
                  type="button"
                  onClick={(e) => abrir(1 + fotos.length + (i % ticker.length), e.currentTarget)}
                  tabIndex={copia === 1 ? -1 : 0}
                  aria-label={f.pie}
                  className="group relative mr-3 block h-[7.5rem] w-[11rem] shrink-0 cursor-zoom-in overflow-hidden rounded-xl bg-surface-container-low md:h-[9.5rem] md:w-[14rem]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.src}
                    alt={f.alt}
                    width={f.w}
                    height={f.h}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                  />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* -------- visor -------- */}
      {visor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={visor.pie}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/92 p-4"
          onClick={cerrar}
        >
          <button
            type="button"
            onClick={cerrar}
            aria-label={etiquetas.cerrar}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white hover:bg-white/25"
          >
            ×
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              mover(-1)
            }}
            aria-label={etiquetas.anterior}
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white hover:bg-white/25 md:left-6"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              mover(1)
            }}
            aria-label={etiquetas.siguiente}
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white hover:bg-white/25 md:right-6"
          >
            ›
          </button>

          <figure className="max-h-full w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visor.src}
              alt={visor.alt}
              width={visor.w}
              height={visor.h}
              className="mx-auto max-h-[74vh] w-auto rounded-lg object-contain"
            />
            <figcaption className="mt-3 text-center text-[0.8rem] leading-[1.5] text-white/85">
              {visor.pie}
              <span className="mt-1 block text-[0.7rem] text-white/55">
                {visor.autor} ·{" "}
                <a href={visor.licenciaUrl} target="_blank" rel="noopener noreferrer license" className="underline">
                  {visor.licencia}
                </a>{" "}
                ·{" "}
                <a href={visor.pagina} target="_blank" rel="noopener noreferrer" className="underline">
                  Wikimedia Commons
                </a>
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}
