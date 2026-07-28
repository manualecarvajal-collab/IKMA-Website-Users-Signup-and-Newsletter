import { createClient } from "@/lib/supabase/server"
import { createGrupo, reordenarGrupos } from "@/lib/supabase/admin-actions"
import { GrupoGrid } from "./GrupoGrid"
import { getTranslations } from "next-intl/server"

export default async function AdminTeachingsPage() {
  const t = await getTranslations("Admin")
  const supabase = await createClient()
  const { data: grupos } = await supabase.from("grupos").select("*").order("posicion", { ascending: true }).order("created_at", { ascending: true })

  const { data: videoList } = await supabase.from("videos").select("grupo_id")
  const videoCount = new Map<string, number>()
  for (const v of videoList ?? []) {
    videoCount.set(v.grupo_id, (videoCount.get(v.grupo_id) ?? 0) + 1)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">{t("teachings")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("teachingsDesc")}</p>
        </div>
      </div>
      <GrupoGrid grupos={grupos ?? []} videoCount={Object.fromEntries(videoCount)} createGrupo={createGrupo} reordenarGrupos={reordenarGrupos} />
    </div>
  )
}
