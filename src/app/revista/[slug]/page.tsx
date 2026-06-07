import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

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

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)

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
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-3 py-1 rounded-full uppercase tracking-wider">
              {article.categoria}
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-primary mb-6">
            {article.titulo}
          </h1>
          {article.imagen_url && (
            <div className="w-full h-80 rounded-xl overflow-hidden bg-surface-variant mb-8">
              <img src={article.imagen_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          {article.contenido_html ? (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.contenido_html }}
            />
          ) : (
            <div className="prose prose-lg max-w-none">
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {article.resumen}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
