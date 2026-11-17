import { getTranslations } from "next-intl/server"
import CoroGaleria, { type FotoCoro } from "./CoroGaleria"

/**
 * Sección «Coro» de `/events`: la ciudad que acoge el congreso.
 *
 * POR QUÉ EXISTE. La mayoría de los que vendrán al congreso no conocen
 * Venezuela, así que el hero anuncia el congreso y esta sección presenta el
 * sitio: historia, patrimonio y naturaleza de Coro, con fotos.
 *
 * FOTOS. Son de Wikimedia Commons, con licencia libre, y por eso llevan autor y
 * licencia en el visor y en el crédito del final (las CC BY-SA lo exigen). Están
 * recortadas a la proporción en la que se muestran para no servir píxeles que
 * nadie ve. Si IKMA consigue fotos propias, se cambian los archivos y las
 * entradas de `ORIGEN` y se borra el crédito; el resto no se toca.
 *
 * DATO. Los Médanos no son «el desierto más extenso de América» —el de Atacama
 * pasa de los 100.000 km² y este parque ronda los 90—, así que el texto habla de
 * dunas que se mueven con los alisios y de corredor biológico, que sí es cierto.
 */

const LIC = {
  by2: "https://creativecommons.org/licenses/by/2.0/",
  bysa3: "https://creativecommons.org/licenses/by-sa/3.0/",
  bysa4: "https://creativecommons.org/licenses/by-sa/4.0/",
}

/** Origen de cada archivo: autor, licencia y página de la que sale. */
const ORIGEN = {
  calle: {
    autor: "Grégory David Escobar Fernández",
    licencia: "CC BY 2.0",
    licenciaUrl: LIC.by2,
    pagina: "https://commons.wikimedia.org/wiki/File:Calle_en_Coro_2.JPG",
  },
  esquina: {
    autor: "LBM1948",
    licencia: "CC BY-SA 4.0",
    licenciaUrl: LIC.bysa4,
    pagina: "https://commons.wikimedia.org/wiki/File:Coro_(2003)_06.jpg",
  },
  catedral: {
    autor: "Janethrodri",
    licencia: "CC BY-SA 4.0",
    licenciaUrl: LIC.bysa4,
    pagina: "https://commons.wikimedia.org/wiki/File:Fachada_de_la_Catedral_de_Coro.jpg",
  },
  medanos: {
    autor: "Rjcastillo",
    licencia: "CC BY-SA 3.0",
    licenciaUrl: LIC.bysa3,
    pagina: "https://commons.wikimedia.org/wiki/File:Medanos_de_Coro_IV.jpg",
  },
  colonial: {
    autor: "Carlos Santos Colorado",
    licencia: "CC BY-SA 3.0",
    licenciaUrl: LIC.bysa3,
    pagina:
      "https://commons.wikimedia.org/wiki/File:Calle_colonial_del_Centro_Hist%C3%B3rico_de_Coro.jpg",
  },
  empedrada: {
    autor: "Juan Carlo Castillo Ortega",
    licencia: "CC BY-SA 3.0",
    licenciaUrl: LIC.bysa3,
    pagina: "https://commons.wikimedia.org/wiki/File:Calle_empredrada_de_Coro.JPG",
  },
  sol: {
    autor: "Gabitix 1",
    licencia: "CC BY-SA 3.0",
    licenciaUrl: LIC.bysa3,
    pagina: "https://commons.wikimedia.org/wiki/File:Sol_y_Dunas.jpg",
  },
  plaza: {
    autor: "ArwinJ",
    licencia: "CC BY-SA 4.0",
    licenciaUrl: LIC.bysa4,
    pagina: "https://commons.wikimedia.org/wiki/File:Plaza_Bol%C3%ADvar_de_Santa_Ana_de_Coro.JPG",
  },
} as const

export default async function CoroSection() {
  const t = await getTranslations("Events.coro")

  const datos = [
    { valor: t("dato1Valor"), etiqueta: t("dato1Texto") },
    { valor: t("dato2Valor"), etiqueta: t("dato2Texto") },
    { valor: t("dato3Valor"), etiqueta: t("dato3Texto") },
    { valor: t("dato4Valor"), etiqueta: t("dato4Texto") },
  ]

  const foto = (
    clave: keyof typeof ORIGEN,
    src: string,
    n: number,
    w: number,
    h: number
  ): FotoCoro => ({
    src: `/images/events/coro/${src}`,
    alt: t(`foto${n}Alt`),
    pie: t(`foto${n}Pie`),
    w,
    h,
    ...ORIGEN[clave],
  })

  const destacada = foto("calle", "coro-calle.webp", 1, 1600, 900)
  const fotos = [
    foto("esquina", "coro-esquina.webp", 2, 860, 644),
    foto("catedral", "coro-catedral.webp", 3, 760, 950),
    foto("medanos", "coro-medanos.webp", 4, 860, 646),
  ]
  const ticker = [
    foto("colonial", "ticker-1-calle-colonial.webp", 5, 760, 570),
    foto("empedrada", "ticker-2-calle-empedrada.webp", 6, 760, 570),
    foto("sol", "ticker-3-sol-dunas.webp", 7, 760, 570),
    foto("plaza", "ticker-4-plaza-bolivar.webp", 8, 760, 570),
  ]

  return (
    <section className="border-t border-outline-variant/40 bg-surface-bright py-14 md:py-20">
      <div className="mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-desktop">
        {/* ------------------------------------------------------- entrada */}
        <div className="max-w-[46rem]">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-primary-container">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-balance font-headline-lg text-[clamp(1.6rem,2.6vw,2.5rem)] font-bold leading-[1.12] text-on-surface">
            {t("title")}
          </h2>
          <p className="mt-4 text-balance text-[clamp(0.95rem,1.1vw,1.1rem)] leading-[1.6] text-on-surface-variant">
            {t("lead")}
          </p>
        </div>

        {/* --------------------------------------------------------- datos */}
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-outline-variant/40 py-6 md:grid-cols-4">
          {datos.map((d) => (
            <div key={d.valor}>
              <dt className="font-headline-md text-[clamp(1.05rem,1.35vw,1.35rem)] font-bold text-[#0031C7]">
                {d.valor}
              </dt>
              <dd className="mt-1 text-[0.82rem] leading-[1.45] text-on-surface-variant">{d.etiqueta}</dd>
            </div>
          ))}
        </dl>

        {/* --------------------------------------------------------- texto */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-10">
          <p className="text-[0.95rem] leading-[1.65] text-on-surface-variant">{t("historia")}</p>
          <p className="text-[0.95rem] leading-[1.65] text-on-surface-variant">{t("naturaleza")}</p>
        </div>

        {/* ------------------------------ fotos, carrusel y visor (cliente) */}
        <CoroGaleria
          destacada={destacada}
          fotos={fotos}
          ticker={ticker}
          etiquetas={{ cerrar: t("cerrar"), anterior: t("anterior"), siguiente: t("siguiente") }}
        />

        {/* ------------------------------------------------------ créditos */}
        <p className="mt-8 text-[0.68rem] leading-[1.6] text-outline/80">
          {t("creditos")}{" "}
          {[destacada, ...fotos, ...ticker].map((f, i) => (
            <span key={f.src}>
              {i > 0 && " · "}
              <a
                href={f.pagina}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                {f.autor}
              </a>
              {` (${f.licencia})`}
            </span>
          ))}
          {" — "}
          <a
            href="https://commons.wikimedia.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Wikimedia Commons
          </a>
        </p>
      </div>
    </section>
  )
}
