import { VideoForm } from "@/components/VideoForm"
import { createVideo, getCategorias } from "@/lib/supabase/admin-actions"

export default async function NuevoVideoPage() {
  const categorias = await getCategorias()

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">New Video</h1>
      <VideoForm action={createVideo} categorias={categorias} />
    </div>
  )
}
