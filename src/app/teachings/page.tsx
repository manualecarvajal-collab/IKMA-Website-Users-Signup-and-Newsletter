import Link from "next/link"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Icon from "@/components/Icon"

export const metadata: Metadata = {
  title: "Teachings - IKMA Video Library",
  description:
    "Explore biblical and medical teachings from the International Kingdom Medical Association — featuring videos on faith, healthcare, and global mission.",
}

interface Video {
  id: string
  titulo: string
  slug: string
  descripcion: string | null
  embed_url: string
  imagen_preview: string | null
  publicado: boolean
  created_at: string
  categoria_id?: string | null
}

interface Categoria {
  id: string
  nombre: string
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  return m?.[1] ?? null
}

function thumbnailUrl(v: Video): string {
  if (v.imagen_preview) return v.imagen_preview
  const id = youtubeId(v.embed_url)
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : ""
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default async function TeachingsPage(props: { searchParams?: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const catFilter = searchParams?.categoria
  const selectedCat = catFilter || ""

  let query = supabase.from("videos").select("*").eq("publicado", true)
  if (catFilter) query = query.eq("categoria_id", catFilter)
  query = query.order("created_at", { ascending: false })

  const { data: videos } = await query
  const { data: categorias } = await supabase.from("categorias").select("*").order("nombre", { ascending: true })
  const catMap = new Map((categorias ?? []).map((c: Categoria) => [c.id, c.nombre]))

  if (!videos || videos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body-md text-body-md text-on-surface-variant">No teachings available yet.</p>
      </div>
    )
  }

  const featured = videos[0] as Video
  const recommended = videos.slice(1, 5)

  return (
    <>
      {/* Hero: Featured Video + Sidebar */}
      <section className="bg-surface border-b border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-padding">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-gutter">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <Link href={`/teachings/${featured.slug}`} className="group">
                <div className="relative aspect-video bg-surface-container rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={thumbnailUrl(featured)}
                    alt={featured.titulo}
                    loading="eager"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Icon name="play_arrow" size={48} className="text-primary" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-primary/80 backdrop-blur-md text-on-primary px-3 py-1 rounded font-label-bold text-label-sm uppercase tracking-wider">
                    Featured Content
                  </div>
                </div>
              </Link>
              <div>
                <h1 className="font-headline-md text-headline-md text-primary mb-2 leading-tight">{featured.titulo}</h1>
                {featured.descripcion && (
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl line-clamp-2">{featured.descripcion}</p>
                )}
                <div className="flex items-center gap-4 mt-6">
                  {featured.categoria_id && catMap.has(featured.categoria_id) && (
                    <span className="inline-flex items-center gap-1.5 bg-primary-fixed text-primary font-label-bold text-label-sm px-3 py-1 rounded-full">
                      {catMap.get(featured.categoria_id)}
                    </span>
                  )}
                  <span className="flex items-center gap-2 font-label-bold text-label-sm text-on-surface-variant">
                    <Icon name="calendar_today" size={18} />
                    {formatDate(featured.created_at)}
                  </span>
                </div>
              </div>
            </div>
            {recommended.length > 0 && (
              <aside className="lg:col-span-4 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                  <h2 className="font-label-bold text-label-sm text-primary uppercase tracking-widest">More Teachings</h2>
                  <Link href="#library" className="text-primary font-label-bold text-label-sm hover:underline">View All</Link>
                </div>
                <div className="flex flex-col gap-6 max-h-[600px] overflow-y-auto pr-2">
                  {recommended.map((v) => (
                    <Link key={v.id} href={`/teachings/${(v as Video).slug}`} className="flex gap-4 group cursor-pointer">
                      <div className="w-32 h-20 flex-shrink-0 bg-surface-container rounded-lg overflow-hidden relative">
                        <img
                          src={thumbnailUrl(v as Video)}
                          alt={(v as Video).titulo}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex flex-col justify-between py-0.5 min-w-0">
                        <h3 className="font-label-bold text-label-sm text-on-surface line-clamp-2 group-hover:text-primary transition-colors">{(v as Video).titulo}</h3>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{formatDate((v as Video).created_at)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <section id="library" className="py-section-padding bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary">Resource Library</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Explore our collection of educational and mission-focused content.</p>
            </div>
          </div>

          {/* Category Filter */}
          {categorias && categorias.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-outline-variant/20">
              <CategoryChip href="/teachings" label="All" active={!selectedCat} />
              {(categorias as Categoria[]).map((c) => (
                <CategoryChip
                  key={c.id}
                  href={`/teachings?categoria=${c.id}`}
                  label={c.nombre}
                  active={selectedCat === c.id}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {(videos as Video[]).map((v) => (
              <a
                key={v.id}
                href={`/teachings/${v.slug}`}
                className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/20 hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
              >
                <div className="relative aspect-video bg-surface-container overflow-hidden">
                  <img
                    src={thumbnailUrl(v)}
                    alt={v.titulo}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20">
                    <Icon name="play_circle" size={48} className="text-on-primary" />
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  {v.categoria_id && catMap.has(v.categoria_id) && (
                    <span className="self-start inline-flex items-center bg-primary-fixed text-primary font-label-bold text-label-sm px-2.5 py-0.5 rounded-full mb-2">
                      {catMap.get(v.categoria_id)}
                    </span>
                  )}
                  <h3 className="font-label-bold text-label-bold text-on-surface line-clamp-2 group-hover:text-primary transition-colors mb-2">{v.titulo}</h3>
                  {v.descripcion && (
                    <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-4">{v.descripcion}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-surface-container">
                    <span className="font-label-bold text-label-sm text-primary">{formatDate(v.created_at)}</span>
                    <Icon name="arrow_forward" className="text-on-surface-variant group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function CategoryChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center px-4 py-2 rounded-full font-label-bold text-label-sm transition-all ${
        active
          ? "bg-primary text-on-primary shadow-sm"
          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30"
      }`}
    >
      {label}
    </a>
  )
}
