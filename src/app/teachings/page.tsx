import Link from "next/link"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Icon from "@/components/Icon"

export const metadata: Metadata = {
  title: "Teachings - IKMA Video Library",
  description:
    "Explore biblical and medical teachings from the International Kingdom Medical Association — featuring videos on faith, healthcare, and global mission.",
}

export default async function TeachingsPage() {
  const supabase = await createClient()

  const { data: grupos } = await supabase.from("grupos").select("*").order("posicion", { ascending: true }).order("created_at", { ascending: true })

  const { data: videos } = await supabase
    .from("videos")
    .select("grupo_id, slug, embed_url, imagen_preview")
    .eq("publicado", true)

  const vidMap = new Map<string, { slug: string; embed_url: string; imagen_preview: string | null }[]>()
  const videoCount = new Map<string, number>()
  for (const v of videos ?? []) {
    videoCount.set(v.grupo_id, (videoCount.get(v.grupo_id) ?? 0) + 1)
    const list = vidMap.get(v.grupo_id) ?? []
    vidMap.set(v.grupo_id, list)
    if (list.length < 4) list.push(v)
  }

  if (!grupos || grupos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body-md text-body-md text-on-surface-variant">No teachings available yet.</p>
      </div>
    )
  }

  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-padding">
        <div className="mb-12">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Teachings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Browse our collection of teachings organized by topic. Select a group to explore its videos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {grupos.map((g: { id: string; nombre: string; slug: string }) => {
            const previews = vidMap.get(g.id) ?? []
            return (
              <Link
                key={g.id}
                href={`/teachings/${g.slug}`}
                className="group bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/20 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="grid grid-cols-2 gap-1 p-1">
                  {previews.length > 0 ? (
                    previews.slice(0, 4).map((v, i) => (
                      <div key={i} className="aspect-video bg-surface-container rounded overflow-hidden">
                        <img
                          src={v.imagen_preview || "/placeholder-thumbnail.webp"}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 aspect-video bg-surface-container-low rounded flex items-center justify-center">
                      <Icon name="play_circle" size={40} className="text-on-surface-variant/30" />
                    </div>
                  )}
                  {previews.length > 0 && previews.length < 4 && (
                    <>
                      {Array.from({ length: 4 - previews.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-video bg-surface-container-low rounded" />
                      ))}
                    </>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors truncate">{g.nombre}</h3>
                    <span className="font-label-bold text-label-sm text-on-surface-variant whitespace-nowrap ml-2">{videoCount.get(g.id) ?? 0} videos</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">/{g.slug}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
