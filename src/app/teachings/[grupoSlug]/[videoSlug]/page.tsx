import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getTranslations, getLocale } from "next-intl/server"
import Icon from "@/components/Icon"
import VideoPaywall from "./VideoPaywall"

interface Video {
  id: string
  titulo: string
  slug: string
  descripcion: string | null
  embed_url: string
  imagen_preview: string | null
  publicado: boolean
  created_at: string
  grupo_id: string
}

const DOMINIOS_PERMITIDOS = ["www.youtube.com", "youtube.com", "youtu.be", "player.vimeo.com", "subsplash.com"]

function embedSrcSeguro(value: string): string | null {
  const src = value.match(/src="([^"]+)"/)?.[1] ?? value
  try {
    const u = new URL(src)
    if (u.protocol !== "https:") return null
    return DOMINIOS_PERMITIDOS.includes(u.hostname) ? u.toString() : null
  } catch {
    return null
  }
}

function formatDate(d: string, locale: string) {
  return new Date(d).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

async function getVideo(slug: string, grupoId: string): Promise<Video | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("videos")
    .select("*")
    .eq("slug", slug)
    .eq("grupo_id", grupoId)
    .eq("publicado", true)
    .single()
  return data as Video | null
}

async function getRelated(grupoId: string, currentId: string): Promise<Video[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("videos")
    .select("*")
    .eq("grupo_id", grupoId)
    .eq("publicado", true)
    .neq("id", currentId)
    .order("posicion", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(6)
  return (data ?? []) as Video[]
}

export async function generateMetadata({ params }: { params: Promise<{ grupoSlug: string; videoSlug: string }> }): Promise<Metadata> {
  const { grupoSlug, videoSlug } = await params
  const t = await getTranslations("Teachings")
  const supabase = await createClient()
  const { data: grupo } = await supabase.from("grupos").select("id, nombre").eq("slug", grupoSlug).single()
  if (!grupo) return { title: "Not Found - IKMA" }
  const video = await getVideo(videoSlug, grupo.id)
  if (!video) return { title: "Not Found - IKMA" }
  return {
    title: `${video.titulo} - ${t("pageTitle")}`,
    description: video.descripcion ?? t("pageDesc"),
  }
}

export const dynamic = "force-dynamic"

export default async function TeachingPage({ params }: { params: Promise<{ grupoSlug: string; videoSlug: string }> }) {
  const { grupoSlug, videoSlug } = await params
  const t = await getTranslations("Teachings")
  const locale = await getLocale()
  const supabase = await createClient()

  // Check subscription for video paywall
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = user
    ? await supabase.from("perfiles").select("suscripcion_activa").eq("id", user.id).single()
    : { data: null }
  const isSubscribed = !!perfil?.suscripcion_activa

  const { data: grupo } = await supabase.from("grupos").select("id, nombre").eq("slug", grupoSlug).single()
  if (!grupo) notFound()

  const video = await getVideo(videoSlug, grupo.id)
  if (!video) notFound()

  const related = await getRelated(grupo.id, video.id)

  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-padding">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8">
            <nav className="flex items-center gap-2 font-label-bold text-label-sm text-on-surface-variant mb-6">
              <Link href="/teachings" className="hover:text-primary transition-colors">{t("pageTitle")}</Link>
              <Icon name="chevron_right" size={14} />
              <Link href={`/teachings/${grupoSlug}`} className="hover:text-primary transition-colors notranslate">{grupo.nombre}</Link>
              <Icon name="chevron_right" size={14} />
              <span className="text-primary truncate notranslate">{video.titulo}</span>
            </nav>
            <div className="relative aspect-video bg-surface-container rounded-xl overflow-hidden shadow-lg mb-8">
              {isSubscribed ? (
                embedSrcSeguro(video.embed_url) ? (
                  <iframe
                    src={embedSrcSeguro(video.embed_url)!}
                    title={video.titulo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-on-surface-variant font-label-bold text-label-sm">
                    Video no disponible
                  </div>
                )
              ) : (
                <VideoPaywall />
              )}
            </div>
            <h1 className="font-headline-md text-headline-md text-primary mb-4 notranslate">{video.titulo}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="flex items-center gap-2 font-label-bold text-label-sm text-on-surface-variant">
                <Icon name="calendar_today" size={18} />
                {formatDate(video.created_at, locale)}
              </span>
            </div>
            {video.descripcion && (
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{video.descripcion}</p>
            )}
          </div>
          {related.length > 0 && (
            <aside className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <h2 className="font-label-bold text-label-sm text-primary uppercase tracking-widest notranslate">{t("moreIn")} {grupo.nombre}</h2>
                <Link href={`/teachings/${grupoSlug}`} className="text-primary font-label-bold text-label-sm hover:underline">{t("viewAll")}</Link>
              </div>
              <div className="flex flex-col gap-6">
                {related.map((v) => (
                  <Link key={v.id} href={`/teachings/${grupoSlug}/${v.slug}`} className="flex gap-4 group cursor-pointer">
                    <div className="w-32 h-20 flex-shrink-0 bg-surface-container rounded-lg overflow-hidden relative">
                      {v.imagen_preview ? (
                        <img src={v.imagen_preview} alt={v.titulo} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-container-low">
                          <Icon name="play_circle" size={24} className="text-on-surface-variant/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between py-0.5 min-w-0">
                      <h3 className="font-label-bold text-label-sm text-on-surface line-clamp-2 group-hover:text-primary transition-colors notranslate">{v.titulo}</h3>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{formatDate(v.created_at, locale)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}
