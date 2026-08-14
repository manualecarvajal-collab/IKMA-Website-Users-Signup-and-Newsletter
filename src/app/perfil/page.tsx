import { getLocale, getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { getMembershipPayments } from "@/lib/stripe/membership"
import PerfilForms from "./PerfilForms"
import MembershipEditForm from "./MembershipEditForm"
import { cancelMembership, deleteAccount } from "@/lib/supabase/profile-actions"
import Link from "next/link"
import Icon from "@/components/Icon"

const memberTypeNames = {
  1: "type1",
  2: "type2",
  3: "type3",
  4: "type4",
} as const

const estadoKeys: Record<string, string> = {
  pendiente: "statusPending",
  aprobada: "statusApproved",
  rechazada: "statusRejected",
  pagada: "statusPaid",
  incompleta: "statusIncomplete",
}

export default async function PerfilPage() {
  const locale = await getLocale()
  const t = await getTranslations("Perfil")
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre_completo, rol, suscripcion_activa, membresia_gratis, stripe_customer_id")
    .eq("id", user.id)
    .single()

  const { data: solicitud } = await supabase
    .from("solicitudes_membresia")
    .select("tipo_miembro, region, estado, pais")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const payments = perfil?.stripe_customer_id
    ? await getMembershipPayments(perfil.stripe_customer_id)
    : null

  const fmtDate = (ts: number | null) =>
    ts
      ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(
          new Date(ts * 1000)
        )
      : "—"
  const fmtMoney = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100)

  const memberActive = !!perfil?.suscripcion_activa || !!perfil?.membresia_gratis
  const typeKey = solicitud?.tipo_miembro ? memberTypeNames[solicitud.tipo_miembro as 1 | 2 | 3 | 4] : null
  const estadoKey = solicitud?.estado ? estadoKeys[solicitud.estado] ?? null : null

  return (
    <section className="py-section-padding">
      <div className="max-w-6xl mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Header */}
        <header className="mb-8 md:mb-10 flex items-center gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-lg text-headline-md shrink-0">
            {(perfil?.nombre_completo || user.email || "?").trim().charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-headline-lg text-headline-md text-primary truncate">
              {perfil?.nombre_completo || t("pageTitle")}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant truncate">{user.email}</p>
          </div>
          {memberActive && (
            <span className="hidden md:inline-flex items-center gap-1.5 bg-tertiary-fixed-dim text-on-primary-fixed-variant font-label-bold text-label-bold px-4 py-2 rounded-full shrink-0">
              <Icon name="check_circle" size={16} />
              {t("activeMember")}
            </span>
          )}
        </header>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main column: forms */}
          <div className="lg:col-span-2 space-y-8">
            <PerfilForms initialNombre={perfil?.nombre_completo ?? ""} email={user.email ?? ""} />
          </div>

          {/* Sidebar: membership + payments + danger */}
          <aside className="space-y-8 lg:sticky lg:top-28">
            {/* Membership */}
            <div className="bg-surface rounded-xl p-6 md:p-8 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
              <h2 className="font-headline-lg text-headline-sm text-primary mb-4">{t("membership")}</h2>

          {memberActive && solicitud ? (
            <div className="space-y-3">
              <InfoRow label={t("memberType")} value={typeKey ? t(typeKey) : "—"} />
              {solicitud.region && (
                <InfoRow
                  label={t("region")}
                  value={solicitud.region === "A" ? t("regionA") : t("regionB")}
                />
              )}
              <InfoRow label={t("country")} value={solicitud.pais ?? "—"} />
              {estadoKey && <InfoRow label={t("status")} value={t(estadoKey)} />}

              <MembershipEditForm
                initial={{ tipoMiembro: solicitud.tipo_miembro, region: solicitud.region, pais: solicitud.pais ?? "" }}
              />

              {payments?.subscription?.status === "active" && (
                <>
                  {payments.nextChargeDate && (
                    <InfoRow label={t("nextCharge")} value={fmtDate(payments.nextChargeDate)} />
                  )}
                  <form action={cancelMembership} className="pt-3">
                    <button
                      type="submit"
                      className="bg-white border border-error text-error font-label-bold text-label-bold py-3 px-6 rounded-lg hover:bg-error hover:text-white transition-all cursor-pointer"
                    >
                      {t("cancelMembership")}
                    </button>
                  </form>
                </>
              )}

              {payments?.subscription && payments.subscription.status !== "active" && (
                <p className="font-body-md text-body-md text-on-surface-variant">{t("membershipInactive")}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">{t("notMemberYet")}</p>
              <Link
                href="/membresia"
                className="inline-block bg-primary text-on-primary font-label-bold text-label-bold py-3.5 px-8 rounded-lg hover:bg-primary/90 transition-all"
              >
                {t("becomeMemberCta")}
              </Link>
            </div>
          )}
        </div>

        {/* Payments / cuotas */}
        {payments && (payments.paid.length > 0 || payments.open.length > 0) && (
          <div className="bg-surface rounded-xl p-6 md:p-8 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
            <h2 className="font-headline-lg text-headline-sm text-primary mb-4">{t("payments")}</h2>

            {payments.paid.length > 0 && (
              <div className="space-y-2 mb-6">
                <h3 className="font-label-bold text-label-bold text-on-surface-variant">{t("paidTitle")}</h3>
                {payments.paid.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 border border-outline-variant/20 rounded-lg px-4 py-3">
                    <Icon name="check_circle" size={20} className="text-green-600" />
                    <span className="font-body-md text-body-md flex-1">{fmtDate(p.created)}</span>
                    <span className="font-label-bold text-label-bold">{fmtMoney(p.amountPaid, p.currency)}</span>
                  </div>
                ))}
              </div>
            )}

            {payments.open.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-label-bold text-label-bold text-on-surface-variant">{t("unpaidTitle")}</h3>
                {payments.open.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 border border-error/30 rounded-lg px-4 py-3">
                    <Icon name="error" size={20} className="text-error" />
                    <span className="font-body-md text-body-md flex-1">
                      {t("due")}: {fmtDate(p.created)}
                    </span>
                    <span className="font-label-bold text-label-bold">{fmtMoney(p.amountDue, p.currency)}</span>
                  </div>
                ))}
              </div>
            )}

            {payments.nextChargeDate && (
              <p className="font-body-md text-body-md text-on-surface-variant mt-6">
                {t("nextCharge")}: {fmtDate(payments.nextChargeDate)}
              </p>
            )}
          </div>
        )}

        {/* Danger zone */}
        <div className="bg-surface rounded-xl p-6 md:p-8 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-error/30">
          <h2 className="font-headline-lg text-headline-sm text-error mb-2">{t("dangerZone")}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">{t("dangerZoneDesc")}</p>
          <form action={deleteAccount}>
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input type="checkbox" required className="mt-1 accent-error" />
              <span className="font-body-md text-body-md text-on-surface-variant">{t("deleteConfirm")}</span>
            </label>
            <button
              type="submit"
              className="w-full bg-error text-white font-label-bold text-label-bold py-3 px-6 rounded-lg hover:bg-error/90 transition-all cursor-pointer"
            >
              {t("deleteAccount")}
            </button>
          </form>
        </div>
        </aside>
        </div>
      </div>
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-outline-variant/20 pb-3">
      <span className="font-body-md text-body-md text-on-surface-variant">{label}</span>
      <span className="font-label-bold text-label-bold text-right">{value}</span>
    </div>
  )
}