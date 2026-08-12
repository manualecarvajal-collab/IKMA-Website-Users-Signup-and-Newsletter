import { notFound } from "next/navigation"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { createAdminClient } from "@/lib/supabase/server"
import Icon from "@/components/Icon"
import EditableName from "@/components/EditableName"
import MemberActions from "../MemberActions"

const statusColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  pagada: "bg-blue-100 text-blue-800",
  incompleta: "bg-orange-100 text-orange-800",
}

const memberLabels: Record<number, string> = {
  1: "Licensed Health Professional",
  2: "Resident (Post-graduate)",
  3: "Student",
  4: "Associate (Non-health)",
}

const paymentMethodLabels: Record<string, string> = {
  card: "Card (Stripe)",
  zelle: "Zelle",
}

export default async function MemberDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const t = await getTranslations("Admin")
  const admin = await createAdminClient()

  const { data: solicitud } = await admin
    .from("solicitudes_membresia")
    .select("*")
    .eq("id", id)
    .single()

  if (!solicitud) notFound()

  const { data: { user: authUser } } = await admin.auth.admin.getUserById(solicitud.usuario_id)
  const email = authUser?.email ?? "—"

  const { data: perfil } = await admin
    .from("perfiles")
    .select("nombre_completo, rol")
    .eq("id", solicitud.usuario_id)
    .single()

  const { data: licencia } = solicitud.archivo_licencia_url
    ? await admin.storage.from("membership-licenses").createSignedUrl(solicitud.archivo_licencia_url, 60 * 60 * 24 * 7)
    : { data: null }

  // "metodo_pago" only records the method the applicant CHOSE, not whether they
  // paid. Reflect the real payment state: incomplete = never paid.
  const paymentInfo = (() => {
    if (solicitud.tipo_miembro === 3) return "Free (Student)"
    if (["pagada", "aprobada"].includes(solicitud.estado) && solicitud.metodo_pago) {
      return paymentMethodLabels[solicitud.metodo_pago] || solicitud.metodo_pago
    }
    if (solicitud.estado === "pendiente" && solicitud.metodo_pago === "zelle") {
      return "Zelle — awaiting verification"
    }
    return "No payments yet"
  })()

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl">
      <Link href="/admin/members" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
        <Icon name="arrow_back" size={16} /> Back to Members
      </Link>

      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-outline-variant/20 bg-gradient-to-r from-primary-container/10 to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-on-surface">
                <EditableName userId={solicitud.usuario_id} name={perfil?.nombre_completo ?? ""} />
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">{email}</p>
            </div>
            <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[solicitud.estado]}`}>
              {t(`memberStatuses.${solicitud.estado}`) || solicitud.estado}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <Section title="Membership">
            <Row label="Type" value={memberLabels[solicitud.tipo_miembro] || `Type ${solicitud.tipo_miembro}`} />
            <Row label="Region" value={solicitud.region === "A" ? "A (Latin America, Africa, Asia)" : "B (North America, Europe, Oceania)"} />
            <Row label="Country" value={solicitud.pais} />
            <Row label="Language" value={solicitud.language} />
          </Section>

          <Section title="Professional Information">
            <Row label="Subgroup" value={solicitud.subgrupo_profesional} />
            <Row label="Other Profession" value={solicitud.otra_profesion} />
            <Row label="Year of Degree" value={solicitud.anio_grado?.toString()} />
            <Row label="Year of Residency" value={solicitud.anio_residencia?.toString()} />
          </Section>

          <Section title="Verification Document">
            {licencia?.signedUrl ? (
              <Row label="License / Credential" value={licencia.signedUrl} isFile />
            ) : (
              <p className="text-sm text-on-surface-variant">No document uploaded.</p>
            )}
          </Section>

          <Section title="Payment">
            <Row label="Method" value={paymentInfo} />
            <Row label="Zelle Reference" value={solicitud.referencia_zelle_email} />
          </Section>

          <Section title="Student Information">
            <Row label="University" value={solicitud.universidad} />
            <Row label="Career / Field of Study" value={solicitud.carrera} />
            <Row label="Year of Entry" value={solicitud.anio_ingreso?.toString()} />
            <Row label="Year of Graduation" value={solicitud.anio_egreso?.toString()} />
          </Section>

          <Section title="Personal Details">
            <Row label="Username" value={solicitud.username} />
            <Row label="Gender" value={solicitud.genero} />
            <Row label="Phone" value={solicitud.telefono} />
            <Row label="Website" value={solicitud.sitio_web} />
            <Row label="Address" value={solicitud.direccion} />
            <Row label="City" value={solicitud.ciudad} />
            <Row label="Postal Code" value={solicitud.codigo_postal} />
          </Section>

          <Section title="Timestamps">
            <Row label="Submitted" value={new Date(solicitud.created_at).toLocaleString("en-US")} />
            <Row label="Last Updated" value={new Date(solicitud.updated_at).toLocaleString("en-US")} />
          </Section>

          {["pendiente", "pagada", "incompleta"].includes(solicitud.estado) && (
            <div className="pt-4 border-t border-outline-variant/20 space-y-4">
              {solicitud.estado === "incompleta" && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-900 flex items-start gap-3">
                  <Icon name="info" size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <strong>Incomplete registration — no payment on record.</strong>{" "}
                    This applicant filled the form but never completed the payment step and currently has no membership access. Approving will grant full access; only do so if the member paid outside the system.
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/admin/members/${solicitud.id}/email`}
                  className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold px-6 py-2.5 rounded-xl transition text-sm"
                >
                  <Icon name="mail" size={16} /> Email
                </Link>
                <MemberActions solicitudId={solicitud.id} estado={solicitud.estado} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">{title}</h2>
      <div className="bg-surface-container-low rounded-xl p-4 space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value, isFile }: { label: string; value?: string | null; isFile?: boolean }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-on-surface-variant shrink-0">{label}</span>
      {isFile ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline truncate max-w-[300px] notranslate"
        >
          {value.split("/").pop()?.split("?").shift()}
        </a>
      ) : (
        <span className="text-on-surface font-medium text-right notranslate">{value}</span>
      )}
    </div>
  )
}
