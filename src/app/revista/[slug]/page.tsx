import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import ArticleContent from "@/components/ArticleContent"
import DownloadPopup from "@/components/DownloadPopup"

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
    .select("*, perfiles!articulos_autor_id_fkey(nombre_completo)")
    .eq("slug", slug)
    .eq("publicado", true)
    .single()
  return data
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

  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent((article?.perfiles?.nombre_completo as string) || "IKMA")}&backgroundColor=074469&textColor=ffffff`

  if (!article) {
    return (
      <article className="py-section-padding px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto text-center">
          <Link href="/revista" className="font-body-md text-body-md text-primary hover:underline mb-8 inline-block">&larr; Back to Revista</Link>
          <h1 className="font-headline-xl text-headline-xl text-primary mt-8">Article not found</h1>
        </div>
      </article>
    )
  }

  return (
    <article className="py-section-padding px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <Link href="/revista" className="font-body-md text-body-md text-primary hover:underline mb-8 inline-block">
          &larr; Back to Revista
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-gutter mt-6">
          {/* Left Column — Article Content */}
          <div>
            {article.imagen_url && (
              <div className="w-full h-80 rounded-xl overflow-hidden bg-surface-variant mb-6">
                <img src={article.imagen_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary flex-shrink-0">
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-label-bold text-label-bold text-on-surface">
                  {(article.perfiles?.nombre_completo as string) || "IKMA Editorial"}
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {formatDate(article.fecha_publicacion || article.created_at)}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-3 py-1 rounded-full uppercase tracking-wider">
                {article.categoria}
              </span>
            </div>

            <h1 className="font-headline-xl text-headline-xl text-primary mb-8">
              {article.titulo}
            </h1>

            <ArticleContent
              contenidoHtml={article.contenido_html}
              resumen={article.resumen}
            />
          </div>

          {/* Right Column — Sidebar */}
          <div className="md:pl-6">
            <div className="sticky top-28 space-y-6">
              {/* Magazine Cover */}
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container-high shadow-sm">
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <div className="text-center p-6">
                    <span className="material-symbols-outlined text-6xl text-primary/30">menu_book</span>
                    <p className="font-headline-md text-headline-md text-primary mt-2">IKMA Journal</p>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">Quarterly Edition</p>
                  </div>
                </div>
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
      </div>
    </article>
  )
}
