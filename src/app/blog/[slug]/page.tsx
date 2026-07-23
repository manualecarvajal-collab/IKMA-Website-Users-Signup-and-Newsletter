import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ArticleContent from "@/components/ArticleContent"
import DownloadPopup from "@/components/DownloadPopup"
import Icon from "@/components/Icon"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  return {
    title: article ? `${article.titulo} - IKMA Blog` : "IKMA Blog",
    description: article?.resumen ?? "Read this article from the International Kingdom Medical Association journal.",
  }
}

async function getArticle(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("articulos")
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .single()
  return data
}

async function getRelatedArticles(currentSlug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("articulos")
    .select("*")
    .eq("publicado", true)
    .neq("slug", currentSlug)
    .order("fecha_publicacion", { ascending: false })
    .limit(6)
  return data ?? []
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = user ? await supabase.from("perfiles").select("suscripcion_activa").eq("id", user.id).single() : { data: null }

  if (!article) notFound()

  const relatedArticles = await getRelatedArticles(slug)

  const { data: magazines } = await supabase
    .from("revistas")
    .select("id, titulo, descripcion, archivo_url, imagen_portada")
    .eq("publicado", true)
    .order("fecha_publicacion", { ascending: false })
    .limit(3)

  const latestMagazineId = magazines?.[0]?.id

  const authorAvatar = article.autor_avatar_url ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(article.autor_nombre || "IKMA")}&backgroundColor=074469&textColor=ffffff`

  return (
    <article className="py-section-padding">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_7fr] gap-gutter">
          {/* Left Column — Sidebar */}
          <div className="md:pr-6 order-2 md:order-1">
            <div className="sticky top-28 space-y-6">
              {/* Ad Space */}
              <div className="w-full h-64 rounded-xl border-2 border-dashed border-on-surface/20 bg-surface-container-high/30 flex items-center justify-center text-on-surface-variant/50 text-sm font-medium">
                Ad Space
              </div>

              {magazines && magazines.length > 0 && (
                <div className="bg-surface-container-low rounded-xl p-5 shadow-sm border border-outline-variant/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="menu_book" size={20} className="text-primary" />
                    <h3 className="font-headline-md text-headline-md text-primary text-sm">Latest Magazines</h3>
                  </div>
                  <div className="space-y-3 mb-4">
                    {magazines.map((m) => (
                      <div
                        key={m.id}
                        className="flex gap-3 bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow group p-2 cursor-default"
                      >
                        {m.imagen_portada ? (
                          <div className="w-16 h-20 shrink-0 rounded overflow-hidden bg-surface-variant">
                            <img src={m.imagen_portada} alt={m.titulo} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        ) : (
                          <div className="w-16 h-20 shrink-0 rounded bg-surface-container-high flex items-center justify-center">
                            <Icon name="description" size={24} className="text-on-surface-variant/30" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-label-bold text-label-sm text-on-surface truncate notranslate">{m.titulo}</h4>
                          {m.descripcion && (
                            <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-0.5 line-clamp-2">{m.descripcion}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <DownloadPopup
                    isAuthenticated={!!user}
                    isSubscribed={!!perfil?.suscripcion_activa}
                    revistaId={latestMagazineId}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Article Content */}
          <div className="order-1 md:order-2">
            {article.imagen_url && (
              <div className="w-full h-80 rounded-xl overflow-hidden bg-surface-variant mb-6">
                <img src={article.imagen_url} alt="" loading="lazy" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary flex-shrink-0">
                <img src={authorAvatar} alt="" loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-label-bold text-label-bold text-on-surface notranslate">
                  {article.autor_nombre || "IKMA Editorial"}
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {formatDate(article.fecha_publicacion || article.created_at)}
                </p>
              </div>
            </div>

            <h1 className="font-headline-xl text-[clamp(1.625rem,3.25vw,2.6rem)] text-primary mb-6 notranslate">
              {article.titulo}
            </h1>

            <ArticleContent
              contenidoHtml={article.contenido_html}
              resumen={article.resumen}
              isAuthenticated={!!user}
            />
          </div>
        </div>

        {/* Recommended Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h4 className="font-headline-md text-headline-md text-primary mb-2">Recommended Articles</h4>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8">Continue reading from our journal.</p>
            <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-px">
              <div className="flex gap-gutter min-w-min">
                {relatedArticles.map((a) => (
                  <Link
                    key={a.id}
                    href={`/blog/${a.slug}`}
                    className="flex flex-col group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-[0_12px_24px_rgba(7,68,105,0.06)] hover:-translate-y-0.5 transition-all duration-300 snap-start w-[280px] sm:w-[300px] flex-shrink-0"
                  >
                    <div className="w-full aspect-[16/10] overflow-hidden bg-surface-container-high">
                      <img src={a.imagen_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-on-surface mt-2 group-hover:text-primary transition-colors text-sm leading-tight notranslate">
                        {a.titulo}
                      </h3>
                      <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1 mt-1 text-sm">{a.resumen}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </article>
  )
}
