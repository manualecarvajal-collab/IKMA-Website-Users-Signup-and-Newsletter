import Link from "next/link"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Icon from "@/components/Icon"

export const metadata: Metadata = {
  title: "Blog - IKMA Medical Journal",
  description:
    "Explore the IKMA medical journal — featuring peer-reviewed articles, mission updates, and community stories from the International Kingdom Medical Association.",
}

interface Article {
  id: string
  titulo: string
  slug: string
  resumen: string | null
  imagen_url: string | null
  publicado: boolean
  created_at: string
  autor_nombre?: string | null
}

async function getArticles(): Promise<Article[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("articulos")
    .select("*")
    .eq("publicado", true)
    .order("fecha_publicacion", { ascending: false })

  return (data ?? []) as Article[]
}

interface Revista {
  id: string
  titulo: string
  descripcion: string | null
  archivo_url: string | null
  imagen_portada: string | null
  publicado: boolean
  created_at: string
}

async function getMagazines(): Promise<Revista[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("revistas")
    .select("*")
    .eq("publicado", true)
    .order("fecha_publicacion", { ascending: false })
    .limit(3)
  return (data ?? []) as Revista[]
}

export default async function BlogPage() {
  const articles = await getArticles()
  const magazines = await getMagazines()

  return (
    <>
      {articles.length > 0 && (
        <>
          {/* Featured Stories */}
          <section className="bg-surface flex items-start">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-9 md:py-12">
              <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-[1.2rem]">
                <Link
                  href={`/blog/${articles[0].slug}`}
                  className="flex flex-col group cursor-pointer"
                >
                  <div className="w-full h-[21.16rem] rounded-lg overflow-hidden mb-5 bg-surface-container-high shadow-sm relative group-hover:shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] group-hover:-translate-y-1 transition-all duration-300">
                    <img
                      src={articles[0].imagen_url  || ""}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center mb-3">
                    <span className="font-label-bold text-label-sm text-tertiary uppercase tracking-wider notranslate">
                      {articles[0].autor_nombre || "IKMA"}
                    </span>
                  </div>
                  <div className="flex items-center justify-start gap-10 mb-3">
                    <h2 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors notranslate">
                      {articles[0].titulo}
                    </h2>
                    <div className="flex items-center text-on-surface-variant font-medium space-x-0.5 flex-shrink-0 text-sm">
                      <span>Read More</span>
                      <Icon name="arrow_forward" size={16} />
                    </div>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-4">
                    {articles[0].resumen}
                  </p>
                </Link>
                <div className="flex flex-col space-y-5">
                  <div className="w-full h-32 rounded-lg border-2 border-dashed border-on-surface/20 bg-surface-container-high/30 flex items-center justify-center text-on-surface-variant/50 text-sm font-medium">
                    Ad Space
                  </div>
                  {articles.slice(1, 4).map((a) => (
                    <Link
                      key={a.id}
                      href={`/blog/${a.slug}`}
                      className="flex space-x-4 p-0 rounded-lg hover:bg-surface-container/50 transition-colors cursor-pointer group"
                    >
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
                        <img src={a.imagen_url  || ""} alt="" loading="lazy" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-tertiary uppercase tracking-tighter notranslate">{a.autor_nombre || "IKMA"}</span>
                        <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors text-sm leading-tight mt-0.5 notranslate">
                          {a.titulo}
                        </h3>
                        <p className="text-sm text-on-surface-variant line-clamp-1 mt-0.5">{a.resumen}</p>
                        <span className="text-xs font-bold text-primary mt-1.5 hover:underline inline-block">Read More</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* All Articles Grid */}
          <section className="py-12 md:py-section-padding bg-surface">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="mb-10">
                <h2 className="font-headline-lg text-headline-lg text-primary mb-2">All Articles</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Browse our complete library of medical articles and stories.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                {articles.map((a, i) =>
                  i === 0 ? (
                    <div
                      key="ad-1"
                      className="flex flex-col bg-white rounded-lg overflow-hidden shadow-sm border-2 border-dashed border-on-surface/20 min-h-[280px] items-center justify-center text-on-surface-variant/50 text-sm font-medium"
                    >
                      Ad Space
                    </div>
                  ) : (
                    <Link
                      key={a.id}
                      href={`/blog/${a.slug}`}
                      className="flex flex-col group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-[0_12px_24px_rgba(7,68,105,0.06)] hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="w-full aspect-[16/10] overflow-hidden bg-surface-container-high">
                        <img src={a.imagen_url  || ""} alt="" loading="lazy" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                    <span className="text-[10px] font-bold text-tertiary uppercase tracking-tighter notranslate">
                      {a.autor_nombre || "IKMA"}
                    </span>
                        <h3 className="font-bold text-on-surface mt-2 group-hover:text-primary transition-colors text-sm leading-tight notranslate">
                          {a.titulo}
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1 mt-1 text-sm">{a.resumen}</p>
                      </div>
                    </Link>
                  )
                )}
              </div>
            </div>
          </section>

          {/* Load More */}
          <div className="pb-section-padding bg-surface">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-center">
              <button className="bg-secondary-container text-primary font-label-bold px-8 py-3 rounded-lg hover:bg-surface-tint hover:text-on-primary transition-colors duration-300 shadow-[0_4px_20px_rgba(7,68,105,0.04)] cursor-pointer">
                Load More Articles
              </button>
            </div>
          </div>

          {/* Magazines Ticket */}
          {magazines.length > 0 && (
            <section className="bg-surface-container-low py-12">
              <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-outline-variant/20">
                  <div className="flex items-center gap-4 mb-6">
                    <Icon name="menu_book" size={36} className="text-primary" />
                    <div>
                      <h2 className="font-headline-lg text-headline-lg text-primary">
                        Check out our latest posted magazines
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Download the most recent IKMA journals and newsletters.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {magazines.map((m) => (
                      <div
                        key={m.id}
                        className="flex flex-col bg-surface-container-low rounded-lg overflow-hidden hover:shadow-md transition-shadow group cursor-default"
                      >
                        {m.imagen_portada ? (
                          <div className="aspect-[3/4] w-full overflow-hidden bg-surface-variant">
                            <img src={m.imagen_portada} alt={m.titulo} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        ) : (
                          <div className="aspect-[3/4] w-full bg-surface-container-high flex items-center justify-center">
                            <Icon name="description" size={48} className="text-on-surface-variant/30" />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-headline-md text-headline-md text-on-surface text-sm">{m.titulo}</h3>
                          {m.descripcion && (
                            <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1 line-clamp-2">{m.descripcion}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
