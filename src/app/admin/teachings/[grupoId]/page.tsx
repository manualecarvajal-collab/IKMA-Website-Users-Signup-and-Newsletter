import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { reordenarVideos } from "@/lib/supabase/admin-actions"
import { VideoTable } from "./VideoTable"
import { EditableGroupTitle } from "./EditableGroupTitle"

export default async function AdminGrupoVideosPage(props: { params: Promise<{ grupoId: string }> }) {
  const { grupoId } = await props.params
  const supabase = await createClient()

  const { data: grupo } = await supabase.from("grupos").select("*").eq("id", grupoId).single()
  if (!grupo) notFound()

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("grupo_id", grupoId)
    .order("posicion", { ascending: true })
    .order("created_at", { ascending: false })

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/teachings" className="text-on-surface-variant hover:text-primary transition-colors">
              <svg className="w-[18px] h-[18px] inline" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            </Link>
            <EditableGroupTitle grupoId={grupoId} nombre={grupo.nombre} />
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">{videos?.length ?? 0} videos in this group</p>
        </div>
        <Link
          href={`/admin/teachings/${grupoId}/nuevo`}
          className="w-full sm:w-auto bg-primary text-on-primary font-label-bold text-label-bold px-5 py-2.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors inline-flex items-center justify-center gap-2"
        >
          <svg className="w-[14px] h-[14px] inline" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          New Video
        </Link>
      </div>
      <VideoTable videos={videos ?? []} grupoId={grupoId} reordenarVideos={reordenarVideos} />
    </div>
  )
}
