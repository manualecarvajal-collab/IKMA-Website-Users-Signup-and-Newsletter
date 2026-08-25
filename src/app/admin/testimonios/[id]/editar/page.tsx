import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TestimonialForm } from "@/components/TestimonialForm"
import { updateTestimonio } from "@/lib/supabase/admin-actions"

export default async function EditarTestimonioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: testimonio } = await supabase.from("testimonios").select("*").eq("id", id).single()
  if (!testimonio) notFound()

  const updateWithId = updateTestimonio.bind(null, id)

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Edit Testimonial</h1>
      <TestimonialForm action={updateWithId} testimonio={testimonio} />
    </div>
  )
}
