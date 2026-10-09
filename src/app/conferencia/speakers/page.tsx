import type { Metadata } from "next"
import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"
import ConferenciaNav from "@/components/conferencia/ConferenciaNav"
import FondoBarras from "@/components/conferencia/FondoBarras"
import Revelar from "@/components/conferencia/Revelar"
import {
  COLOR_TIPO,
  CON_FOTO,
  EQUIPO,
  PROGRAMA,
  nombreDe,
  ponenteDe,
  sesionDePonente,
} from "@/components/conferencia/programa"
import "../fondo.css"
import "./speakers.css"

/**
 * Ponentes de la conferencia: `/conferencia/speakers`.
 *
 * Página anexa a la landing, con la misma identidad (mismo fondo de barras,
 * misma nav flotante, misma paleta) pero con otro trabajo: aquí no se pide la
 * inscripción, se presenta a la gente del día.
 *
 * ARRANCA CON EL TEXTO DE LA CONFERENCIA, entero y en los dos idiomas (los
 * párrafos que mandó IKMA, con la pregunta "¿Qué tienes en tu mano?" sacada a su
 * sitio), y de ahí baja al pliego. La página se lee en el orden en que se
 * presenta la conferencia: de qué va, quién habla, a qué hora y quién es.
 *
 * Cada fila del pliego lleva DOS bloques separados por una regla: arriba la
 * sesión (tipo, tema, apunte) y abajo la persona (su biografía). No es una
 * separación decorativa: son dos informaciones distintas y mezcladas se leen
 * como una sola cosa.
 *
 * EL DISEÑO. El documento que mandó IKMA no es un dossier de biografías: es un
 * orden de participación de producción ("09:40- 10:10 / Ap Carlos De Léon"), con
 * horas de reloj, quién habla y de qué. Así que la página no inventa fichas de
 * "sobre mí" —no hay material para eso y rellenarlo sería inventarse a las
 * personas—: se compone como EL PLIEGO de ese documento. Reglas horizontales,
 * horas en monoespaciada en una columna fija, el tipo de sesión en una pestaña
 * de color en el canto, y los retratos recortados apoyados en la regla, que es
 * lo que rompe el pliego y evita que parezca una tabla.
 *
 * Las medidas de la retícula (92 / 210 px) son fijas a propósito: la columna de
 * la hora y la del retrato no cambian de una fila a otra, así que todos los
 * textos arrancan en la misma vertical. Es lo que hace que se lea como un
 * documento y no como una lista de tarjetas.
 *
 * MÓVIL: pendiente. Se le ha dado solo una caída vertical simple para que no se
 * rompa, sin ninguna decisión de diseño: la versión de celular la tiene que
 * dirigir IKMA.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Conferencia.speakers.meta")
  return { title: t("title"), description: t("description") }
}

export default async function SpeakersPage() {
  const t = await getTranslations("Conferencia.speakers")
  const tHero = await getTranslations("Conferencia.hero")
  // Los temas vienen en los dos idiomas en el propio documento, así que se
  // eligen por locale en lugar de duplicar la tabla del día por idioma.
  const locale = (await getLocale()) as "en" | "es"

  return (
    <>
      <FondoBarras />
      <ConferenciaNav />

      <main className="spk">
        {/* 1 · Tesis. La pregunta del documento ("¿Qué tienes en tu mano?") es
            lo que da sentido a la página: los ponentes son la respuesta. */}
        <section className="spk-hero">
          <p className="spk-eyebrow">{t("hero.eyebrow")}</p>
          <h1 className="spk-h1">{t("hero.title")}</h1>

          <div className="spk-hero-columnas">
            {/* El texto de la conferencia, entero y en su orden. No es un
                resumen: son los párrafos que mandó IKMA, y la pregunta va
                sacada a su sitio —donde la pone el propio texto, después de
                Moisés y antes de lo que significa para quien lo lee—. La última
                línea va en negrita porque en el original es la que cierra y
                llama: no es énfasis decorativo. */}
            <div className="spk-relato">
              <p className="spk-lead">{t("hero.lead")}</p>
              <p className="spk-parrafo">{t("hero.moises")}</p>

              <blockquote className="spk-cita">
                <p className="spk-cita-rotulo">{t("hero.preguntaLabel")}</p>
                <p className="spk-pregunta">{t("hero.question")}</p>
              </blockquote>

              <p className="spk-parrafo">{t("hero.aplicacion")}</p>
              <p className="spk-parrafo">{t("hero.invitacion")}</p>
              <p className="spk-parrafo spk-parrafo-cierre">{t("hero.cierre")}</p>
            </div>

            {/* Ficha del día: caja dentro de caja, como las tarjetas blancas de
                la landing (el borde y el radio interior son concéntricos). */}
            <dl className="spk-ficha">
              <div className="spk-ficha-cuerpo">
                <div className="spk-dato">
                  <dt>{t("hero.dateLabel")}</dt>
                  <dd>{tHero("date")}</dd>
                </div>
                <div className="spk-dato">
                  <dt>{t("hero.timeLabel")}</dt>
                  <dd>{t("hero.time")}</dd>
                </div>
                <div className="spk-dato">
                  <dt>{t("hero.formatLabel")}</dt>
                  <dd>{t("hero.format")}</dd>
                </div>
              </div>
            </dl>
          </div>
        </section>

        {/* 2 · Tira de retratos. Son las seis caras que ya existen en la landing
            y sirve de índice: cada una lleva a su tramo del día. Van apoyadas en
            una regla continua y el nombre va debajo, como el pie de una foto de
            grupo. Las tres columnas de móvil son caída, no diseño. */}
        <section className="spk-tira-seccion" aria-label={t("lineup.title")}>
          <div className="spk-tira">
            {CON_FOTO.map((ponente) => (
              <a
                key={ponente.id}
                href={`#spk-${sesionDePonente(ponente.id)?.id ?? ponente.id}`}
                className="spk-cara"
              >
                <span className="spk-cara-foto">
                  <img src={ponente.foto} alt="" loading="lazy" />
                </span>
                <span className="spk-cara-nombre">{ponente.nombre}</span>
              </a>
            ))}
          </div>
        </section>

        {/* 3 · El pliego: el día entero, tramo a tramo. */}
        <section className="spk-programa">
          <header className="spk-programa-cabecera">
            <h2 className="spk-h2">{t("programme.title")}</h2>
            <p className="spk-aviso">{t("programme.tz")}</p>
          </header>

          <div className="spk-pliego">
            {PROGRAMA.map((sesion) => {
              const ponente = ponenteDe(sesion)
              const nombre = nombreDe(sesion)
              const color = COLOR_TIPO[sesion.tipo]
              return (
                <Revelar key={sesion.id} className="spk-rev">
                  <article
                      id={`spk-${sesion.id}`}
                      className={
                        ponente || sesion.iniciales
                          ? "spk-fila"
                          : "spk-fila spk-fila-sola"
                      }
                    >
                    <span
                      className="spk-pestana"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    <div className="spk-rejilla">
                      {/* Columna 1 · la hora. Monoespaciada: es un dato, y en
                          columna fija se puede leer en vertical de un tirón. */}
                      <div className="spk-reloj">
                        <p className="spk-hora">{sesion.inicio}</p>
                        <p className="spk-hora-fin">
                          <span aria-hidden="true">→</span> {sesion.fin}
                        </p>
                      </div>

                      {/* Columna 2 · el retrato, apoyado en la regla inferior
                          de la fila. Los recortes traen transparencia, así que
                          no llevan marco: son la única cosa del pliego que no
                          acaba en línea recta. */}
                      <div className="spk-media">
                        {ponente ? (
                          <img
                            src={ponente.foto}
                            alt={nombre}
                            loading="lazy"
                            className="spk-retrato"
                          />
                        ) : sesion.iniciales ? (
                          <span className="spk-placa" aria-hidden="true">
                            {sesion.iniciales}
                          </span>
                        ) : null}
                      </div>

                      {/* Columna 3 · qué es, quién y de qué. */}
                      <div className="spk-texto">
                        <p className="spk-tipo">
                          <span
                            className="spk-punto"
                            style={{ backgroundColor: color }}
                            aria-hidden="true"
                          />
                          {t(`tipos.${sesion.tipo}`)}
                        </p>
                        {/* Quién habla, de qué y el apunte: la sesión. Va en un
                            solo bloque porque en móvil tiene que quedar centrado
                            de una pieza al lado del retrato — repartido en tres
                            celdas, el alto del retrato estiraba las filas y
                            dejaba un hueco entre el nombre y el tema. */}
                        <div className="spk-sesion">
                          {nombre && <h3 className="spk-nombre">{nombre}</h3>}
                          {sesion.tema && (
                            <p className="spk-tema">{sesion.tema[locale]}</p>
                          )}
                          {sesion.nota && (
                            <p className="spk-nota">{sesion.nota[locale]}</p>
                          )}
                        </div>

                        {/* Quién es la persona. Va debajo de una regla porque
                            arriba está la SESIÓN (de qué va y a qué hora) y aquí
                            abajo la PERSONA: son dos cosas distintas y el pliego
                            las separa como separa sus filas. */}
                        {ponente?.bio && (
                          <p className="spk-bio">{ponente.bio[locale]}</p>
                        )}
                      </div>
                    </div>
                  </article>
                </Revelar>
              )
            })}
          </div>
        </section>

        {/* 4 · Quién más sostiene el día. Sale de la línea de moderación del
            documento; los nombres no se traducen. */}
        <section className="spk-equipo">
          <h2 className="spk-h2">{t("credits.title")}</h2>
          <dl className="spk-equipo-grid">
            <div className="spk-equipo-item">
              <dt>{t("credits.host")}</dt>
              <dd>{EQUIPO.moderator.join(" · ")}</dd>
            </div>
            <div className="spk-equipo-item">
              <dt>{t("credits.announcements")}</dt>
              <dd>{EQUIPO.announcements.join(" · ")}</dd>
            </div>
            <div className="spk-equipo-item">
              <dt>{t("credits.translation")}</dt>
              <dd>{t("credits.translationValue")}</dd>
            </div>
            <div className="spk-equipo-item">
              <dt>{t("credits.worship")}</dt>
              <dd>{t("credits.worshipValue")}</dd>
            </div>
          </dl>
        </section>

        {/* 5 · Vuelta a la inscripción. */}
        <section className="spk-cierre">
          <p className="spk-cierre-texto">{t("cierre.lead")}</p>
          <div className="spk-cierre-botones">
            <Link href="/conferencia#registro" className="spk-boton">
              {t("cierre.primary")}
              <span className="spk-boton-icono" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h13" />
                  <path d="m12 6 6 6-6 6" />
                </svg>
              </span>
            </Link>
            <Link href="/conferencia" className="spk-volver">
              {t("cierre.back")}
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
