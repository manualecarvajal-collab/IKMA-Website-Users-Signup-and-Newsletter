"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

/**
 * Aparece con una animación hacia arriba cuando entra en pantalla.
 *
 * Es para el formulario en MÓVIL: ahí los paneles se apilan y el formulario
 * arranca invisible y sube al llegar a su sección. En escritorio no hace nada,
 * porque el riel ya tiene su propia animación de entrada y dos a la vez se
 * pelearían. Lo decide el CSS (ver `fondo.css`): aquí solo se pone la clase.
 *
 * El estado inicial es oculto, así que hay un `<noscript>` que lo revierte: sin
 * JavaScript un formulario invisible sería el peor fallo posible en la página.
 *
 * `className` existe para la página de ponentes, que necesita la misma mecánica
 * con otro nombre de clase (`spk-rev`): en la landing `.conf-revelar` solo está
 * definida dentro del bloque móvil, y las filas del pliego tienen que aparecer
 * también en escritorio.
 */
export default function Revelar({
  children,
  className = "conf-revelar",
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // NO hay comprobación de "ya está en pantalla". La había, y era justo lo
    // que rompía el flujo pedido: en un móvil alto el formulario asoma al
    // cargar, así que se mostraba solo, sin que el usuario hubiera bajado.
    //
    // Se sigue el estado en LOS DOS SENTIDOS (si solo se encendiera, al volver
    // arriba se quedaría visible) y con un margen exigente: el disparo está en
    // el 65 % superior de la pantalla, así que el formulario tiene que SUBIR de
    // verdad para aparecer. Con −15 % bastaba con que asomara por abajo.
    const observer = new IntersectionObserver(
      ([entrada]) => setVisible(entrada.isIntersecting),
      { rootMargin: "0px 0px -35% 0px", threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <noscript>
        <style>{`.${className}{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
      <div
        ref={ref}
        className={`${className}${visible ? ` ${className}-visible` : ""}`}
      >
        {children}
      </div>
    </>
  )
}
