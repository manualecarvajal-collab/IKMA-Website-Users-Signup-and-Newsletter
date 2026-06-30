import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HeroBg3D from "@/components/HeroBg3DWrapper";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const { data: dbArticles } = await supabase
    .from("articulos")
    .select("*")
    .eq("publicado", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const mainArticle = dbArticles?.[0];
  const sideArticles = dbArticles?.slice(1, 4) || [];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop min-h-[calc(100vh-5rem)] flex flex-col items-center text-center justify-center">
        <div className="max-md:hidden">
          <HeroBg3D />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4 max-w-3xl max-md:flex-none md:flex-1 w-full p-0 md:p-[40px]">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Healing through <span className="text-primary">faith</span>
            {""} and {""}
            <span className="text-primary"> excellence</span>
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            We are a mission-driven medical association dedicated to providing
            accessible, high-quality healthcare to those in need.
            Join us in making a profound impact on communities worldwide.
          </p>
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
            <Link
              href={isAuthenticated ? "/suscripcion-exito" : "/registro"}
              className="bg-primary text-on-primary font-label-bold text-label-bold px-8 py-3.5 rounded-lg hover:bg-primary/90 transition-all shadow-[0_8px_16px_0_rgba(7,68,105,0.1)] active:scale-95 text-center inline-block"
            >
              Support Our Mission
            </Link>
            {isAuthenticated ? (
              <Link
                href="/suscripcion-exito"
                className="bg-secondary-container text-primary font-label-bold text-label-bold px-8 py-3.5 rounded-lg hover:bg-secondary-container/80 transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>Subscribe to our Newsletter</span>
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </Link>
            ) : (
              <Link
                href="/registro"
                className="bg-secondary-container text-primary font-label-bold text-label-bold px-8 py-3.5 rounded-lg hover:bg-secondary-container/80 transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>Sign up for free</span>
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </Link>
            )}
          </div>
        </div>
        <div className="w-full max-w-5xl mx-auto relative z-10 max-md:order-first md:order-0 max-md:mt-0 md:mt-auto">
          <img
            src="/images/hero img.webp"
            alt="Group of medical professionals"
            fetchPriority="high"
            className="w-full h-auto object-contain object-bottom pointer-events-none"
          />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Insights & Stories Section */}
      <section className="bg-surface-container-lowest py-12 md:py-section-padding border-t border-outline-variant/20">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-12">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              Last Articles
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Updates from our missions and medical breakthroughs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {mainArticle ? (
              <Link
                href={`/revista/${mainArticle.slug}`}
                className="flex flex-col group cursor-pointer"
              >
                <div className="w-full h-64 rounded-lg overflow-hidden mb-6 bg-surface-variant shadow-sm relative group-hover:shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] group-hover:-translate-y-1 transition-all duration-300">
                  <img
                    src={mainArticle.imagen_url || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000"}
                    alt={mainArticle.titulo}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center mb-3">
                  <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-3 py-1 rounded-full uppercase tracking-wider">
                    {mainArticle.categoria || "Mission Update"}
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3 group-hover:text-primary transition-colors">
                  {mainArticle.titulo}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-4">
                  {mainArticle.resumen}
                </p>
                <div className="flex items-center text-primary font-semibold space-x-1">
                  <span>Read More</span>
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
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
                      <img
                      src={article.imagen_url || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000"}
                      alt={article.titulo}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-tertiary uppercase tracking-tighter">
                      {article.categoria || "Article"}
                    </span>
                    <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {article.titulo}
                    </h4>
                    <p className="text-sm text-on-surface-variant line-clamp-1">
                      {article.resumen}
                    </p>
                    <span className="text-xs font-bold text-primary mt-1 hover:underline inline-block">
                      Read More
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
              View all Articles
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
