import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { resizeImg } from "@/lib/images";
import { SafeImage } from "@/components/SafeImage";
import HeroCarousel, { Slide } from "@/components/HeroCarousel";
import StatsSection from "@/components/StatsSection";
import { getTranslations, getLocale } from "next-intl/server";
import Icon from "@/components/Icon";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  const locale = await getLocale()
  const tHome = await getTranslations("Home");
  const tHero = await getTranslations("Hero");

  const { data: dbArticles } = await supabase
    .from("articulos")
    .select("*")
    .eq("publicado", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const mainArticle = dbArticles?.[0];
  const sideArticles = dbArticles?.slice(1, 4) || [];

  return (
    <div className="-mt-20 md:mt-0 overflow-x-hidden">
        <HeroCarousel isAuthenticated={isAuthenticated}>
        <Slide>
          <div className="relative w-full h-full">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row h-full">
              {/* Mobile: Background image with overlay */}
              <div className="absolute inset-0 md:hidden overflow-hidden">
                <img
                  src="/images/Ap Bonny 2.webp"
                  alt=""
                  fetchPriority="high"
                  className="w-full h-full object-cover object-[center_15%]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[5%] to-white" />
              </div>

              {/* Left - Content */}
              <div className="relative z-10 w-full md:w-[55%] flex flex-col justify-end md:justify-center py-8 md:py-0 flex-1 md:flex-none mb-[20vh] md:mb-0">
                <div className="max-w-[420px] text-center md:text-left">
                <span
                  className="text-primary md:text-[#334D96] leading-none select-none block"
                  style={{ fontSize: "clamp(48px, 6vw, 90px)", fontFamily: "Montserrat", fontWeight: 700, lineHeight: 0.5 }}
                  aria-hidden="true"
                >
                  &ldquo;
                </span>

                <p className="text-primary md:text-[#334D96] text-sm sm:text-base md:text-[clamp(13px,1.2vw,19px)] leading-snug md:leading-[1.5] -mt-2 md:-mt-3 font-[500]">
                  {tHero("banner1Quote")}
                </p>

                <div className="text-center md:text-right -mt-1">
                  <span
                    className="text-primary md:text-[#334D96] leading-none select-none inline-block scale-x-[-1] scale-y-[-1]"
                    style={{ fontSize: "clamp(48px, 6vw, 90px)", fontFamily: "Montserrat", fontWeight: 700, lineHeight: 0.5 }}
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>
                </div>

                <p className="text-primary/70 md:text-[#717377] text-[10px] md:text-xs font-[700] mt-2 md:mt-3 tracking-[0.2em] uppercase">
                  {tHero("banner1Author")}
                </p>
              </div>
            </div>
            
            {/* Right - Image (desktop only) */}
            <div className="hidden md:block md:w-[45%] md:relative overflow-hidden flex-shrink-0">
              <img
                src="/images/Ap Bonny 2.webp"
                alt="Apostle John Boney"
                fetchPriority="high"
                className="md:absolute md:inset-0 md:h-full w-full object-cover object-[center_15%] pointer-events-none md:rounded-none"
              />
            </div>
          </div>
        </div>
        </Slide>
        <Slide>
          <div className="relative w-full h-full">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-full flex flex-col md:flex-row-reverse items-center justify-center md:justify-between gap-8 md:gap-0 py-10 md:py-0">
              <img
                src="/Tu vocación médica al servicio(1).png"
                alt={tHero("banner3Title")}
                loading="lazy"
                className="w-[200px] md:w-[291px] h-auto pointer-events-none select-none"
              />
              <div className="flex flex-col items-center md:items-start gap-6 md:flex-1 md:pr-10">
                <img
                  src="/logo.webp"
                  alt="IKMA"
                  loading="lazy"
                  className="w-[160px] md:w-[212px] h-auto"
                />
                <div className="text-center md:text-left">
                  <p className="text-primary font-[400] text-lg md:text-2xl">
                    {tHero("banner3Title")}
                  </p>
                  <h2 className="text-primary font-[800] text-3xl md:text-[48px] leading-tight">
                    {tHero("banner3Highlight")}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </Slide>
        <Slide>
          <div className="relative w-full h-full">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row h-full">
              {/* Mobile: Background image with overlay */}
              <div className="absolute inset-0 md:hidden overflow-hidden">
                <img
                  src="/images/Francisco 1.webp"
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[5%] to-white" />
              </div>

              {/* Left - Content */}
              <div className="relative z-10 w-full md:w-[55%] flex flex-col justify-end md:justify-center py-8 md:py-0 flex-1 md:flex-none mb-[20vh] md:mb-0">
                <div className="max-w-[420px] text-center md:text-left">
                <span
                  className="text-primary md:text-[#334D96] leading-none select-none block"
                  style={{ fontSize: "clamp(48px, 6vw, 90px)", fontFamily: "Montserrat", fontWeight: 700, lineHeight: 0.5 }}
                  aria-hidden="true"
                >
                  &ldquo;
                </span>

                <p className="text-primary md:text-[#334D96] text-sm sm:text-base md:text-[clamp(13px,1.2vw,19px)] leading-snug md:leading-[1.5] -mt-2 md:-mt-3 font-[600]">
                  {tHero("banner2Quote")}
                </p>

                <div className="text-center md:text-right -mt-1">
                  <span
                    className="text-primary md:text-[#334D96] leading-none select-none inline-block scale-x-[-1] scale-y-[-1]"
                    style={{ fontSize: "clamp(48px, 6vw, 90px)", fontFamily: "Montserrat", fontWeight: 700, lineHeight: 0.5 }}
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>
                </div>

                <p className="text-primary/70 md:text-[#717377] text-[10px] md:text-xs font-[700] mt-2 md:mt-3 tracking-[0.2em] uppercase">
                  {tHero("banner2Author")}
                </p>
              </div>
            </div>

            {/* Right - Image (desktop only) */}
            <div className="hidden md:block md:w-[34%] md:relative overflow-hidden flex-shrink-0">
              <img
                src="/images/Francisco 1.webp"
                alt="Francisco Hernández"
                loading="lazy"
                className="md:absolute md:inset-0 md:h-full w-full object-cover object-center pointer-events-none md:rounded-none"
                style={{ boxShadow: "-25px 4px 25px 0px #00000033" }}
              />
            </div>
          </div>
        </div>
        </Slide>
        <Slide>
          <div className="relative w-full h-full">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row h-full">
              <div className="absolute inset-0 md:hidden overflow-hidden">
                <img
                  src="/Unete%20a%20la%20familia.png"
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover object-[center_70%]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[5%] to-white" />
              </div>

              <div className="relative z-10 w-full md:w-[55%] flex flex-col justify-end md:justify-center py-8 md:py-0 flex-1 md:flex-none mb-[20vh] md:mb-0">
                <div className="max-w-[420px] text-center md:text-left">
                  <h2 className="text-primary md:text-[#334D96] text-3xl md:text-[clamp(36px,4vw,64px)] font-[800] leading-tight mb-3">
                    {tHero("joinFamilyTitle")}
                  </h2>
                  <p className="text-primary/80 md:text-[#717377] text-lg md:text-[clamp(20px,1.5vw,28px)] font-[600]">
                    {tHero("joinFamilySubtitle")}
                  </p>
                </div>
              </div>

              <div className="hidden md:block md:w-[34%] md:relative overflow-hidden flex-shrink-0">
                <img
                  src="/Unete%20a%20la%20familia.png"
                  alt="Únete a la familia"
                  loading="lazy"
                  className="md:absolute md:inset-0 md:h-full w-full object-cover object-[center_70%] pointer-events-none md:rounded-none"
                />
              </div>
            </div>
          </div>
        </Slide>

      </HeroCarousel>

      {/* Insights & Stories Section */}
      <section className="bg-surface-container-lowest py-12 md:py-section-padding border-t border-outline-variant/20">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-12">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              {tHome("lastArticles")}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {tHome("blogSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {mainArticle ? (
              <Link
                href={`/revista/${mainArticle.slug}`}
                className="flex flex-col group cursor-pointer"
              >
                <div className="w-full h-64 rounded-lg overflow-hidden mb-6 bg-surface-variant shadow-sm relative group-hover:shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] group-hover:-translate-y-1 transition-all duration-300">
                  <SafeImage
                    src={mainArticle.imagen_url || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600"}
                    fallback={mainArticle.imagen_url || ""}
                    alt={mainArticle.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center mb-3">
                  <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-3 py-1 rounded-full uppercase tracking-wider">
                    {mainArticle.categoria || tHome("missionUpdate")}
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3 group-hover:text-primary transition-colors">
                  {mainArticle.titulo_es && locale === "es" ? mainArticle.titulo_es : mainArticle.titulo}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-4">
                  {mainArticle.resumen_es && locale === "es" ? mainArticle.resumen_es : mainArticle.resumen}
                </p>
                <div className="flex items-center text-primary font-semibold space-x-1">
                  <span>{tHome("readMore")}</span>
                  <Icon name="arrow_forward" size={18} />
                </div>
              </Link>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/50">
                <p className="text-on-surface-variant">No articles published yet.</p>
              </div>
            )}
            
            <div className="flex flex-col space-y-6">
              {sideArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/revista/${article.slug}`}
                  className="flex space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:bg-surface-container transition-colors cursor-pointer group"
                >
                  <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-variant">
                      <SafeImage
                      src={article.imagen_url || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400"}
                      fallback={article.imagen_url || ""}
                      alt={article.titulo}
                    className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-tertiary uppercase tracking-tighter">
                      {article.categoria || tHome("article")}
                    </span>
                    <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {article.titulo_es && locale === "es" ? article.titulo_es : article.titulo}
                    </h4>
                    <p className="text-sm text-on-surface-variant line-clamp-1">
                      {article.resumen_es && locale === "es" ? article.resumen_es : article.resumen}
                    </p>
                    <span className="text-xs font-bold text-primary mt-1 hover:underline inline-block">
                      {tHome("readMore")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/revista"
              className="bg-surface-container-high text-on-surface font-label-bold text-label-bold px-8 py-3.5 rounded-lg hover:bg-surface-container-highest transition-all inline-block"
            >
              {tHome("viewAllArticles")}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <StatsSection />
        </div>
      </section>
    </div>
  );
}
