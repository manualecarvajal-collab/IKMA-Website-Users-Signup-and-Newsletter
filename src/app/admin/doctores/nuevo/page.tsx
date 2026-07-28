import { DoctorForm } from "@/components/DoctorForm"
import { createDoctor } from "@/lib/supabase/admin-actions"
import { getTranslations } from "next-intl/server"

export default async function NuevoDoctorPage() {
  const t = await getTranslations("Admin")
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">{t("newDoctor")}</h1>
      <DoctorForm action={createDoctor} />
    </div>
  )
}
