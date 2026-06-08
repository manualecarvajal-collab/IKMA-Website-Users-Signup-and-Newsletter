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

const staticArticles: Record<string, { titulo: string; resumen: string; categoria: string; imagen_url: string; contenido_html: string; fecha_publicacion: string }> = {
  "nuevo-campamento-medico": {
    titulo: "New Medical Camp in Rural Area",
    resumen: "Our latest initiative has established a new medical camp bringing essential pediatric and maternal care to previously unreached rural communities.",
    categoria: "Medical Updates",
    imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHuLiwXl_xEBXKpZx7HZPQ7upktgXRz6MeiiraZMSW-EokcqsS7YcQ2MRrGXaPyInQfX7OAr-Zv9L_tnxiN-mPbkgGYR9oaIL1qirVlCApixW6K8s41Yk2o48vbuLj9fEBFVtO7Ur5zJWZ1BP51tvpjgcxe7F3rP9ASnuSUgfSaVGfoOoZzeTaO0r4IGq2UbfcvMbyBmMU-k7usazvbTooLeyUephhENZ-rwqmkIV4iMhmPdAHhtf3qCxQlKwpYqVqB-4tGw9945k",
    contenido_html: "",
    fecha_publicacion: "2024-12-01",
  },
  "esperanza-en-tiempos-dificiles": {
    titulo: "Finding Hope in the Hardest Times",
    resumen: "A powerful testimony of faith and medicine working together.",
    categoria: "Stories of Faith",
    imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAs0_z9hrCSVCDqgbuqbiuNSZ35V72TRcN-CuOcxf8eGnePDwWVo9TjtwQCuZP1ijGWC_NlcKHz0wVVbGTr3FIedkuNRE72deICvW9JoTbEMTfkBfkXiqBb0gBlee4wvDIu3N6WrTpDLJKLHXS82dWLq8sON6q1q_moQg9pX_pxfFK3ybmTIMsESu8eziNXfO_zWnYTtPlRkLAhFeyU-V5U8bgwPTQHbj6KYlKHWTk9nsoAgTUZINXluUtGd2iCGPLf5fq4C0ufi4Q",
    contenido_html: "",
    fecha_publicacion: "2024-11-15",
  },
  "iniciativas-globales-salud": {
    titulo: "Global Health Initiatives: A 2024 Review",
    resumen: "Reflecting on a year of transformative global health projects.",
    categoria: "Medical Updates",
    imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDd3ky8AbGqf2Mc19PTrWV9HJS3-aILzx4GVgA1Jxd7pUMyqqnH1XzLNINH2Nt34OVrru_MatYosw8HgTE0y6-KMAW2nL_5yzyWyLfD-r_vUcQprrtDiqLiWYpvSk12gMA5fE8uFNZEVnFkdgi4mBGhbfzH6gREBHRWEi-RTEGrn9A4suNc7C1ran38I9S2NilVqvAytdccBlOli0pW_9uJJQ70O14ZIlNWyfWSwxXC24RMblhBenSH3XUyXAiEDwQQc8aqGplqamA",
    contenido_html: "",
    fecha_publicacion: "2024-10-20",
  },
  "encuentro-comunitario": {
    titulo: "Community Gathering Event",
    resumen: "Bringing together leaders, professionals, and volunteers.",
    categoria: "Community News",
    imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvjPdQN6G-ZXVQp6UfLadZvTRtl2-mjoWUM5pIB1vbi-PTITvFWcycdQIZYvT9MR3xbwdPS_02LK9ZclqdCHUHS0pzQLSe9d6E4Y-5tJ4sdkboCUvOkEeI7jJcua3k2NClL27gChR8dKXQYbU9Hb700A9Ye7buO5_55TfEf8niQvjUDbqocVLgS752jdaNpeQq9J5BjckKw_gQaZqODnbmCNv0OzAG5Hc3SCu9KF7Ri8y-97I01AeNMoeMIr3RD6QngeNjGK3luk8",
    contenido_html: "",
    fecha_publicacion: "2024-09-10",
  },
}

async function getArticle(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("articulos")
    .select("*, perfiles!articulos_autor_id_fkey(nombre_completo)")
    .eq("slug", slug)
    .eq("publicado", true)
    .single()
  if (data) return data
  const fallback = staticArticles[slug]
  if (fallback) return { ...fallback, id: slug, slug, publicado: true, created_at: fallback.fecha_publicacion, updated_at: fallback.fecha_publicacion, url_pdf_storage: null, contenido_html: fallback.contenido_html || `<p>${fallback.resumen}</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`, perfiles: null }
  return null
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
