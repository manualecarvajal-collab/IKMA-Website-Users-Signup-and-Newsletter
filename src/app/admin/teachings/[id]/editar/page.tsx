import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VideoForm } from "@/components/VideoForm"
import { updateVideo } from "@/lib/supabase/admin-actions"

export default async function EditarVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: video } = await supabase.from("videos").select("*").eq("id", id).single()
  if (!video) notFound()

  const updateWithId = updateVideo.bind(null, id)

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Edit Video</h1>
      <VideoForm action={updateWithId} video={video} />
    </div>
  )
}
