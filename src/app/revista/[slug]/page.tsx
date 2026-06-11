import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import ArticleContent from "@/components/ArticleContent"
import DownloadPopup from "@/components/DownloadPopup"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  return {
    title: article ? `${article.titulo} - IKMA Revista` : "IKMA Revista",
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

  if (!article) {
    return (
      <article className="py-section-padding">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <Link href="/revista" className="font-body-md text-body-md text-primary hover:underline mb-8 inline-block">&larr; Back to Revista</Link>
          <h1 className="font-headline-xl text-headline-xl text-primary mt-8">Article not found</h1>
        </div>
      </article>
    )
  }

  const relatedArticles = await getRelatedArticles(slug)
  const authorAvatar = article.autor_avatar_url ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(article.autor_nombre || "IKMA")}&backgroundColor=074469&textColor=ffffff`

  return (
    <article className="py-section-padding">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-gutter">
          {/* Left Column — Article Content */}
          <div>
            {article.imagen_url && (
              <div className="w-full h-80 rounded-xl overflow-hidden bg-surface-variant mb-6">
                <img src={article.imagen_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary flex-shrink-0">
                <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-label-bold text-label-bold text-on-surface">
                  {article.autor_nombre || "IKMA Editorial"}
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {formatDate(article.fecha_publicacion || article.created_at)}
                </p>
              </div>
            </div>

            <h1 className="font-headline-xl text-[clamp(1.625rem,3.25vw,2.6rem)] text-primary mb-6">
              {article.titulo}
            </h1>

            <ArticleContent
              contenidoHtml={article.contenido_html}
              resumen={article.resumen}
              isAuthenticated={!!user}
            />
          </div>

          {/* Right Column — Sidebar */}
          <div className="md:pl-6">
            <div className="sticky top-28 space-y-6">
              {/* Magazine Cover */}
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container-high shadow-sm">
                <img src="/images/magazine.png" alt="IKMA Journal" className="w-full h-full object-cover" />
              </div>

              {/* Newsletter CTA */}
              <div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                  Find this and more articles about faith in medicine in our Newsletter.
                </p>
                <DownloadPopup />
              </div>
            </div>
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
                    href={`/revista/${a.slug}`}
                    className="flex flex-col group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-[0_12px_24px_rgba(7,68,105,0.06)] hover:-translate-y-0.5 transition-all duration-300 snap-start w-[280px] sm:w-[300px] flex-shrink-0"
                  >
                    <div className="w-full aspect-[16/10] overflow-hidden bg-surface-container-high">
                      <img src={a.imagen_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-on-surface mt-2 group-hover:text-primary transition-colors text-sm leading-tight">
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
