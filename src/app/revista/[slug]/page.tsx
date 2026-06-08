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
  "voluntaria-sarah": {
    titulo: "Volunteer Spotlight: Sarah's Journey",
    resumen: "Meet Sarah, one of our most dedicated frontline volunteers making a difference every day in rural clinics.",
    categoria: "Volunteer Story",
    imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuATd1-x0lp4ughzvYQGR5Jjz-4LVEED_04MkuHaU7NMKahb5GImRSWsvjxvbEHSjOhP8eXkpjUlPuMmUcBX48DbZ4eyQE8osjcpAbLOAPs0RkAT8MB5tYkUwJxUrqZXwqpi2idmZQP1hUQkTswJ9hz8QNzeqIYmAbhonC_JAXCxYpEuikm1KSDMUdIcXQO_1weAA7F0lG3GOv6PZ6QCCmMNOtrI8d_GIR2zGrRZuhGf0UF6jndUKm9Vftg1E9ZUWdt5QasMJkOsrN8",
    contenido_html: "",
    fecha_publicacion: "2024-08-05",
  },
  "expandiendo-atencion-rural": {
    titulo: "Expanding Care in Rural Communities",
    resumen: "Three new mobile clinics bringing essential medical care to previously unreached regions across the country.",
    categoria: "Mission Update",
    imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtj2_UADzENxPpAypwUlKOXfP4jAXr84LcletR9iXHB7vovWFIWSQiZFVZRPT7e6_LM5aNm6bEBZw9XR5qvQvHobmdV_ZfS-CA5L4wSdrTn_nlrJnLw910ii3aW6ZYDJGjQkh9GAobbDlZPu0zWNvwI1apafl-vBpzM_9UOSl7BSoCR1cGNw8-bOoiYqllNt8jRpH48udSBxjEVVI_F8iyOxgHBaubo2ewEdVyxhUozTUsrhStCgmDviC_m5vimSP9-T2lyLb5Qn8",
    contenido_html: "",
    fecha_publicacion: "2024-07-12",
  },
  "recuperacion-maria": {
    titulo: "Maria's Recovery Journey",
    resumen: "Life-saving cardiovascular surgery for a young mother brings hope to an entire community in need.",
    categoria: "Patient Story",
    imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4UImxzKlQG1xEgUib0LCmX5PloStnSX8JKONE1ppvULsfXyL_j8czGSN-WTspKXccjm68nKpBBqpY7PXru8I749gQnOl9UiTNo1uxh_e171GPTj1cB3FyXZflYO73khwbZReyZqjRM8be-zv1JduZty_FsoalyBJ9AJsGLxNzaP7_6886clLzQ3CPrYdXW7LBNQuGcbsaEw2T7ohxEZBp1znmPUIq9Zt4HO_ZtQnCeE7mywsNIdBqFWJ1PM_iWh7h1Jfrj3DO9uY",
    contenido_html: "",
    fecha_publicacion: "2024-06-18",
  },
  "excelencia-medica-fe": {
    titulo: "Medical Excellence in Faith-Based Care",
    resumen: "How we integrate spiritual values with world-class medical standards to provide compassionate, holistic care.",
    categoria: "Excellence",
    imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBV8zbc1VsO7_tMSGR2RBmy6wM6vk-VcvPAmV4KSqnAbpXaDgYRIA4gYQ3-WCdTkOes_cs4xLagdchqy5qS9UUKg5g00jrHqRcErnzU_2ZeQSakEnHY73GpQash7mHRT7Iuq0cN_OvZe-XsB-AQAYHsh5sq8Ahn4JLhRpUTUlw_uxTaPGQxvuPedNh1Dq7dA_0XvAnBpHbBF9DJOBP8O9D3Dz9QZbEBOmLAOzuhKLhDG3VygVGyw52wlxyqJ3gmZkKMlPq-lB7rbyM",
    contenido_html: "",
    fecha_publicacion: "2024-05-22",
  },
  "impacto-comunitario-voluntario": {
    titulo: "Community Spotlight: Volunteer Impact",
    resumen: "Celebrating the dedicated individuals who make our missions possible and bring hope to communities worldwide.",
    categoria: "Community News",
    imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC03_6DfzYX6va02PtEg3uKMPfTx9qbP8biGLZEhm8sEMuealLUGntsFSVusJL0QXkADDx9gZOIuptHYPMo7p4pnF_VozdK6foynOWpU3UaECPZVXPi-j2N7Jt67k0DmWCKosPiLm7qqzVUzoufv17qV9viiOaJZKSdDhnC10JcHCdM93uM9TaOcPiGn35JooQuYUO9TyMbycXRplAvqVl6o6DCSCNroMN2eDBoYgOWWXly5cqPBKrTRMslsUAkCb5InkQc2xwvFbU",
    contenido_html: "",
    fecha_publicacion: "2024-04-15",
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
  if (fallback) return { ...fallback, id: slug, slug, publicado: true, created_at: fallback.fecha_publicacion, updated_at: fallback.fecha_publicacion, url_pdf_storage: null, contenido_html: fallback.contenido_html || `<p>${fallback.resumen} In rural communities across the regions we serve, the nearest hospital can be hours away, and the cost of transportation alone discourages patients from seeking even the most basic care. Pregnant women often give birth without a trained professional. Children miss critical vaccinations. Chronic conditions like diabetes and hypertension go undiagnosed until it is too late. Our mobile medical units change that — each one is equipped with diagnostic tools, essential medications, and staffed by volunteer doctors, nurses, and community health workers who have dedicated their careers to serving the underserved. We bring the clinic to the patient, not the other way around. Since launching our first mobile unit in 2022, we have served over 15,000 patients across three regions. But the need continues to grow, and every new partnership allows us to expand further.</p><p>Our mobile medical units are designed to bridge this gap. Each unit is equipped with diagnostic tools, essential medications, and staffed by volunteer doctors, nurses, and community health workers. We bring the clinic to the patient, not the other way around.</p><p>Since launching our first mobile unit in 2022, we have served over 15,000 patients across three regions. New partnerships with local governments and international donors have allowed us to expand our reach and train local healthcare workers.</p>`, perfiles: null }
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
      <div className="w-full md:max-w-[65vw] mx-auto">
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
                <img src="/images/D-magazine-medical-guide-2023-cover-1.png" alt="IKMA Journal" className="w-full h-full object-cover" />
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
        <section className="mt-16 md:mt-24">
          <h4 className="font-headline-md text-headline-md text-primary mb-2">Recommended Articles</h4>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">Continue reading from our journal.</p>
          <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-px">
            <div className="flex gap-gutter min-w-min">
              {Object.entries(staticArticles)
                .filter(([s]) => s !== slug)
                .map(([s, a]) => (
                  <Link
                    key={s}
                    href={`/revista/${s}`}
                    className="flex flex-col group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-[0_12px_24px_rgba(7,68,105,0.06)] hover:-translate-y-0.5 transition-all duration-300 snap-start w-[280px] sm:w-[300px] flex-shrink-0"
                  >
                    <div className="w-full aspect-[16/10] overflow-hidden bg-surface-container-high">
                      <img src={a.imagen_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <span className="bg-secondary-container text-on-secondary-container font-label-sm text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {a.categoria}
                      </span>
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
      </div>
    </article>
  )
}
