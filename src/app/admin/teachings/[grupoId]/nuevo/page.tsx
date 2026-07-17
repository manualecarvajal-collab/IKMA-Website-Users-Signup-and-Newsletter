import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VideoForm } from "@/components/VideoForm"
import { createVideo } from "@/lib/supabase/admin-actions"

export default async function NuevoVideoPage(props: { params: Promise<{ grupoId: string }> }) {
  const { grupoId } = await props.params
  const supabase = await createClient()
  const { data: grupo } = await supabase.from("grupos").select("nombre").eq("id", grupoId).single()
  if (!grupo) notFound()

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">New Video in {grupo.nombre}</h1>
      <VideoForm action={createVideo} grupoId={grupoId} />
    </div>
  )
}
