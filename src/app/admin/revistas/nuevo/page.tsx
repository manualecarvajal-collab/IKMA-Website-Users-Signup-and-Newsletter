import { MagazineForm } from "@/components/MagazineForm"
import { createRevista } from "@/lib/supabase/admin-actions"

export default function NuevaRevistaPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">New Magazine</h1>
      <MagazineForm action={createRevista} />
    </div>
  )
}
