import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import ConferenciaNav from "@/components/conferencia/ConferenciaNav"
import FondoBarras from "@/components/conferencia/FondoBarras"
import ConferenciaCountdown from "@/components/conferencia/ConferenciaCountdown"
import CardVideo from "@/components/conferencia/CardVideo"
import GalleryCard from "@/components/conferencia/GalleryCard"
import Revelar from "@/components/conferencia/Revelar"
import { PONENTES } from "@/components/conferencia/ponentes"
import HorizontalRail from "@/components/conferencia/HorizontalRail"
import BotonReenviarEnlace from "@/components/conferencia/BotonReenviarEnlace"
import SignUpButton from "@/components/conferencia/SignUpButton"
import SignupCard from "@/components/conferencia/SignupCard"
import Presencia from "@/components/conferencia/Presencia"
import DirectoPanel from "@/components/conferencia/DirectoPanel"
import DirectoVivo from "@/components/conferencia/DirectoVivo"
import { emailConfirmado, emailPendiente, getDirecto } from "@/lib/conferencia"
import { createAdminClient } from "@/lib/supabase/server"
import "./fondo.css"

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
 * Hero con collage: el recorte del grupo (`apostol.webp`, con transparencia,
 * así que el fondo respira entre las personas) sobre dos bloques planos de
 * color. Las posiciones de los bloques van en porcentaje del ancho de la foto y
 * salen de medir el fotograma del prototipo, no de estimarlos a ojo.
 *
 * El fondo es fijo, así el mismo campo claro y las mismas barras acompañan a
 * toda la página durante el recorrido del riel.
 */
export default async function ConferenciaPage() {
  const t = await getTranslations("Conferencia.hero")

  // Si este navegador ya verificó una inscripción, el formulario no se renderiza
  // en absoluto: el riel arranca en las tarjetas. Se resuelve en el servidor
  // para que no haya un parpadeo mostrando el formulario.
  const yaInscrito = await emailConfirmado()

  // Confirmado en este navegador pero SIN haber abierto todavía el enlace del
  // correo. No puede ver la transmisión —eso lo da el enlace—, pero tampoco
  // tiene que volver a inscribirse: su sitio es la pantalla que le habla de su
  // correo. Distinguir esto es lo que evita que el día del evento alguien repita
  // el registro creyendo que no llegó a hacerlo.
  const pendiente = yaInscrito ? null : await emailPendiente()
  /** Confirmado, con enlace abierto o sin él: ya no se le ofrece inscribirse. */
  const registrado = !!(yaInscrito || pendiente)
  /** A quién se le reenvía el enlace. */
  const suEmail = yaInscrito ?? pendiente ?? ""

  // Estado del directo, que fija un administrador desde el panel. El panel 5
  // reacciona a él: contador mientras no haya nada que ver, la transmisión para
  // quien está dentro, el bloqueo para quien no.
  const directo = await getDirecto(await createAdminClient())

  return (
    <>
      {/* Fondo compartido por toda la página: campo claro y barras flotantes.
          Sustituye al vídeo azul de Remotion — ver `FondoBarras`. */}
      <FondoBarras />

      <ConferenciaNav />

      {/* Latido anónimo que alimenta "conectados ahora" en el panel */}
      <Presencia />

      {/* 1 · Hero — scroll normal.
          Collage arriba (dos bloques planos + el recorte del grupo) y bloque de
          texto abajo, pisando el borde inferior de la foto, como en el
          prototipo.

          Alto y ancho se tienen en cuenta a la vez: la sección mide justo una
          ventana y TODAS las medidas de texto llevan `min(<vw>, <svh>)`. Así, en
          una ventana ancha pero baja (un portátil de 1366×768, por ejemplo) el
          hero se encoge entero en lugar de salirse por abajo, y en una 16:9
          grande crece hasta el tope. Con solo `vw` se salía. */}
      <section className="relative flex flex-col items-center px-4 pb-[min(24px,2.2svh)] pt-[min(76px,7svh)] lg:h-svh">
        {/* Banda de tres bloques. Dos correcciones sobre lo primero que hice:
            (1) son TRES, no dos — el del centro (terracota) queda casi entero
            tapado por las personas en el fotograma del vídeo, y los trozos que
            asomaban los descarté como tonos de piel;
            (2) no son anchos y bajos: son 2,6 veces más altos que anchos.
            Medidas de la captura del diseño (1920×1080): bloques de 159 × 416,
            huecos de 39, banda de x 679 a 1238 y de y 141 a 556. En
            proporciones: 8,3 % del ancho cada bloque, 2 % de hueco, y la banda
            del 13,1 % al 65 % del alto (ojo: el bloque sigue desvaneciéndose por
            debajo de donde el color deja de ser exacto, así que su alto real es
            mayor que el que da medir el color a rajatabla).
            Va fuera del contenedor de la foto a propósito: la banda está
            centrada en la página, no en el lienzo de la foto (el recorte trae
            el grupo descentrado, así que atarla a él la descolocaba).
            Y lleva máscara porque en el diseño los bloques NO acaban en línea
            recta: se disuelven por abajo (sólidos hasta el 70 % del alto, y de
            ahí al fondo). Sin ella el borde inferior es un corte seco, que es
            justo lo que hacía que se vieran raros. La máscara va en la banda y
            no en cada bloque: así los tres se desvanecen igual con una regla. */}
        {/* La banda de bloques y la foto van DENTRO del mismo contenedor y
            comparten UNA sola máscara. Es la clave de todo este asunto: si se
            enmascaran por separado, la foto translúcida deja ver los bloques de
            detrás y el cuerpo aparece rayado en franjas verticales. Con una
            máscara común, los dos se desvanecen con el MISMO alfa y eso no puede
            pasar.
            Además, la foto va bajada a propósito (4svh) para que su borde
            inferior —un corte recto del recorte— caiga dentro del fundido: así
            desaparece en lugar de leerse como una línea.

            Geometría, en % de este contenedor (que mide 64svh):
              banda → del 9,5 % al 90,8 %, que son el 13,1 %–65,1 % de la ventana
              foto  → del 6,25 % al 93,75 %, o sea el 11 %–67 % de la ventana */}
        <div className="relative flex w-full shrink-0 justify-center lg:h-[70svh] lg:[mask-image:linear-gradient(to_bottom,#000_66%,rgba(0,0,0,0.5)_82%,rgba(0,0,0,0.14)_94%,transparent_100%)] lg:[-webkit-mask-image:linear-gradient(to_bottom,#000_66%,rgba(0,0,0,0.5)_82%,rgba(0,0,0,0.14)_94%,transparent_100%)]">
          {/* Los tres bloques: 8,3 % del ancho cada uno, con huecos del 2 %.
              VAN QUIETOS a propósito: el movimiento es cosa de las barras
              translúcidas del fondo, no de la banda del collage. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[8.7%] flex h-[52%] justify-center gap-[2%] sm:h-[62%] lg:h-[70%]"
          >
            <div className="h-full w-[8.3%] bg-[#1F4D75]" />
            <div className="h-full w-[8.3%] bg-[#B27A59]" />
            <div className="h-full w-[8.3%] bg-[#8C9487]" />
          </div>


          {/* El recorte trae transparencia propia (el claro del fondo se ve entre
              las personas). `alt` vacío a propósito: es decoración, y el titular
              de al lado ya dice de qué va la página. */}
          <img
            src="/images/conferencia/apostol.webp"
            alt=""
            width={1417}
            height={1400}
            className="relative mt-[18.5%] w-[min(78vw,60svh)] self-start sm:w-[min(52vw,63svh)] lg:mt-[5.7%] lg:w-[min(41vw,66svh)]"
          />

          {/* Velo blanco equivalente a la máscara, solo por debajo de lg: la
              máscara iba del 61 al 100 % del contenedor, y aquí esos mismos
              valores van como opacidad de blanco (0.5 al 46 % del velo, 0.86 al
              82 %). Mismo aspecto, pero la foto NO se vuelve translúcida, así
              que los bloques de detrás no pueden asomar a través de los cuerpos.
              En escritorio no se pinta: ahí sigue la máscara original. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[39%] bg-[linear-gradient(to_bottom,transparent_0%,rgba(248,248,249,0.5)_46%,rgba(248,248,249,0.86)_82%,#F8F8F9_100%)] lg:hidden"
          />

        </div>

        <div className="relative -mt-[9.7%] flex w-full max-w-[820px] flex-col items-center text-center lg:-mt-[22svh]">
          {/* Etiqueta + enlace al sitio */}
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            <span className="rounded-full bg-[#11324F] px-[min(20px,1.85svh)] py-[min(6px,0.55svh)] text-[clamp(min(0.68rem,1.01svh),min(0.68vw,1.2svh),0.85rem)] font-semibold text-white">
              {t("badge")}
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[clamp(min(0.68rem,1.01svh),min(0.68vw,1.2svh),0.85rem)] font-semibold text-[#123045] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123045] focus-visible:ring-offset-2"
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
            </Link>
          </div>

          {/* Titular */}
          <h1 className="mt-[min(17px,1.45svh)] text-[clamp(min(2.4rem,3.56svh),min(3.5vw,6.2svh),4.2rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[#123045]">
            {t("title")}
          </h1>

          {/* Descripción. El ancho va en `ch` a propósito: así el corte de línea
              se mantiene al cambiar el tamaño de la fuente, y el texto parte por
              donde parte en el prototipo ("…who serve / their communities…"). */}
          <p className="mt-[min(13px,1.15svh)] max-w-[62ch] text-[clamp(min(0.9rem,1.33svh),min(0.87vw,1.55svh),1.05rem)] font-semibold leading-[1.4] text-[#123045]">
            {registrado ? t("descriptionDentro") : t("description")}
          </p>

          {/* Botones. Cambian según el estado, y no es cosmético: a quien ya
              está inscrito no se le puede ofrecer inscribirse —lo hizo— ni
              mandar a "contacta para más información", que era lo que decía el
              botón cuando la duda del usuario era otra. */}
          <div className="mt-[min(13px,1.15svh)] flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {registrado ? (
              <>
                {/* Lo único que puede necesitar quien ya está dentro: que le
                    vuelva a llegar la llave. */}
                <BotonReenviarEnlace
                  email={suEmail}
                  label={t("ctaReenviar")}
                  className="rounded-full bg-[#11324F] px-[min(28px,2.6svh)] py-[min(10px,0.95svh)] text-[clamp(min(0.8rem,1.19svh),min(0.78vw,1.38svh),1rem)] font-bold text-white transition-colors hover:bg-[#1F4D75] disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11324F] focus-visible:ring-offset-2"
                />
                <Link
                  href="/conferencia/speakers"
                  className="text-[clamp(min(0.8rem,1.19svh),min(0.78vw,1.38svh),1rem)] font-bold text-[#123045] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123045] focus-visible:ring-offset-2"
                >
                  {t("ctaPonentes")}
                </Link>
              </>
            ) : (
              <>
                <SignUpButton
                  label={t("ctaPrimary")}
                  className="rounded-full bg-[#11324F] px-[min(28px,2.6svh)] py-[min(10px,0.95svh)] text-[clamp(min(0.8rem,1.19svh),min(0.78vw,1.38svh),1rem)] font-bold text-white transition-colors hover:bg-[#1F4D75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11324F] focus-visible:ring-offset-2"
                />
                {/* El secundario es TEXTO, sin borde ni pastilla: así aparece en
                    el prototipo. */}
                <a
                  href="/contact-us"
                  className="text-[clamp(min(0.8rem,1.19svh),min(0.78vw,1.38svh),1rem)] font-bold text-[#123045] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123045] focus-visible:ring-offset-2"
                >
                  {t("ctaSecondary")}
                </a>
              </>
            )}
          </div>

          {/* Fecha y contador */}
          <p className="mt-[min(22px,2svh)] text-[clamp(min(0.95rem,1.41svh),min(0.9vw,1.6svh),1.15rem)] font-semibold tracking-[0.01em] text-[#123045]">
            {t("date")}
          </p>
          <p className="mt-[min(5px,0.45svh)] text-[clamp(min(0.8rem,1.19svh),min(0.78vw,1.38svh),1rem)] font-semibold text-[#123045]">
            {t("countdownLabel")}
          </p>
          <ConferenciaCountdown />

          {/* Debajo del contador: la invitación a bajar. Solo la ve quien puede
              ver la conferencia —a quien no está inscrito no se le ofrece una
              salida de la página, que lo que tiene que hacer es el formulario—.
              Es un enlace de verdad: además de pedirlo, lleva al riel. */}
          {yaInscrito && (
            <a
              href="#registro"
              className="mt-[min(20px,1.8svh)] inline-flex flex-col items-center gap-1 text-[clamp(min(0.72rem,1.07svh),min(0.7vw,1.24svh),0.9rem)] font-semibold text-[#123045] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11324F] focus-visible:ring-offset-2"
            >
              {t("scrollConferencia")}
              <svg
                viewBox="0 0 24 24"
                className="conf-flecha h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </a>
          )}
        </div>
      </section>

      {/* 2 · Secuencia: una card por paso de scroll, cada una centrada.
          Si el usuario YA está inscrito, el panel del formulario no existe: el
          riel empieza en las tarjetas y desde el hero se entra directo en la
          animación. Por eso `hasForm` se le pasa al riel — sin ese dato trataría
          la primera tarjeta como si fuera el formulario. */}
      <HorizontalRail
        id="registro"
        hasForm={!yaInscrito}
        // El marco del directo SOLO se pinta para quien puede verlo: enseñar
        // una transmisión bloqueada a quien tiene que inscribirse no aporta
        // nada, y en el riel cuesta un tramo entero de scroll.
        hasVideo={!!yaInscrito}
      >
        {/* Panel 1 — formulario + vídeo. Solo para quien no se ha inscrito.
            La columna del vídeo mide 9:16 exacto (400 × 711), la proporción
            nativa del archivo, así que no se recorta nada. */}
        {!yaInscrito && (
          <Revelar>
          <div className="w-[min(92vw,1040px)] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(8,18,38,0.35)] md:grid md:w-[1040px] md:grid-cols-[1fr_400px]">
            {/* Formulario — laterales +20 %: 24 → 28,8 px y 40 → 48 px */}
            <div className="px-[1.8rem] py-8 md:flex md:items-center md:px-12 md:py-10">
              <SignupCard pendiente={pendiente} />
            </div>

            {/* Vídeo vertical a la derecha: testimonios de la asociación.
                El fondo azul es solo el respaldo mientras carga el póster. */}
            <div className="relative aspect-[9/16] bg-[#0b3f6b]">
              <CardVideo src={FORM_VIDEO} poster={FORM_POSTER} />
            </div>
          </div>
          </Revelar>
        )}

        {/* Paneles 2..7 — una tarjeta por PONENTE, cuadradas y del mismo
            tamaño. Son seis (antes tres): el riel reparte el abanico según
            cuántas haya, así que añadir tarjetas no necesita tocar nada más. */}
        {/* Las fichas de los ponentes solo van para quien está dentro. Tenían
            sentido como transición hacia el marco del directo —el abanico se
            abría y el marco entraba—, pero quitado el marco para los demás
            visitantes se quedan en una galería que se abre hacia ningún sitio, y
            en el riel cuestan seis tramos de scroll. Quien quiera verlas tiene
            la página de ponentes, con su foto, su biografía y su horario. */}
        {yaInscrito &&
          PONENTES.map((ponente) => (
            <GalleryCard
              key={ponente.id}
              foto={ponente.foto}
              nombre={ponente.nombre}
            />
          ))}

        {/* Panel 5 — el directo. NO se pinta para quien no está dentro: una
            transmisión bloqueada no le sirve de nada a quien tiene que
            inscribirse, y en el riel costaba un tramo entero de scroll que
            además el visitante no podía aprovechar. Por eso el riel recibe
            `hasVideo`: sin él trataría a la última ficha como si fuera el marco.
            Qué se ve aquí lo decide `DirectoPanel` a partir del estado que fija
            el panel de administración: contador, transmisión, aviso de pausa o
            cierre. */}
        {yaInscrito && (
          <GalleryCard expandToVideo>
            {/* Escucha los cambios de estado para que lleguen sin recargar. */}
            <DirectoVivo
              estado={directo.estado}
              url={directo.url}
              embed={directo.embed}
            />
            <DirectoPanel
              estado={directo.estado}
              inscrito
              url={directo.url}
              embed={directo.embed}
            />
          </GalleryCard>
        )}
      </HorizontalRail>
    </>
  )
}
