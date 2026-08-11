import { notFound } from "next/navigation"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { createAdminClient } from "@/lib/supabase/server"
import Icon from "@/components/Icon"
import MemberEmailForm from "./form"

export default async function MemberEmailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const t = await getTranslations("Admin")
  const admin = await createAdminClient()

  const { data: solicitud } = await admin
    .from("solicitudes_membresia")
    .select("id, usuario_id, language")
    .eq("id", id)
    .single()

  if (!solicitud) notFound()

  const { data: { user } } = await admin.auth.admin.getUserById(solicitud.usuario_id)
  const email = user?.email
  if (!email) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto text-center py-24">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">{t("memberEmailNoEmail")}</h1>
      </div>
    )
  }
  const nombre = (user.user_metadata?.nombre_completo as string) || email.split("@")[0] || ""

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <Link href={`/admin/members/${id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
        <Icon name="arrow_back" size={16} /> {t("memberEmailBack")}
      </Link>
      <h1 className="font-headline-lg text-headline-lg text-primary mb-2">{t("memberEmailTitle")}</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mb-8">
        <span className="notranslate">{nombre}</span> — <span className="notranslate">{email}</span>
      </p>

      <MemberEmailForm solicitudId={solicitud.id} nombre={nombre} lang={solicitud.language === "es" ? "es" : "en"} />
    </div>
  )
}
