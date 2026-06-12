import { DoctorForm } from "@/components/DoctorForm"
import { createDoctor } from "@/lib/supabase/admin-actions"

export default function NuevoDoctorPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">New Doctor</h1>
      <DoctorForm action={createDoctor} />
    </div>
  )
}
