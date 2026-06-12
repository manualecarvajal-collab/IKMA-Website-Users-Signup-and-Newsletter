import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { deleteRevista, toggleRevistaStatus, getSubscribersWithEmails } from "@/lib/supabase/admin-actions"
import { DeleteButton } from "@/components/DeleteButton"
import { ToggleStatus } from "@/components/ToggleStatus"
import { ListFilters } from "@/components/ListFilters"
import SendMagazineButton from "@/components/SendMagazineButton"

export default async function AdminRevistasPage(props: { searchParams?: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  
  const subscribers = await getSubscribersWithEmails()

  let query = supabase.from("revistas").select("*")

  const status = searchParams?.status
  if (status === "published") query = query.eq("publicado", true)
  else if (status === "draft") query = query.eq("publicado", false)

  const sort = searchParams?.sort ?? "newest"
  query = query.order("created_at", { ascending: sort === "oldest" })

  const { data: revistas } = await query

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Magazines</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage PDF magazines and newsletters</p>
        </div>
        <Link
          href="/admin/revistas/nuevo"
          className="w-full sm:w-auto bg-primary text-on-primary font-label-bold text-label-bold px-5 py-2.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors inline-flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span> New Magazine
        </Link>
      </div>

      <div className="mb-4">
        <ListFilters />
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4">Title</th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Status</th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden md:table-cell">Date</th>
              <th className="text-right font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {revistas?.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center font-body-md text-body-md text-on-surface-variant">No magazines yet. Create your first one!</td></tr>
            )}
            {revistas?.map((r) => (
              <tr key={r.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {r.imagen_portada && (
                      <div className="w-10 h-12 rounded overflow-hidden bg-surface-variant flex-shrink-0">
                        <img src={r.imagen_portada} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-headline-md text-body-md text-on-surface">{r.titulo}</p>
                      {r.descripcion && (
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-0.5 line-clamp-1">{r.descripcion}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <ToggleStatus id={r.id} published={r.publicado} toggleAction={toggleRevistaStatus} />
                </td>
                <td className="px-6 py-4 hidden md:table-cell font-body-md text-body-md text-on-surface-variant">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <SendMagazineButton
                      revistaId={r.id}
                      revistaTitulo={r.titulo}
                      subscribers={subscribers}
                    />
                    <Link href={`/admin/revistas/${r.id}/editar`} className="text-primary hover:text-primary-fixed-dim p-1.5">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </Link>
                    <DeleteButton action={deleteRevista.bind(null, r.id)} label="Magazine" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
