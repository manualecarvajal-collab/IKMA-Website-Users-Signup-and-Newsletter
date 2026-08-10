import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import Icon from "@/components/Icon"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Thank You - IKMA",
  description: "Thank you for your support. Your subscription helps us continue our mission.",
}

export default async function SuscripcionExitoPage() {
  const t = await getTranslations("SubscriptionSuccess")
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Verify subscription status
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("suscripcion_activa, nombre_completo")
    .eq("id", user.id)
    .single()

  // Fetch latest magazine for immediate access
  const { data: latestMagazine } = await supabase
    .from("revistas")
    .select("id, titulo, descripcion, imagen_portada")
    .eq("publicado", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <section className="py-section-padding">
      <div className="max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
          <Icon name="verified" size={60} className="text-tertiary mb-4 block mx-auto" />
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">{t("title")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-2">
            {t("description")}
          </p>
          {perfil?.nombre_completo && (
            <p className="font-label-bold text-label-bold text-primary mb-8">
              {t("welcome")}, {perfil.nombre_completo}!
            </p>
          )}

          {/* Subscription status badge */}
          {perfil?.suscripcion_activa ? (
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-2 mb-8 font-label-bold text-label-sm">
              <Icon name="check_circle" size={16} />
              {t("activeSubscription")}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-4 py-2 mb-8 font-label-bold text-label-sm">
              <Icon name="hourglass_empty" size={16} />
              {t("processingSubscription")}
            </div>
          )}

          {/* Magazine access */}
          {latestMagazine && perfil?.suscripcion_activa && (
            <div className="bg-surface-container-low rounded-2xl p-6 mb-8 text-left border border-outline-variant/20">
              <h3 className="font-label-bold text-label-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                <Icon name="menu_book" size={18} />
                {t("latestIssue")}
              </h3>
              <div className="flex gap-4 items-start">
                {latestMagazine.imagen_portada ? (
                  <div className="w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-surface-variant">
                    <img src={latestMagazine.imagen_portada} alt={latestMagazine.titulo} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-24 shrink-0 rounded-lg bg-surface-container-high flex items-center justify-center">
                    <Icon name="description" size={32} className="text-on-surface-variant/30" />
                  </div>
                )}
                <div>
                  <h4 className="font-label-bold text-label-bold text-on-surface notranslate">{latestMagazine.titulo}</h4>
                  {latestMagazine.descripcion && (
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1 line-clamp-2">{latestMagazine.descripcion}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 justify-center">
            <Link
              href="/"
              className="bg-primary text-on-primary font-label-bold text-label-bold px-8 py-3.5 rounded-lg hover:bg-primary/90 transition-all w-full text-center"
            >
              {t("backHome")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
