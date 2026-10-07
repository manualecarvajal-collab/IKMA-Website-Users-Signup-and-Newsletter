"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import ConferenciaCountdown from "./ConferenciaCountdown"
import SignUpButton from "./SignUpButton"
import type { EstadoDirecto } from "./directo"

/**
 * Panel 5 del riel: el directo.
 *
 * Cuatro estados, y el que manda lo decide el SERVIDOR (`page.tsx` lee
 * `conferencia.ajustes` y se lo pasa ya resuelto). Este componente solo pinta:
 *
 *   antes   → el contador. Lo ve todo el mundo: no hay nada que proteger
 *             porque todavía no hay nada que ver.
 *   vivo    → con inscripción confirmada, la transmisión; sin ella, el bloqueo
 *             que invita a inscribirse.
 *   espera  → aviso de pausa para todos. Quien no está inscrito conserva
 *             debajo el botón de inscribirse: la pausa no es el momento de
 *             dejarle sin salida.
 *   final   → la conferencia terminó. Cierre e invitación a hacerse miembro.
 *
 * `url` y `embed` llegan VACÍOS si quien mira no está confirmado: `page.tsx` no
 * se los manda, así que el enlace no viaja en el HTML y no hay nada que sacar
 * del inspector. Si solo se ocultara la pantalla, la puerta no existiría.
 */

const BOTON =
  "inline-block rounded-full bg-[#0435CF] px-7 py-3 text-[14px] font-bold text-white " +
  "transition-colors hover:bg-white hover:text-[#0435CF] hover:ring-1 hover:ring-[#0435CF] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0435CF] " +
  "focus-visible:ring-offset-2 motion-reduce:transition-none"

const ETIQUETA =
  "rounded-full bg-[#E7EEFF] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] " +
  "text-[#0435CF] md:text-[12px]"

const AVISO = "max-w-[46ch] text-[12.5px] leading-[1.5] text-[#8A8A8E] md:text-[15px]"

export default function DirectoPanel({
  estado,
  inscrito,
  url,
  embed,
}: {
  /** Lo fija un administrador desde el panel. */
  estado: EstadoDirecto
  /** Quien mira tiene la inscripción confirmada. */
  inscrito: boolean
  /** Enlace de Zoom. Vacío si no está confirmado. */
  url: string
  /** URL incrustable. Vacía si no está confirmado. Tiene prioridad sobre `url`. */
  embed: string
}) {
  const t = useTranslations("Conferencia.live")
  const tHero = useTranslations("Conferencia.hero")

  // ---------------------------------------------------------------- antes
  if (estado === "antes") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <p className="text-[13px] font-semibold text-[#0035CC] md:text-[17px]">
          {tHero("countdownLabel")}
        </p>
        <div className="mt-6 md:mt-10">
          <ConferenciaCountdown variant="panel" />
        </div>
      </div>
    )
  }

  // --------------------------------------------------------------- espera
  if (estado === "espera") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
        <span className={ETIQUETA}>{t("badgeWaiting")}</span>
        <h3 className="mt-4 text-[18px] font-bold leading-[1.2] text-[#0435CF] md:text-[28px]">
          {t("waitingTitle")}
        </h3>
        <p className={`mt-3 ${AVISO}`}>{t("waitingText")}</p>
        {/* La pausa no es el momento de dejar sin salida a quien no está
            dentro: el botón de inscribirse sigue ahí. */}
        {!inscrito && <SignUpButton label={t("lockedCta")} className={`mt-6 ${BOTON}`} />}
      </div>
    )
  }

  // ---------------------------------------------------------------- final
  if (estado === "final") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
        <h3 className="text-[18px] font-bold leading-[1.2] text-[#0435CF] md:text-[28px]">
          {t("endedTitle")}
        </h3>
        <p className={`mt-3 ${AVISO}`}>{t("endedText")}</p>
        {/* El mismo destino que el botón del correo de invitación. */}
        <Link href="/membresia" className={`mt-6 ${BOTON}`}>
          {t("endedCta")}
        </Link>
      </div>
    )
  }

  // ----------------------------------------------------------------- vivo
  if (!inscrito) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
        <span className={ETIQUETA}>{t("badge")}</span>
        <h3 className="mt-4 text-[18px] font-bold leading-[1.2] text-[#0435CF] md:text-[28px]">
          {t("lockedTitle")}
        </h3>
        <p className={`mt-3 ${AVISO}`}>{t("lockedText")}</p>
        {/* Lleva al formulario, que sin inscripción es el panel 0 del riel. */}
        <SignUpButton label={t("lockedCta")} className={`mt-6 ${BOTON}`} />
      </div>
    )
  }

  if (embed) {
    return (
      <iframe
        src={embed}
        title={t("watch")}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    )
  }

  // Zoom no se puede incrustar: su página es un lanzador de la aplicación, no
  // un reproductor. Por eso se abre como botón.
  if (url) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
        <span className={ETIQUETA}>{t("badge")}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className={`mt-5 ${BOTON}`}>
          {t("watch")}
        </a>
      </div>
    )
  }

  // En vivo, confirmado, pero sin enlace configurado. Pasa si se arranca antes
  // de pegar la URL: mejor decirlo que enseñar un contador que ya no significa
  // nada.
  return (
    <div className="flex h-full w-full items-center justify-center px-8 text-center">
      <p className="text-[13px] font-semibold text-[#0035CC] md:text-[17px]">
        {t("starting")}
      </p>
    </div>
  )
}
