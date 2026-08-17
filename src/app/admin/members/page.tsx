import { getTranslations } from "next-intl/server"
import { createAdminClient } from "@/lib/supabase/server"
import MemberListTable from "./MemberListTable"

export default async function AdminMembersPage() {
  const t = await getTranslations("Admin")
  const admin = await createAdminClient()

  const { data: solicitudes } = await admin
    .from("solicitudes_membresia")
    .select("*")
    .order("created_at", { ascending: false })

  const ids = solicitudes?.map((s) => s.usuario_id) || []
  const { data: perfiles } = ids.length
    ? await admin.from("perfiles").select("id, nombre_completo").in("id", ids)
    : { data: [] }
  const nombreMap = new Map(perfiles?.map((p) => [p.id, p.nombre_completo]) ?? [])

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
        solicitudes={solicitudes ?? []}
        nombreMap={Object.fromEntries(nombreMap)}
      />
    </div>
  )
}