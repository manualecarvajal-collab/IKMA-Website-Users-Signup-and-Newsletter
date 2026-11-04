"use client"

import { useTranslations } from "next-intl"
import type { MomentoEvento } from "./event"

/**
 * Marco del riel: qué pasa con la transmisión, según el día en que estemos.
 *
 * Esto sustituye al reproductor. La conferencia se emite **por Zoom**, así que
 * la página no reproduce nada; lo que hace este hueco es lo que de verdad
 * necesita quien está inscrito en cada momento:
 *
 *   antes      — decir que el enlace llega por correo el viernes 13, y a qué
 *                dirección. Es la duda de todo el mundo al inscribirse.
 *   vispera    — el enlace ya existe: BOTÓN para entrar, además del correo. Es
 *                la red de seguridad de quien no lo encuentra en la bandeja.
 *   enMarcha   — la conferencia está ocurriendo: el botón, en primer plano.
 *   terminado  — que acabó, sin dejar un botón que ya no lleva a ninguna parte.
 *
 * EL BOTÓN ES UN `<a href>` NORMAL, no un onClick: tiene que funcionar sin
 * JavaScript, poder abrirse en otra pestaña y dejar que el sistema decida si
 * abre la aplicación de Zoom o el navegador.
 *
 * `url` llega VACÍA fuera de la ventana y para quien no está inscrito: lo decide
 * el servidor en `page.tsx`, así que el enlace no viaja en el HTML antes de
 * tiempo ni para quien no se ha registrado.
 *
 * Los tamaños siguen la regla del marco: 338×190 en móvil (16:9 de 86vw), así
 * que en móvil se acorta el texto y manda la acción; los `md:` devuelven los
 * tamaños de escritorio.
 */
const ETIQUETA =
  "rounded-full bg-[#E7EEFF] px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.14em] " +
  "text-[#0435CF] md:text-[12px]"

const TITULO = "mt-2 text-[16px] font-bold leading-[1.2] text-[#0435CF] md:mt-4 md:text-[28px]"

const AVISO =
  "max-w-[46ch] text-[13px] leading-[1.45] text-[#5F5F66] md:text-[15px] md:leading-[1.5]"

const BOTON =
  "mt-3 inline-flex items-center gap-2 rounded-full bg-[#0435CF] px-7 py-3 text-[15px] " +
  "font-bold text-white transition-colors hover:bg-[#032a9e] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0435CF] " +
  "focus-visible:ring-offset-2 motion-reduce:transition-none md:mt-5 md:text-[16px]"

export default function MarcoZoom({
  email,
  momento,
  url,
}: {
  /** Correo del inscrito. Se le enseña para que sepa dónde buscar. */
  email: string
  momento: MomentoEvento
  /** Enlace de Zoom. Vacío = todavía no disponible. */
  url: string
}) {
  const t = useTranslations("Conferencia.marco")

  // Se puede entrar solo con enlace configurado y dentro de la ventana.
  const conEnlace = Boolean(url) && (momento === "vispera" || momento === "enMarcha")

  // ------------------------------------------------------------- terminado
  if (momento === "terminado") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center md:px-10">
        <h3 className="text-[16px] font-bold leading-[1.2] text-[#123045] md:text-[28px]">
          {t("terminadoTitulo")}
        </h3>
        <p className={`mt-2 md:mt-3 ${AVISO}`}>{t("terminadoTexto")}</p>
        <a
          href="/contact-us"
          className="mt-2 text-[13px] font-bold text-[#0435CF] underline decoration-[1.5px] underline-offset-2 md:mt-3 md:text-[15px]"
        >
          {t("terminadoCta")}
        </a>
      </div>
    )
  }

  // ------------------------------------------------- vispera / en marcha
  if (conEnlace) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center md:px-10">
        <span className={ETIQUETA}>
          {momento === "enMarcha" ? t("badgeEnMarcha") : t("badgeVispera")}
        </span>
        <h3 className={TITULO}>
          {momento === "enMarcha" ? t("enMarchaTitulo") : t("visperaTitulo")}
        </h3>
        <a href={url} target="_blank" rel="noopener noreferrer" className={BOTON}>
          {t("entrar")}
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M7 17 17 7M17 7H8m9 0v9" />
          </svg>
        </a>
        {/* El correo, para quien prefiera buscar el enlace en su bandeja. En
            móvil se quita: con 190 px de alto, lo que tiene que caber es el
            botón. */}
        <p className="mt-2 hidden text-[12.5px] text-[#5F5F66] md:block">
          {t("tambienEn", { email })}
        </p>
      </div>
    )
  }

  // ---------------------------------------- ventana sin enlace configurado
  if (momento === "vispera" || momento === "enMarcha") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center md:px-10">
        <span className={ETIQUETA}>{t("badgeVispera")}</span>
        <h3 className={TITULO}>{t("sinEnlaceTitulo")}</h3>
        <p className={`mt-2 md:mt-3 ${AVISO}`}>{t("sinEnlaceTexto")}</p>
      </div>
    )
  }

  // ------------------------------------------------------------------ antes
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center md:px-10">
      <span className={ETIQUETA}>{t("badge")}</span>
      <h3 className={TITULO}>{t("titulo")}</h3>
      <p className={`mt-2 md:mt-3 ${AVISO}`}>{t("texto")}</p>
      {email && (
        <p className="mt-2 break-all text-[12.5px] font-bold text-[#0435CF] md:mt-4 md:text-[15px]">
          {email}
        </p>
      )}
      <p className="mt-3 hidden max-w-[42ch] text-[13px] leading-[1.4] text-[#5F5F66] md:block">
        {t("spam")}
      </p>
    </div>
  )
}
