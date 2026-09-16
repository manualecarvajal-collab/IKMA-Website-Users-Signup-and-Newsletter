import { getTranslations } from "next-intl/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getUsuariosEliminados } from "@/lib/supabase/deleted-users"
import {
  ESTADO_ELIMINADO,
  estadoPrevio,
  motivoLabel,
  nombreEliminado,
  snapshotsDeMiembros,
} from "@/lib/deleted-accounts"
import MemberListTable from "./MemberListTable"

export default async function AdminMembersPage() {
  const t = await getTranslations("Admin")
  const admin = await createAdminClient()

  const { data: solicitudes } = await admin
    .from("solicitudes_membresia")
    .select("*")
    .order("created_at", { ascending: false })

  const ids = (solicitudes ?? []).map((s) => s.usuario_id).filter((id): id is string => !!id)
  const { data: perfiles } = ids.length
    ? await admin.from("perfiles").select("id, nombre_completo").in("id", ids)
    : { data: [] }
  const nombreMap = new Map(perfiles?.map((p) => [p.id, p.nombre_completo]) ?? [])

  // Deleting an account cascades its applications away, so an ex-member only
  // survives here through the snapshot. They are shown as rows with the
  // "Deleted" status, so the admin can still see who applied, what they had and
  // whether the account went away by their own decision.
  const eliminados = snapshotsDeMiembros(await getUsuariosEliminados()).map((s) => ({
    id: `eliminado-${s.id}`,
    usuario_id: null,
    tipo_miembro: s.tipo_miembro,
    estado: ESTADO_ELIMINADO,
    region: s.region,
    pais: null,
    metodo_pago: null,
    created_at: s.usuario_created_at ?? s.deleted_at,
    eliminado: {
      nombre: nombreEliminado(s),
      email: s.email,
      motivo: motivoLabel(s),
      cuando: s.deleted_at,
      estadoPrevio: estadoPrevio(s),
      suscripcionCancelada: s.suscripcion_cancelada,
    },
  }))

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Members</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage membership applications
          </p>
        </div>
      </div>

      <MemberListTable
        solicitudes={[...eliminados, ...(solicitudes ?? [])]}
        nombreMap={Object.fromEntries(nombreMap)}
      />
    </div>
  )
}