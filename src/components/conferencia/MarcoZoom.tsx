"use client"

import { useTranslations } from "next-intl"

/**
 * Marco del riel: qué pasa con la transmisión.
 *
 * Esto sustituye al reproductor. La conferencia se emite **por Zoom**, y el
 * enlace de la reunión se manda por correo 24 horas antes a cada inscrito, así
 * que la página no tiene nada que reproducir ni que desbloquear: lo único útil
 * que puede hacer este hueco es decir exactamente eso, y decir a qué dirección
 * va a llegar. Es la duda que va a tener todo el mundo al terminar de
 * inscribirse.
 *
 * No consulta nada, no escucha cambios y no depende del día: se pinta igual
 * antes, durante y después del evento. Los cuatro estados del directo
 * (`antes/vivo/espera/final`) desaparecieron con el reproductor.
 *
 * Los tamaños siguen la regla del marco: 338×190 en móvil (16:9 de 86vw), así
 * que en móvil se oculta el párrafo largo y manda el dato del correo; los
 * `md:` devuelven los tamaños de escritorio.
 */
const ETIQUETA =
  "rounded-full bg-[#E7EEFF] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] " +
  "text-[#0435CF] md:text-[12px]"

const TITULO = "mt-2 text-[15px] font-bold leading-[1.2] text-[#0435CF] md:mt-4 md:text-[28px]"

const AVISO =
  "max-w-[46ch] text-[11.5px] leading-[1.4] text-[#8A8A8E] md:text-[15px] md:leading-[1.5]"

export default function MarcoZoom({ email }: { email: string }) {
  const t = useTranslations("Conferencia.marco")

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center md:px-10">
      <span className={ETIQUETA}>{t("badge")}</span>
      <h3 className={TITULO}>{t("titulo")}</h3>
      <p className={`mt-2 md:mt-3 ${AVISO}`}>{t("texto")}</p>
      {email && (
        <p className="mt-2 break-all text-[12px] font-bold text-[#0435CF] md:mt-4 md:text-[15px]">
          {email}
        </p>
      )}
      {/* El aviso de spam se OCULTA en móvil, no se encoge: el marco mide 190 px
          de alto y con esta línea el texto se salía por el borde inferior. En
          móvil manda el dato del correo; el aviso ya va también en el correo de
          confirmación. */}
      <p className="mt-3 hidden max-w-[42ch] text-[13px] leading-[1.4] text-[#8A8A8E] md:block">
        {t("spam")}
      </p>
    </div>
  )
}
