import { TestimonialForm } from "@/components/TestimonialForm"
import { createTestimonio } from "@/lib/supabase/admin-actions"

export default async function NuevoTestimonioPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">New Testimonial</h1>
      <TestimonialForm action={createTestimonio} />
    </div>
  )
}
