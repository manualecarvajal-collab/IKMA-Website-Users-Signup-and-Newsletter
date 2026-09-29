import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import ConferenciaNav from "@/components/conferencia/ConferenciaNav"
import ConferenciaCountdown from "@/components/conferencia/ConferenciaCountdown"
import CardVideo from "@/components/conferencia/CardVideo"
import GalleryCard from "@/components/conferencia/GalleryCard"
import HorizontalRail from "@/components/conferencia/HorizontalRail"
import SignUpButton from "@/components/conferencia/SignUpButton"
import SignupCard from "@/components/conferencia/SignupCard"
import Presencia from "@/components/conferencia/Presencia"
import { emailConfirmado } from "@/lib/conferencia"

/**
 * El título y la descripción salen de i18n: se ven en la pestaña del
 * navegador, en los resultados de búsqueda y al compartir el enlace, así que
 * también tienen que cambiar con el idioma.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Conferencia.meta")
  return { title: t("title"), description: t("description") }
}

/**
 * Vídeo de la tarjeta de inscripción (la mitad derecha del prototipo).
 * Es vertical (720×1280) y pesa varios MB, así que se carga solo cuando el
 * bloque entra en pantalla — ver `CardVideo`.
 */
const FORM_VIDEO = "/videos/conferencia-form.mp4"
const FORM_POSTER = "/images/conferencia/form-poster.jpg"

/**
 * Landing de la conferencia (temporal, schema aislado `conferencia`).
 *
 * Cómo se comporta el scroll:
 *   1. Hero — scroll **normal**: la página sube y el hero se va hacia arriba.
 *   2. Formulario → tarjetas — al llegar al formulario la sección se fija y el
 *      scroll **vertical pasa a mover el contenido en horizontal**: el
 *      formulario es el primer panel del riel y, al seguir bajando, se desliza
 *      a la izquierda mientras entran las tarjetas y, al final, el vídeo.
 *
 * El fondo (vídeo de Remotion, ver `video/`) es fijo, así el azul queda
 * continuo en todo el recorrido.
 */
export default async function ConferenciaPage() {
  const t = await getTranslations("Conferencia.hero")
  const tForm = await getTranslations("Conferencia.form")

  // Si este navegador ya verificó una inscripción, el formulario no se renderiza
  // en absoluto: el riel arranca en las tarjetas. Se resuelve en el servidor
  // para que no haya un parpadeo mostrando el formulario.
  const yaInscrito = await emailConfirmado()

  return (
    <>
      {/* Fondo animado compartido por toda la página */}
      <div aria-hidden="true" className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_38%,#1289D4_0%,#0068B6_45%,#004A85_100%)]" />
        {/* Tres calidades del mismo render: el navegador elige según el ancho */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source
            src="/videos/conferencia-hero-4k.mp4"
            media="(min-width: 1920px)"
            type="video/mp4"
          />
          <source
            src="/videos/conferencia-hero-1440.mp4"
            media="(min-width: 1024px)"
            type="video/mp4"
          />
          <source src="/videos/conferencia-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#00325c]/20" />
      </div>

      <ConferenciaNav />

      {/* Latido anónimo que alimenta "conectados ahora" en el panel */}
      <Presencia />

      {/* 1 · Hero — scroll normal */}
      <section className="relative flex h-svh flex-col items-center justify-center px-4 pb-20 pt-32">
        <div className="relative flex w-full max-w-[820px] flex-col items-center text-center">
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <span className="rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold text-[#0068B6] shadow-sm">
              {t("badge")}
            </span>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded text-[13px] font-medium text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {t("officialWebsite")}
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M14 4h6v6" />
                <path d="M20 4 11 13" />
                <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
              </svg>
            </a>
          </div>

          {/* Título */}
          <h1 className="mt-7 text-[clamp(2.1rem,5.6vw,4rem)] font-bold leading-[1.08] tracking-[-0.01em] text-white">
            {t("title")}
          </h1>

          {/* Descripción */}
          <p className="mt-6 max-w-[56ch] text-[15px] leading-[1.55] text-white/90 md:text-[16px]">
            {t("description")}
          </p>

          {/* Botones. Ya inscrito, el principal deja de ofrecer una inscripción
              que existe y pasa a invitar a entrar en las tarjetas; sigue
              apuntando a `#registro`, que ahora es el arranque del riel. */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <SignUpButton
              label={yaInscrito ? tForm("doneCta") : t("ctaPrimary")}
              className="rounded-full bg-white px-7 py-3 text-[15px] font-bold text-[#0068B6] transition-colors hover:bg-[#0068B6] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0068B6]"
            />
            <a
              href="/contact-us"
              className="rounded-full border border-white/80 px-7 py-3 text-[15px] font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0068B6]"
            >
              {t("ctaSecondary")}
            </a>
          </div>

          {/* Fecha y contador */}
          <p className="mt-10 text-[17px] font-semibold tracking-[0.01em] text-white">
            {t("date")}
          </p>
          <p className="mt-2 text-[15px] font-semibold text-white">
            {t("countdownLabel")}
          </p>
          <ConferenciaCountdown />
        </div>
      </section>

      {/* 2 · Secuencia: una card por paso de scroll, cada una centrada.
          Si el usuario YA está inscrito, el panel del formulario no existe: el
          riel empieza en las tarjetas y desde el hero se entra directo en la
          animación. Por eso `hasForm` se le pasa al riel — sin ese dato trataría
          la primera tarjeta como si fuera el formulario. */}
      <HorizontalRail id="registro" hasForm={!yaInscrito}>
        {/* Panel 1 — formulario + vídeo. Solo para quien no se ha inscrito.
            La columna del vídeo mide 9:16 exacto (400 × 711), la proporción
            nativa del archivo, así que no se recorta nada. */}
        {!yaInscrito && (
          <div className="w-[min(92vw,1040px)] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(8,18,38,0.35)] md:grid md:w-[1040px] md:grid-cols-[1fr_400px]">
            {/* Formulario — laterales +20 %: 24 → 28,8 px y 40 → 48 px */}
            <div className="px-[1.8rem] py-8 md:flex md:items-center md:px-12 md:py-10">
              <SignupCard />
            </div>

            {/* Vídeo vertical a la derecha: testimonios de la asociación.
                El fondo azul es solo el respaldo mientras carga el póster. */}
            <div className="relative aspect-[9/16] bg-[#0b3f6b]">
              <CardVideo src={FORM_VIDEO} poster={FORM_POSTER} />
            </div>
          </div>
        )}

        {/* Paneles 2..4 — tarjetas de la galería, cuadradas y del mismo
            tamaño. Van vacías: ahí van las fotos. */}
        {[0, 1, 2].map((i) => (
          <GalleryCard key={i} />
        ))}

        {/* Panel 5 — el directo: nace cuadrado como las demás y, al quedar
            centrado, se agranda a horizontal.
            Aquí irá el vídeo de la transmisión por Zoom. Mientras no exista, se
            muestra el mismo contador del hero: comparte la fecha límite vía
            `components/conferencia/event.ts`, así que no hay dos valores que
            puedan desincronizarse. */}
        <GalleryCard expandToVideo>
          <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
            <p className="text-[13px] font-semibold text-[#0035CC] md:text-[17px]">
              {t("countdownLabel")}
            </p>
            <div className="mt-6 md:mt-10">
              <ConferenciaCountdown variant="panel" />
            </div>
          </div>
        </GalleryCard>
      </HorizontalRail>
    </>
  )
}
