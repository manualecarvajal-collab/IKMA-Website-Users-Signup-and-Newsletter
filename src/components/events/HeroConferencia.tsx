import Link from "next/link"
import { getTranslations } from "next-intl/server"

/**
 * Hero CTA de `/events`: el anuncio de la conferencia, con el mismo lenguaje
 * visual que la landing (mismo collage, misma paleta, mismo fondo animado) pero
 * resuelto en dos columnas — texto a la izquierda, collage a la derecha — en
 * lugar del collage arriba y el texto debajo que usa la landing.
 *
 * El texto NO se copia al namespace `Events`: se leen las cadenas de
 * `Conferencia.hero`, que son literalmente las mismas (título, entradilla y
 * rótulo del botón). Así se traducen en un solo sitio y no pueden
 * desincronizarse. Es el mismo criterio que ya usa `/conferencia/speakers`.
 *
 * El botón no inscribe aquí: lleva a la landing, que es donde está el
 * formulario. Por eso es un `Link` normal y no el `SignUpButton` (ese abre el
 * pop-up de inscripción y solo tiene sentido dentro de la landing).
 *
 * FONDO. Las barras flotantes las pinta `FondoBarras`, que es fijo y cubre toda
 * la ventana: la sección va sin fondo propio a propósito, para que se vean.
 *
 * COLLAGE. Es el mismo recorte del grupo que la landing
 * (`/images/conferencia/apostol.webp`, con transparencia) sobre los tres bloques
 * planos de color. La diferencia con la landing es la caja de referencia: allí
 * el collage vive en una banda de ventana completa (70svh de alto) y aquí vive
 * en una caja ajustada a la foto, así que las proporciones van medidas contra
 * ESA caja, no contra la ventana. Los números salen de pasar las medidas de la
 * landing a porcentajes de la foto:
 *
 *   banda de bloques → 3,2 % desde arriba, 75 % de alto
 *   cada bloque      → 16,2 % del ancho de la foto
 *   hueco            → 12,2 % (la banda entera ocupa el 73 % del ancho)
 *
 * Los tres bloques y la foto van DENTRO del mismo contenedor enmascarado, y eso
 * no es un detalle: con una sola máscara sobre el conjunto, la foto translúcida
 * y los bloques se funden con el MISMO alfa y los cuerpos no dejan ver los
 * bloques de detrás. Enmascarados por separado, la foto deja pasar el color y el
 * grupo aparece rayado en franjas verticales (es el problema que ya documenta la
 * landing). Por eso aquí la máscara se aplica a todos los tamaños y no hace
 * falta el velo blanco que la landing usa en móvil.
 */
export default async function HeroConferencia() {
  const t = await getTranslations("Conferencia.hero")

  return (
    <section className="relative flex min-h-[calc(100svh-5rem)] items-center justify-center px-margin-mobile py-12 md:px-margin-desktop">
      {/* En móvil el orden se invierte (`flex-col-reverse`): primero el grupo —
          da contexto en un segundo — y debajo el titular y el botón. El orden
          del marcado se mantiene texto → collage para que el h1 siga siendo lo
          primero que se lee. */}
      <div className="flex w-full flex-col-reverse items-center gap-12 lg:flex-row lg:items-center lg:justify-center lg:gap-[min(6vw,5rem)]">
        <div className="max-w-[32rem] text-center lg:text-left">
          <h1 className="text-[clamp(2rem,3.1vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[#123045]">
            {t("title")}
          </h1>

          {/* El ancho va en `ch` a propósito: así el corte de línea aguanta los
              cambios de tamaño de fuente, igual que en la landing. `text-balance`
              reparte el texto entre las líneas en vez de dejar la última con una
              sola palabra (el "viuda" que salía a 1440 px). */}
          <p className="mx-auto mt-4 max-w-[52ch] text-balance text-[clamp(0.9rem,0.9vw,1rem)] font-semibold leading-[1.4] text-[#123045] lg:mx-0">
            {t("description")}
          </p>

          <Link
            href="/conferencia"
            className="mt-7 inline-flex items-center rounded-full bg-[#11324F] px-6 py-2.5 text-[clamp(0.85rem,0.85vw,0.95rem)] font-bold text-white transition-colors hover:bg-[#1F4D75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11324F] focus-visible:ring-offset-2"
          >
            {t("ctaPrimary")}
          </Link>
        </div>

        {/* Los topes, por orden: que no se salga en móvil (`80vw`), que no se
            coma la columna de texto cuando las dos columnas conviven (`34vw`, solo
            desde `lg`: en apilado el ancho lo manda la pantalla), que no crezca
            sin fin en pantallas grandes (`30rem`) y que no empuje el hero fuera de
            una ventana baja (`68svh`, el mismo recurso que la landing). A
            1238 × 516 el resultado —351 px de ancho— es el del diseño.

            LA MÁSCARA TERMINA EN CERO —y además termina ANTES del borde—, y esto
            no es un detalle de estilo. El archivo `apostol.webp` no viene recortado
            por silueta en la mitad inferior: los cuerpos están cortados a hueso con
            LÍNEAS RECTAS (la chaqueta del hermano acaba en horizontal al 90 % del
            lienzo, el abrigo del doctor al 87 %, el brazo del abrigo morado al
            93 %), y el 10 % de abajo del archivo es transparente. Si la máscara
            llega a esa altura con opacidad apreciable, se ven las líneas y el
            grupo parece flotar sobre un recorte.
            En el prototipo la disolución llega a cero justo sobre esas líneas (es
            lo que se ve en `tmp/cmp-ref.png`), así que aquí se hace lo mismo: la
            máscara está a cero al 95 %, que es donde el archivo ya no tiene nada
            que enseñar. Antes de tocar estos números, mirar el recorte del borde
            inferior del archivo: los cortes rectos están a esas alturas. */}
        <div className="relative w-[min(80vw,30rem,68svh)] shrink-0 lg:w-[min(34vw,30rem,68svh)] [mask-image:linear-gradient(to_bottom,#000_74%,rgba(0,0,0,0.7)_80%,rgba(0,0,0,0.34)_85%,rgba(0,0,0,0.1)_90%,transparent_95%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_74%,rgba(0,0,0,0.7)_80%,rgba(0,0,0,0.34)_85%,rgba(0,0,0,0.1)_90%,transparent_95%)]">
          {/* Los tres bloques planos. Van quietos a propósito: lo que se mueve
              en esta página son las barras del fondo. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[3.2%] flex h-[75%] justify-center gap-[12.2%]"
          >
            <div className="h-full w-[16.2%] bg-[#1F4D75]" />
            <div className="h-full w-[16.2%] bg-[#B27A59]" />
            <div className="h-full w-[16.2%] bg-[#8C9487]" />
          </div>

          {/* La foto define el alto de la caja (1417 × 1400) y trae su propia
              transparencia. `alt` vacío: es decoración y el titular de al lado
              ya dice de qué va. */}
          <img
            src="/images/conferencia/apostol.webp"
            alt=""
            width={1417}
            height={1400}
            className="relative w-full"
          />
        </div>
      </div>
    </section>
  )
}
