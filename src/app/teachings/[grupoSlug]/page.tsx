import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Icon from "@/components/Icon"

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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export async function generateMetadata({ params }: { params: Promise<{ grupoSlug: string }> }): Promise<Metadata> {
  const { grupoSlug } = await params
  const supabase = await createClient()
  const { data: grupo } = await supabase.from("grupos").select("nombre").eq("slug", grupoSlug).single()
  if (!grupo) return { title: "Not Found - IKMA" }
  return {
    title: `${grupo.nombre} - IKMA Teachings`,
    description: `Browse teachings in the ${grupo.nombre} group.`,
  }
}

export default async function GrupoVideosPage({ params }: { params: Promise<{ grupoSlug: string }> }) {
  const { grupoSlug } = await params
  const supabase = await createClient()

  const { data: grupo } = await supabase.from("grupos").select("*").eq("slug", grupoSlug).single()
  if (!grupo) notFound()

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("grupo_id", grupo.id)
    .eq("publicado", true)
    .order("posicion", { ascending: true })
    .order("created_at", { ascending: false })

  if (!videos || videos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body-md text-body-md text-on-surface-variant">No videos in this group yet.</p>
      </div>
    )
  }

  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-padding">
        <nav className="flex items-center gap-2 font-label-bold text-label-sm text-on-surface-variant mb-8">
          <Link href="/teachings" className="hover:text-primary transition-colors">Teachings</Link>
          <Icon name="chevron_right" size={14} />
          <span className="text-primary">{grupo.nombre}</span>
        </nav>

        <div className="mb-10">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">{grupo.nombre}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{videos.length} videos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {(videos as Video[]).map((v) => (
            <Link
              key={v.id}
              href={`/teachings/${grupoSlug}/${v.slug}`}
              className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/20 hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
            >
              <div className="relative aspect-video bg-surface-container overflow-hidden">
                {v.imagen_preview ? (
                  <img
                    src={v.imagen_preview}
                    alt={v.titulo}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container-low">
                    <Icon name="play_circle" size={48} className="text-on-surface-variant/30" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20">
                  <Icon name="play_circle" size={48} className="text-on-primary" />
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-label-bold text-label-bold text-on-surface line-clamp-2 group-hover:text-primary transition-colors mb-2">{v.titulo}</h3>
                {v.descripcion && (
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-4">{v.descripcion}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-surface-container">
                  <span className="font-label-bold text-label-sm text-primary">{formatDate(v.created_at)}</span>
                  <Icon name="arrow_forward" className="text-on-surface-variant group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
