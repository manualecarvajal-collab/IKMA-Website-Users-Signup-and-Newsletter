import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import ReadMagazineButton from "@/components/ReadMagazineButton"
import Icon from "@/components/Icon"

export const metadata: Metadata = {
  title: "Magazine - IKMA",
  description:
    "Browse the collection of IKMA magazines — delivered with clinical insights, mission updates, and community stories.",
}

interface Revista {
  id: string
  titulo: string
  descripcion: string | null
  archivo_url: string | null
  imagen_portada: string | null
  publicado: boolean
  created_at: string
}

async function getMagazines(): Promise<Revista[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("revistas")
    .select("*")
    .eq("publicado", true)
    .order("fecha_publicacion", { ascending: false })
  return (data ?? []) as Revista[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })
}

export default async function NewsletterPage() {
  const magazines = await getMagazines()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = user
    ? await supabase.from("perfiles").select("suscripcion_activa").eq("id", user.id).single()
    : { data: null }
  const isAuthenticated = !!user
  const isSubscribed = !!perfil?.suscripcion_activa

  return (
    <section className="py-section-padding">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="mb-12">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-4">
            Magazine
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Browse our collection of magazines. Subscribe to get full access to every issue.
          </p>
        </div>

        {magazines.length === 0 && (
          <div className="text-center py-20">
            <Icon name="mail" size={60} className="text-on-surface-variant/30 mb-4" />
            <p className="font-body-lg text-body-lg text-on-surface-variant">No magazines published yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {magazines.map((m) => (
            <div
              key={m.id}
              className="flex flex-col bg-white rounded-lg overflow-hidden shadow-sm border border-outline-variant/20 hover:shadow-[0_12px_24px_rgba(7,68,105,0.06)] hover:-translate-y-0.5 transition-all duration-300 group"
            >
              {m.imagen_portada ? (
                <div className="aspect-[3/4] w-full overflow-hidden bg-surface-variant">
                  <img src={m.imagen_portada} alt={m.titulo} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="aspect-[3/4] w-full bg-surface-container-high flex items-center justify-center">
                  <Icon name="description" size={48} className="text-on-surface-variant/30" />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <p className="font-label-sm text-label-sm text-primary mb-1">
                  {formatDate(m.created_at)}
                </p>
                <h3 className="font-headline-md text-headline-md text-on-surface text-sm leading-snug mb-2 notranslate">
                  {m.titulo}
                </h3>
                {m.descripcion && (
                  <p className="font-body-md text-body-md text-on-surface-variant text-xs line-clamp-2 mb-4 flex-1">
                    {m.descripcion}
                  </p>
                )}
                <ReadMagazineButton
                  isAuthenticated={isAuthenticated}
                  isSubscribed={isSubscribed}
                  revistaId={m.id}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
