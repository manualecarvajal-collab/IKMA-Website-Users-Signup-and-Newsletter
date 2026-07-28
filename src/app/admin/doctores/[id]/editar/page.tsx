import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DoctorForm } from "@/components/DoctorForm"
import { updateDoctor } from "@/lib/supabase/admin-actions"
import { getTranslations } from "next-intl/server"

export default async function EditarDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations("Admin")
  const { id } = await params
  const supabase = await createClient()
  const { data: doctor } = await supabase.from("doctores").select("*").eq("id", id).single()
  if (!doctor) notFound()

  const updateWithId = updateDoctor.bind(null, id)

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">{t("doctors")} — {t("edit")}</h1>
      <DoctorForm action={updateWithId} doctor={doctor} />
    </div>
  )
}
