import Link from "next/link"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Revista - IKMA Medical Journal",
  description:
    "Explore the IKMA medical journal — featuring peer-reviewed articles, mission updates, and community stories from the International Kingdom Medical Association.",
}

const IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuBHuLiwXl_xEBXKpZx7HZPQ7upktgXRz6MeiiraZMSW-EokcqsS7YcQ2MRrGXaPyInQfX7OAr-Zv9L_tnxiN-mPbkgGYR9oaIL1qirVlCApixW6K8s41Yk2o48vbuLj9fEBFVtO7Ur5zJWZ1BP51tvpjgcxe7F3rP9ASnuSUgfSaVGfoOoZzeTaO0r4IGq2UbfcvMbyBmMU-k7usazvbTooLeyUephhENZ-rwqmkIV4iMhmPdAHhtf3qCxQlKwpYqVqB-4tGw9945k"

async function getArticles() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("articulos")
    .select("*")
    .eq("publicado", true)
    .order("fecha_publicacion", { ascending: false })

  if (data && data.length > 0) return data
  return null
}

export default async function RevistaPage() {
  const articles = await getArticles()

  return (
    <>
      {/* Featured Stories */}
      <section className="py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-10">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Featured Stories</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Latest updates from our missions and community.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
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
              {(articles ?? []).slice(1, 4).map((a) => (
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
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-10">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">All Articles</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Browse our complete library of medical articles and stories.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {(articles ?? []).map((a) => (
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
