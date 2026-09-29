import { createAdminClient } from "@/lib/supabase/server"
import { getAjustes, getRegistros, getStats } from "@/lib/conferencia-admin"
import ConferenciaPanel from "@/components/admin/ConferenciaPanel"

export const dynamic = "force-dynamic"

/**
 * Panel de la conferencia.
 *
 * No comprueba el rol aquí: estar bajo `src/app/admin/` ya pasa por
 * `src/app/admin/layout.tsx`, que exige `rol === 'administrador'`.
 *
 * `force-dynamic` porque los números de presencia y el listado cambian
 * constantemente: una versión cacheada de este panel sería engañosa.
 *
 * Los errores de lectura se recogen y se pintan en el panel. Antes se
 * devolvía una lista vacía y el panel mostraba "no hay inscritos" cuando en
 * realidad no había podido leerlos.
 */
export default async function AdminConferenciaPage() {
  const admin = await createAdminClient()

  const registros = await getRegistros(admin)
  const stats = await getStats(admin, registros.data)
  const ajustes = await getAjustes(admin)

  const errores = [registros.error, stats.error, ajustes.error].filter(Boolean) as string[]

  return (
    <ConferenciaPanel
      registros={registros.data}
      stats={stats.data}
      ajustes={ajustes.data}
      errores={[...new Set(errores)]}
    />
  )
}
