import { createAdminClient } from "@/lib/supabase/server"
import { getAjustes, getArticulosBlog, getRegistros, getStats } from "@/lib/conferencia-admin"
import ConferenciaPanel from "@/components/admin/ConferenciaPanel"

export const dynamic = "force-dynamic"

/**
 * Panel de campañas de la conferencia («Bait» / «Carnada»).
 *
 * No comprueba el rol aquí: estar bajo `src/app/admin/` ya pasa por
 * `src/app/admin/layout.tsx`, que exige `rol === 'administrador'`.
 *
 * `force-dynamic` porque el cruce con cuentas y membresías cambia en cuanto
 * alguien se registra o completa una solicitud: una versión cacheada sería
 * engañosa.
 */
export default async function AdminConferenciaPage() {
  const admin = await createAdminClient()

  const registros = await getRegistros(admin)
  const stats = await getStats(registros.data)
  const ajustes = await getAjustes(admin)
  const articulos = await getArticulosBlog(admin)

  const errores = [registros.error, stats.error, ajustes.error, articulos.error].filter(Boolean) as string[]

  return (
    <ConferenciaPanel
      registros={registros.data}
      stats={stats.data}
      ajustes={ajustes.data}
      articulos={articulos.data}
      errores={[...new Set(errores)]}
    />
  )
}
