import { getTranslations } from "next-intl/server"

/**
 * Hero de `/events`: el cartel del IV Congreso Internacional (2027).
 *
 * ESCRITORIO: el cartel es un escenario 16:9 de **800 px de alto**. Como el
 * aspecto es fijo, el ancho se topa en 1422 px (800 x 16/9) y el escenario se
 * centra; por debajo de 1422 px ocupa todo el ancho y la altura baja en
 * proporción (1024 -> 576 px, 1280 -> 720 px).
 *
 * Las piezas van colocadas con las medidas del diseño de IKMA, en porcentaje del
 * escenario. Todas salen de medir el export (artboard de 1079x608 px) con la
 * silueta de cada pieza, no de mirarlo a ojo:
 *
 *   pieza        izquierda   arriba    ancho
 *   logo IKMA      13,58 %   22,42 %   16,29 %
 *   lockup          5,65 %   38,65 %   29,66 %
 *   «reserva…»     21,69 %c  54,11 %   (auto)
 *   regla          20,48 %   57,73 %    2,32 %
 *   sede/fecha     21,64 %c  59,70 %   (auto)
 *   escudos        12,05 %   66,61 %   17,98 %
 *   manos          39,50 %  -30,00 %  108,00 %
 *
 * (`%c` = centro del bloque; `arriba` = borde superior de la tinta, que no es el
 * borde de la caja de texto: de ahí los `top` con decimales.)
 *
 * Las manos se salen por la derecha y por abajo, como en el cartel: de ahí el
 * `overflow-hidden` del escenario. Su resplandor azul ya viene en la imagen, así
 * que aquí no se pinta ningún degradado.
 *
 * Los tamaños de letra van en `cqw` (tanto por ciento del ancho del escenario)
 * para que todo escale junto y las proporciones se mantengan a cualquier ancho.
 *
 * POR QUÉ SE COMPONE Y NO ES UNA IMAGEN: el lockup («4TH INTERNATIONAL CONGRESS
 * 2027») es una marca y va como imagen, en inglés; pero «reserva la fecha», la
 * sede y la fecha son texto del sitio, y así la versión inglesa dice «Save the
 * date / October 2027» sin tocar ningún archivo.
 *
 * MÓVIL: un escenario 16:9 a 393 px daría letra de 6 px, así que ahí no se
 * reproduce el cartel: se apila en una columna, con las mismas piezas, colores y
 * regla.
 *
 * PESO: el PNG original de las manos eran 15,7 MB; aquí va en WebP de 2000 px y
 * 440 KB (se ve a 1536 px en escritorio y a 914 en móvil, así que a 1600 se
 * quedaba corta).
 */
export default async function HeroCongreso() {
  const t = await getTranslations("Events.congreso")

  const AZUL = "text-[#0031C7]"
  const TINTA = "text-on-surface"

  return (
    <section className="relative overflow-hidden bg-white">
      {/* ====================================================== escritorio */}
      <div className="relative mx-auto hidden aspect-[16/9] w-full max-w-[1422px] [container-type:inline-size] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.webp"
          alt="IKMA — International Kingdom Medical Association"
          width={800}
          height={339}
          className="absolute left-[13.58%] top-[22.42%] w-[16.29%]"
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/events/congreso-2027-lockup.webp"
          alt="4th International Congress 2027"
          width={1214}
          height={277}
          className="absolute left-[5.65%] top-[38.65%] w-[29.66%]"
        />

        <p
          className={`absolute left-[21.69%] top-[54.1%] -translate-x-1/2 whitespace-nowrap text-[1.38cqw] font-medium italic uppercase leading-none tracking-[0.005em] ${AZUL}`}
        >
          {t("saveDate")}
        </p>

        <span
          aria-hidden="true"
          className="absolute left-[20.48%] top-[57.73%] h-[0.2cqw] w-[2.32%] bg-[#00A0E7]"
        />

        <p
          className={`absolute left-[21.64%] top-[59.55%] -translate-x-1/2 whitespace-nowrap text-center text-[1.24cqw] leading-[1.12] tracking-[-0.015em] ${TINTA}`}
        >
          <span className="font-normal">{t("place")}</span>
          <br />
          <span className="font-bold">{t("date")}</span>
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/events/congreso-2027-escudos.webp"
          alt="Kingdom Bible College · Emmanuel Ministries International · La Ciudad de las Águilas"
          width={700}
          height={226}
          className="absolute left-[12.05%] top-[66.61%] w-[17.98%]"
        />

        {/* Las manos: se salen del escenario por la derecha y por abajo. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/events/congreso-2027-manos.webp"
          alt=""
          width={2000}
          height={2090}
          className="absolute left-[39.5%] top-[-30%] w-[108%] max-w-none"
        />
      </div>

      {/* ============================================ móvil y tablet (pila) */}
      <div className="flex w-full flex-col items-center px-margin-mobile py-12 lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.webp"
          alt="IKMA — International Kingdom Medical Association"
          width={800}
          height={339}
          className="h-auto w-[clamp(130px,15vw,184px)]"
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/events/congreso-2027-lockup.webp"
          alt="4th International Congress 2027"
          width={1214}
          height={277}
          className="mt-6 h-auto w-[clamp(240px,42vw,470px)]"
        />

        <p className={`mt-6 text-[clamp(1.05rem,1.5vw,1.5rem)] font-bold italic uppercase tracking-[0.055em] ${AZUL}`}>
          {t("saveDate")}
        </p>

        <span aria-hidden="true" className="mt-3 h-[2px] w-7 bg-[#00A0E7]" />

        <p className={`mt-3 text-[clamp(0.95rem,1vw,1.1rem)] font-bold leading-[1.15] ${TINTA}`}>
          {t("place")}
          <br />
          {t("date")}
        </p>

        <p className="mx-auto mt-4 max-w-[42ch] text-balance text-center text-[clamp(0.85rem,0.9vw,0.95rem)] leading-[1.5] text-on-surface-variant">
          {t("description")}
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/events/congreso-2027-escudos.webp"
          alt="Kingdom Bible College · Emmanuel Ministries International · La Ciudad de las Águilas"
          width={700}
          height={226}
          className="mt-7 h-auto w-[clamp(210px,30vw,300px)]"
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/events/congreso-2027-manos.webp"
          alt=""
          width={2000}
          height={2090}
          className="relative left-[10%] mt-[calc(-46.6%_-_60px)] h-auto w-[262%] max-w-none rotate-[30deg] md:left-0 md:mt-6 md:w-[125%] md:max-w-[34rem]"
        />
      </div>
    </section>
  )
}
