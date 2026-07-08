import Link from "next/link"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

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
}

function youtubeId(url: string): string | null {
  const m = url.match(/embed\/([a-zA-Z0-9_-]+)/)
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

async function getVideos(): Promise<Video[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("videos")
    .select("*")
    .eq("publicado", true)
    .order("created_at", { ascending: false })
  return (data ?? []) as Video[]
}

export default async function TeachingsPage() {
  const videos = await getVideos()

  if (videos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body-md text-body-md text-on-surface-variant">No teachings available yet.</p>
      </div>
    )
  }

  const featured = videos[0]
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
                      <span className="material-symbols-outlined text-primary text-5xl">play_arrow</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-primary/80 backdrop-blur-md text-on-primary px-3 py-1 rounded font-label-bold text-label-sm uppercase tracking-wider">
                    Featured Content
                  </div>
                </div>
              </Link>
              <div>
                <h1 className="font-headline-lg text-headline-lg text-primary mb-4 leading-tight">{featured.titulo}</h1>
                {featured.descripcion && (
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl leading-relaxed">{featured.descripcion}</p>
                )}
                <div className="flex items-center gap-4 mt-6">
                  <span className="flex items-center gap-2 font-label-bold text-label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-lg">calendar_today</span>
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
                    <Link key={v.id} href={`/teachings/${v.slug}`} className="flex gap-4 group cursor-pointer">
                      <div className="w-32 h-20 flex-shrink-0 bg-surface-container rounded-lg overflow-hidden relative">
                        <img
                          src={thumbnailUrl(v)}
                          alt={v.titulo}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex flex-col justify-between py-0.5 min-w-0">
                        <h3 className="font-label-bold text-label-sm text-on-surface line-clamp-2 group-hover:text-primary transition-colors">{v.titulo}</h3>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{formatDate(v.created_at)}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {videos.map((v) => (
              <Link
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
                    <span className="material-symbols-outlined text-on-primary text-5xl">play_circle</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-headline-md text-headline-md text-on-surface line-clamp-2 group-hover:text-primary transition-colors mb-3">{v.titulo}</h3>
                  {v.descripcion && (
                    <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 mb-6">{v.descripcion}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-surface-container">
                    <span className="font-label-bold text-label-sm text-primary">{formatDate(v.created_at)}</span>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
