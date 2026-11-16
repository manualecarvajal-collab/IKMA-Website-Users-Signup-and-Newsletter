import Link from "next/link"
import { getTranslations } from "next-intl/server"

/**
 * Hero de `/events`: el anuncio del IV Congreso Internacional (2027).
 *
 * Sustituye al anuncio de la conferencia de 2026, que ya pasó. Del congreso de
 * 2027 todavía no hay programa ni inscripción —solo fecha y sede—, así que este
 * hero no lleva botón de inscripción: no hay nada a lo que apuntar. Lo que sí
 * lleva es una salida (contacto) para quien pregunte, porque una página que no
 * ofrece ninguna acción es un callejón sin salida.
 *
 * LA IMAGEN. El diseño de IKMA es una pieza compuesta —lockup del congreso,
 * «SAVE THE DATE!», sede y escudos sobre una foto de manos— y va como imagen
 * única cuando esté el archivo exportado: es la forma fiel de reproducirlo y no
 * inventar tipografías. Mientras no esté, se pinta la misma información con la
 * tipografía del sitio y un panel con el degradado azul del diseño, para que la
 * página anuncie el congreso desde hoy y no quede un hueco roto.
 *
 * PARA CAMBIARLO A LA IMAGEN: poner el archivo en
 * `public/images/events/congreso-2027.jpg` y sustituir el bloque marcado
 * `PANEL` por un `<img>` con `alt` describiendo el cartel. Un solo sitio.
 */
export default async function HeroCongreso() {
  const t = await getTranslations("Events.congreso")

  return (
    <section className="relative flex min-h-[calc(100svh-5rem)] items-center justify-center bg-surface-bright px-margin-mobile py-12 md:px-margin-desktop">
      <div className="flex w-full max-w-container-max flex-col-reverse items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        {/* Columna de texto. Es lo primero del marcado para que el `h1` siga
            siendo lo primero que se lee, aunque en móvil se vea debajo. */}
        <div className="max-w-[34rem] text-center lg:text-left">
          <p className="font-label-bold text-label-bold uppercase tracking-[0.18em] text-primary">
            {t("eyebrow")}
          </p>

          <h1 className="mt-3 text-[clamp(2rem,3.4vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.02em] text-on-surface">
            {t("title")}
          </h1>

          <p className="mx-auto mt-4 max-w-[46ch] text-balance text-[clamp(0.95rem,1vw,1.05rem)] font-semibold leading-[1.5] text-on-surface-variant lg:mx-0">
            {t("description")}
          </p>

          <dl className="mx-auto mt-6 flex flex-col gap-2 text-[clamp(0.9rem,0.95vw,1rem)] lg:mx-0">
            <div className="flex items-baseline justify-center gap-2 lg:justify-start">
              <dt className="font-semibold text-on-surface-variant">{t("placeLabel")}</dt>
              <dd className="font-bold text-on-surface">{t("place")}</dd>
            </div>
            <div className="flex items-baseline justify-center gap-2 lg:justify-start">
              <dt className="font-semibold text-on-surface-variant">{t("dateLabel")}</dt>
              <dd className="font-bold text-on-surface">{t("date")}</dd>
            </div>
          </dl>

          <Link
            href="/contact-us"
            className="mt-7 inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-[clamp(0.85rem,0.85vw,0.95rem)] font-bold text-on-primary transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {t("cta")}
          </Link>
        </div>

        {/* PANEL — aquí va la imagen del cartel cuando exista el archivo.
            Mientras tanto, el mismo aire que el diseño: panel claro con el
            degradado azul y, dentro, el nombre del congreso y la llamada. */}
        <div
          aria-hidden="true"
          className="relative flex aspect-[4/3] w-full max-w-[34rem] shrink-0 items-center justify-center overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#F7FBFF_0%,#E8F3FF_45%,#D6E9FF_100%)] shadow-[0_24px_60px_rgba(4,14,32,0.12)] lg:aspect-[16/11] lg:max-w-[42rem]"
        >
          <div className="px-8 text-center">
            <p className="text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-none tracking-[-0.03em] text-primary">
              {t("bigYear")}
            </p>
            <p className="mt-2 text-[clamp(0.85rem,1.1vw,1.1rem)] font-bold uppercase tracking-[0.22em] text-primary/80">
              {t("bigLabel")}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
