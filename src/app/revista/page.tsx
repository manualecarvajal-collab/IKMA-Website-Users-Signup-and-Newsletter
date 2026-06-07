import Link from "next/link"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Revista - IKMA Medical Journal",
  description:
    "Explore the IKMA medical journal — featuring peer-reviewed articles, mission updates, and community stories from the International Kingdom Medical Association.",
}

const IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuBHuLiwXl_xEBXKpZx7HZPQ7upktgXRz6MeiiraZMSW-EokcqsS7YcQ2MRrGXaPyInQfX7OAr-Zv9L_tnxiN-mPbkgGYR9oaIL1qirVlCApixW6K8s41Yk2o48vbuLj9fEBFVtO7Ur5zJWZ1BP51tvpjgcxe7F3rP9ASnuSUgfSaVGfoOoZzeTaO0r4IGq2UbfcvMbyBmMU-k7usazvbTooLeyUephhENZ-rwqmkIV4iMhmPdAHhtf3qCxQlKwpYqVqB-4tGw9945k"

interface Article {
  id: string
  titulo: string
  slug: string
  resumen: string | null
  categoria: string | null
  imagen_url: string | null
  publicado: boolean
  created_at: string
}

async function getArticles(): Promise<Article[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("articulos")
    .select("*")
    .eq("publicado", true)
    .order("fecha_publicacion", { ascending: false })

  if (data && data.length > 0) return data as Article[]
  return staticArticles
}

export default async function RevistaPage() {
  const articles = await getArticles()

  return (
    <>
      {/* Featured Stories */}
      <section className="min-h-screen bg-surface flex items-start">
        <div className="w-full md:max-w-[80vw] mx-auto px-margin-mobile md:px-margin-desktop py-9 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-gutter">
            <Link
              href={articles?.[0] ? `/revista/${articles[0].slug}` : "#"}
              className="flex flex-col group cursor-pointer"
            >
              <div className="w-full h-64 rounded-lg overflow-hidden mb-5 bg-surface-container-high shadow-sm relative group-hover:shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] group-hover:-translate-y-1 transition-all duration-300">
                <img
                  src={articles?.[0]?.imagen_url || IMG}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center mb-3">
                <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-3 py-1 rounded-full uppercase tracking-wider">
                  {articles?.[0]?.categoria ?? "Medical Updates"}
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-3 group-hover:text-primary transition-colors">
                {articles?.[0]?.titulo ?? "New Medical Camp in Rural Area"}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-4">
                {articles?.[0]?.resumen ?? "Our latest initiative has established a new medical camp..."}
              </p>
              <div className="flex items-center text-primary font-semibold space-x-1">
                <span>Read More</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </div>
            </Link>
            <div className="flex flex-col space-y-5">
              {articles.slice(1, 4).map((a) => (
                <Link
                  key={a.id}
                  href={`/revista/${a.slug}`}
                  className="flex space-x-4 p-0 rounded-lg hover:bg-surface-container/50 transition-colors cursor-pointer group"
                >
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
                    <img src={a.imagen_url || IMG} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-tertiary uppercase tracking-tighter">{a.categoria}</span>
                    <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors text-sm leading-tight mt-0.5">
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
      <section className="py-section-padding bg-surface">
        <div className="max-w-container-max md:max-w-[80vw] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-10">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">All Articles</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Browse our complete library of medical articles and stories.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {articles.map((a) => (
              <Link
                key={a.id}
                href={`/revista/${a.slug}`}
                className="flex flex-col group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-[0_12px_24px_rgba(7,68,105,0.06)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-full aspect-[16/10] overflow-hidden bg-surface-container-high">
                  <img src={a.imagen_url || IMG} alt="" className="w-full h-full object-cover" />
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

      {/* Load More */}
      <div className="pb-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-center">
          <button className="bg-secondary-container text-primary font-label-bold px-8 py-3 rounded-lg hover:bg-surface-tint hover:text-on-primary transition-colors duration-300 shadow-[0_4px_20px_rgba(7,68,105,0.04)] cursor-pointer">
            Load More Articles
          </button>
        </div>
      </div>
    </>
  )
}

const staticArticles: Article[] = [
  { id: "s1", titulo: "New Medical Camp in Rural Area", slug: "nuevo-campamento-medico", categoria: "Medical Updates", resumen: "Our latest initiative has established a new medical camp bringing essential pediatric and maternal care to previously unreached rural communities.", imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHuLiwXl_xEBXKpZx7HZPQ7upktgXRz6MeiiraZMSW-EokcqsS7YcQ2MRrGXaPyInQfX7OAr-Zv9L_tnxiN-mPbkgGYR9oaIL1qirVlCApixW6K8s41Yk2o48vbuLj9fEBFVtO7Ur5zJWZ1BP51tvpjgcxe7F3rP9ASnuSUgfSaVGfoOoZzeTaO0r4IGq2UbfcvMbyBmMU-k7usazvbTooLeyUephhENZ-rwqmkIV4iMhmPdAHhtf3qCxQlKwpYqVqB-4tGw9945k", publicado: true, created_at: "2024-12-01" },
  { id: "s2", titulo: "Finding Hope in the Hardest Times", slug: "esperanza-en-tiempos-dificiles", categoria: "Stories of Faith", resumen: "A powerful testimony of faith and medicine working together.", imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAs0_z9hrCSVCDqgbuqbiuNSZ35V72TRcN-CuOcxf8eGnePDwWVo9TjtwQCuZP1ijGWC_NlcKHz0wVVbGTr3FIedkuNRE72deICvW9JoTbEMTfkBfkXiqBb0gBlee4wvDIu3N6WrTpDLJKLHXS82dWLq8sON6q1q_moQg9pX_pxfFK3ybmTIMsESu8eziNXfO_zWnYTtPlRkLAhFeyU-V5U8bgwPTQHbj6KYlKHWTk9nsoAgTUZINXluUtGd2iCGPLf5fq4C0ufi4Q", publicado: true, created_at: "2024-11-15" },
  { id: "s3", titulo: "Global Health Initiatives: A 2024 Review", slug: "iniciativas-globales-salud", categoria: "Medical Updates", resumen: "Reflecting on a year of transformative global health projects.", imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDd3ky8AbGqf2Mc19PTrWV9HJS3-aILzx4GVgA1Jxd7pUMyqqnH1XzLNINH2Nt34OVrru_MatYosw8HgTE0y6-KMAW2nL_5yzyWyLfD-r_vUcQprrtDiqLiWYpvSk12gMA5fE8uFNZEVnFkdgi4mBGhbfzH6gREBHRWEi-RTEGrn9A4suNc7C1ran38I9S2NilVqvAytdccBlOli0pW_9uJJQ70O14ZIlNWyfWSwxXC24RMblhBenSH3XUyXAiEDwQQc8aqGplqamA", publicado: true, created_at: "2024-10-20" },
  { id: "s4", titulo: "Community Gathering Event", slug: "encuentro-comunitario", categoria: "Community News", resumen: "Bringing together leaders, professionals, and volunteers.", imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvjPdQN6G-ZXVQp6UfLadZvTRtl2-mjoWUM5pIB1vbi-PTITvFWcycdQIZYvT9MR3xbwdPS_02LK9ZclqdCHUHS0pzQLSe9d6E4Y-5tJ4sdkboCUvOkEeI7jJcua3k2NClL27gChR8dKXQYbU9Hb700A9Ye7buO5_55TfEf8niQvjUDbqocVLgS752jdaNpeQq9J5BjckKw_gQaZqODnbmCNv0OzAG5Hc3SCu9KF7Ri8y-97I01AeNMoeMIr3RD6QngeNjGK3luk8", publicado: true, created_at: "2024-09-10" },
  { id: "s5", titulo: "Volunteer Spotlight: Sarah's Journey", slug: "voluntaria-sarah", categoria: "Volunteer Story", resumen: "Meet Sarah, one of our most dedicated frontline volunteers.", imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuATd1-x0lp4ughzvYQGR5Jjz-4LVEED_04MkuHaU7NMKahb5GImRSWsvjxvbEHSjOhP8eXkpjUlPuMmUcBX48DbZ4eyQE8osjcpAbLOAPs0RkAT8MB5tYkUwJxUrqZXwqpi2idmZQP1hUQkTswJ9hz8QNzeqIYmAbhonC_JAXCxYpEuikm1KSDMUdIcXQO_1weAA7F0lG3GOv6PZ6QCCmMNOtrI8d_GIR2zGrRZuhGf0UF6jndUKm9Vftg1E9ZUWdt5QasMJkOsrN8", publicado: true, created_at: "2024-08-05" },
  { id: "s6", titulo: "Expanding Care in Rural Communities", slug: "expandiendo-atencion-rural", categoria: "Mission Update", resumen: "Three new mobile clinics bringing care to unreached regions.", imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtj2_UADzENxPpAypwUlKOXfP4jAXr84LcletR9iXHB7vovWFIWSQiZFVZRPT7e6_LM5aNm6bEBZw9XR5qvQvHobmdV_ZfS-CA5L4wSdrTn_nlrJnLw910ii3aW6ZYDJGjQkh9GAobbDlZPu0zWNvwI1apafl-vBpzM_9UOSl7BSoCR1cGNw8-bOoiYqllNt8jRpH48udSBxjEVVI_F8iyOxgHBaubo2ewEdVyxhUozTUsrhStCgmDviC_m5vimSP9-T2lyLb5Qn8", publicado: true, created_at: "2024-07-12" },
  { id: "s7", titulo: "Maria's Recovery Journey", slug: "recuperacion-maria", categoria: "Patient Story", resumen: "Life-saving cardiovascular surgery for a young mother.", imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4UImxzKlQG1xEgUib0LCmX5PloStnSX8JKONE1ppvULsfXyL_j8czGSN-WTspKXccjm68nKpBBqpY7PXru8I749gQnOl9UiTNo1uxh_e171GPTj1cB3FyXZflYO73khwbZReyZqjRM8be-zv1JduZty_FsoalyBJ9AJsGLxNzaP7_6886clLzQ3CPrYdXW7LBNQuGcbsaEw2T7ohxEZBp1znmPUIq9Zt4HO_ZtQnCeE7mywsNIdBqFWJ1PM_iWh7h1Jfrj3DO9uY", publicado: true, created_at: "2024-06-18" },
  { id: "s8", titulo: "Medical Excellence in Faith-Based Care", slug: "excelencia-medica-fe", categoria: "Excellence", resumen: "Integrating spiritual values with world-class medical standards.", imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBV8zbc1VsO7_tMSGR2RBmy6wM6vk-VcvPAmV4KSqnAbpXaDgYRIA4gYQ3-WCdTkOes_cs4xLagdchqy5qS9UUKg5g00jrHqRcErnzU_2ZeQSakEnHY73GpQash7mHRT7Iuq0cN_OvZe-XsB-AQAYHsh5sq8Ahn4JLhRpUTUlw_uxTaPGQxvuPedNh1Dq7dA_0XvAnBpHbBF9DJOBP8O9D3Dz9QZbEBOmLAOzuhKLhDG3VygVGyw52wlxyqJ3gmZkKMlPq-lB7rbyM", publicado: true, created_at: "2024-05-22" },
]
