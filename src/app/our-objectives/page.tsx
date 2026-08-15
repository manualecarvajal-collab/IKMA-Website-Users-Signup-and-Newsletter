import Link from "next/link"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Icon from "@/components/Icon"

export const metadata: Metadata = {
  title: "Our Objectives - IKMA",
  description:
    "Learn about the key objectives and goals of the International Kingdom Medical Association.",
}

export default async function OurObjectivesPage() {
  const t = await getTranslations("OurObjectives")
  const pillarOneItems = [t("pillarOneItems_0"), t("pillarOneItems_1"), t("pillarOneItems_2")]
  const pillarTwoItems = [t("pillarTwoItems_0"), t("pillarTwoItems_1"), t("pillarTwoItems_2")]
  const pillarThreeItems = [t("pillarThreeItems_0"), t("pillarThreeItems_1"), t("pillarThreeItems_2"), t("pillarThreeItems_3")]

  return (
    <>
      <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/outreach/communities/723067031_122226599306056158_29644257407622949_n.webp"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-background" />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-left">
          <div className="mb-8 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 text-primary font-label-bold text-label-sm uppercase tracking-widest rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            {t("heroBadge")}
          </div>
          <h1 className="font-headline-xl text-headline-xl text-surface max-w-4xl mb-8 leading-tight">
            {t("heroTitle")}
          </h1>
          <p className="font-body-lg text-body-lg text-surface max-w-2xl leading-relaxed">
            {t("heroDesc")}
          </p>
          <p className="font-body-md text-body-md text-surface/70 max-w-2xl leading-relaxed mt-4">
            {t("heroMeta")}
          </p>
          <div className="mt-12 flex flex-wrap gap-6">
            <a
              href="/our-purpose"
              className="bg-primary text-on-primary font-label-bold text-label-bold px-8 py-4 rounded-lg hover:bg-primary-container transition-all shadow-xl shadow-primary/20"
            >
              {t("exploreVision")}
            </a>
            <a
              href="/teachings"
              className="flex items-center gap-2 text-primary font-bold py-4 hover:gap-4 transition-all"
            >
              <Icon name="play_circle" />
              {t("watchStory")}
            </a>
          </div>
        </div>
      </section>

      <section className="py-section-padding bg-white" id="pillar-one">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-primary font-bold tracking-[0.2em] font-label-bold text-label-sm block mb-6 uppercase border-l-4 border-primary pl-4">
                {t("pillarOne")}
              </p>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-10">
                {t("pillarOneTitle")}
              </h2>
              <ul className="space-y-8">
                {pillarOneItems.map((item, i) => (
                  <li key={i} className="flex gap-6 items-start group">
                    <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      {i + 1}
                    </span>
                    <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute -inset-6 bg-primary-fixed/20 -z-10 rounded-2xl group-hover:bg-primary-fixed/30 transition-all" />
              <img
                src="/outreach/communities/724073318_122226599612056158_6550501176011429048_n.webp"
                alt=""
                className="w-full aspect-[4/3] object-cover rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              /> 
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-32 flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://lh3.googleusercontent.com/aida/AP1WRLvVNZYFIT4XXfVeoMcbySrAxvfuapp5WCZpGJJePLHwU17kBPVM9FzzbMiV_0niwI-tOsf2uQlWeXJZIJMe1Q-9DwLztpZZcWjo5nbOks7HknDSqN3Rrj3pZPUfdijrV9OMwJg45QXrHC8nVBGNPJseftwaXH6rznos5QWj7UggtMNMe1j711UCx5BQPdOpnjCoTGN-VJdqTJSVC-1pZxJ1t-XBRD7lFiNcoYGvMAdyI8HHvYP-xdEEjA"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-4xl mx-auto">
            <Icon name="format_quote" size={72} className="text-white/40 mb-8" />
            <blockquote className="text-white font-headline-lg text-headline-lg md:text-4xl italic leading-tight">
              {t("quote")}
            </blockquote>
            <p className="mt-6 text-white/80 text-base md:text-lg font-body-md not-italic">
              {t("quoteAttribution")}
            </p>
            <div className="mt-8 h-1 w-24 bg-white/30 mx-auto rounded-full" />
          </div>
        </div>
      </section>

      <section className="py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative group order-1">
              <div className="absolute -inset-6 bg-secondary-fixed/20 -z-10 rounded-2xl group-hover:bg-secondary-fixed/30 transition-all" />
              <img
                src="/outreach/communities/724265425_122226599258056158_6696920523978700488_n.webp"
                alt=""
                className="w-full aspect-[4/3] object-cover rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
            <div className="order-2">
              <p className="text-primary font-bold tracking-[0.2em] font-label-bold text-label-sm block mb-6 uppercase border-l-4 border-primary pl-4">
                {t("pillarTwo")}
              </p>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-10">
                {t("pillarTwoTitle")}
              </h2>
              <ul className="space-y-8">
                {pillarTwoItems.map((item, i) => (
                  <li key={i} className="flex gap-6 items-start group">
                    <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      {i + 4}
                    </span>
                    <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-section-padding bg-surface-container-low border-y border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <p className="text-primary font-bold tracking-[0.2em] font-label-bold text-label-sm block mb-6 uppercase">
              {t("pillarThree")}
            </p>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-6">
              {t("pillarThreeTitle")}
            </h2>
            <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {pillarThreeItems.map((item, i) => (
              <div
                key={i}
                className="bg-white p-10 border border-outline-variant hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 rounded-lg relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full transition-all group-hover:w-full group-hover:h-full group-hover:rounded-none" />
                <p className="text-4xl font-black text-primary/10 block mb-6 relative">
                  {String(i + 7).padStart(2, "0")}
                </p>
                <p className="font-body-md text-body-md text-on-surface relative leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl overflow-hidden h-[500px] shadow-2xl relative">
            <img
              src="/outreach/zumurucuare/706417436_122224596176056158_1440124180007367821_n.webp"
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
          </div>
        </div>
      </section>
    </>
  )
}
