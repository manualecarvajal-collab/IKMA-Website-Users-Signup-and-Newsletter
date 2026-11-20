import { getTranslations } from "next-intl/server"

/**
 * Sección «Ubicación» de `/events`: dónde cae Coro en el mapa.
 *
 * POR QUÉ EXISTE. `CoroSection` cuenta cómo es la ciudad, pero quien viene de
 * fuera necesita ver dónde está antes de planear el viaje.
 *
 * SIN API KEY. El embed público de Google Maps (`?q=…&output=embed`) no exige
 * clave ni script; es un `iframe` y nada más. `loading="lazy"` evita bajarlo
 * hasta que el visitante llega a la sección.
 *
 * shortcut: `?q=&output=embed` es la variante sin clave y no está documentada
 * como contrato; si Google la retira, cambiar `src` por el `pb=` de «Compartir →
 * Insertar un mapa» y actualizar el CSP si cambia el host.
 *
 * CSP. `frame-src` en `vercel.json` tiene que listar `www.google.com` o el mapa
 * se queda en blanco en producción (en local no hay cabeceras y por eso no se
 * nota).
 */

const CONSULTA = "Coro, Falcón, Venezuela"

export default async function CoroMapa() {
  const t = await getTranslations("Events.mapa")
  const q = encodeURIComponent(CONSULTA)

  return (
    <section className="border-t border-outline-variant/40 bg-surface-container-lowest py-14 md:py-20">
      <div className="mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-wrap items-end justify-between gap-6">
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

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${q}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[0.82rem] font-semibold text-on-primary transition-colors hover:bg-primary/90"
          >
            {t("abrir")}
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-low">
          <iframe
            src={`https://www.google.com/maps?q=${q}&z=13&output=embed`}
            title={t("title")}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="block h-[22rem] w-full md:h-[28rem]"
          />
        </div>
      </div>
    </section>
  )
}
