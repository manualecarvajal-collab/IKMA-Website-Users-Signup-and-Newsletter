import { notFound } from "next/navigation"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { createAdminClient } from "@/lib/supabase/server"
import Icon from "@/components/Icon"
import MemberEmailHistory, { type MemberMessage } from "./MemberEmailHistory"

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

  const { data: mensajes } = await admin
    .from("mensajes_miembro")
    .select("id, direccion, asunto, contenido, es_html, de, para, created_at")
    .eq("solicitud_id", solicitud.id)
    .order("created_at", { ascending: false })
  const lista: MemberMessage[] = (mensajes ?? []) as MemberMessage[]

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <Link href={`/admin/members/${id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
        <Icon name="arrow_back" size={16} /> {t("memberEmailBack")}
      </Link>
      <p className="font-body-md text-body-md text-on-surface-variant mb-8">
        <span className="notranslate">{nombre}</span> — <span className="notranslate">{email}</span>
      </p>

      <MemberEmailHistory
        solicitudId={solicitud.id}
        nombre={nombre}
        lang={solicitud.language === "es" ? "es" : "en"}
        initialEnviados={lista.filter((m) => m.direccion === "enviado")}
      />
    </div>
  )
}
