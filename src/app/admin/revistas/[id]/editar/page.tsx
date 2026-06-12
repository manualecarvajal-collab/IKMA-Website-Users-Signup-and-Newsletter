import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MagazineForm } from "@/components/MagazineForm"
import { updateRevista } from "@/lib/supabase/admin-actions"

export default async function EditarRevistaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: revista } = await supabase.from("revistas").select("*").eq("id", id).single()
  if (!revista) notFound()

  const updateWithId = updateRevista.bind(null, id)

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Edit Magazine</h1>
      <MagazineForm action={updateWithId} revista={revista} />
    </div>
  )
}
