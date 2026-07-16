import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { deleteVideo, toggleVideoStatus } from "@/lib/supabase/admin-actions"
import { DeleteButton } from "@/components/DeleteButton"
import { ToggleStatus } from "@/components/ToggleStatus"
import { ListFilters } from "@/components/ListFilters"
import { CategoryFilter } from "@/components/CategoryFilter"
import Icon from "@/components/Icon"

export default async function AdminTeachingsPage(props: { searchParams?: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  let query = supabase.from("videos").select("*")

  const status = searchParams?.status
  if (status === "published") query = query.eq("publicado", true)
  else if (status === "draft") query = query.eq("publicado", false)

  const catFilter = searchParams?.categoria
  if (catFilter) query = query.eq("categoria_id", catFilter)

  const sort = searchParams?.sort ?? "newest"
  query = query.order("created_at", { ascending: sort === "oldest" })

  const { data: videos } = await query

  const { data: categorias } = await supabase.from("categorias").select("*").order("nombre", { ascending: true })
  const catMap = new Map((categorias ?? []).map((c: { id: string; nombre: string }) => [c.id, c.nombre]))

  const currentCat = searchParams?.categoria ?? ""

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Teachings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage video library content</p>
        </div>
        <Link
          href="/admin/teachings/nuevo"
          className="w-full sm:w-auto bg-primary text-on-primary font-label-bold text-label-bold px-5 py-2.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors inline-flex items-center justify-center gap-2"
        >
          <Icon name="add" size={14} /> New Video
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <ListFilters />
        <CategoryFilter categorias={categorias ?? []} current={currentCat} />
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4">Title</th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Category</th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden md:table-cell">Embed URL</th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Status</th>
              <th className="text-left font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4 hidden md:table-cell">Date</th>
              <th className="text-right font-label-bold text-label-sm text-on-surface-variant uppercase tracking-wider px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos?.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center font-body-md text-body-md text-on-surface-variant">No videos yet. Create your first one!</td></tr>
            )}
            {(videos as Array<{ id: string; titulo: string; slug: string; embed_url: string; publicado: boolean; created_at: string; categoria_id?: string | null }>)?.map((v) => (
              <tr key={v.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-headline-md text-body-md text-on-surface">{v.titulo}</p>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">/{v.slug}</p>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="font-body-md text-body-md text-on-surface-variant text-sm">{v.categoria_id ? (catMap.get(v.categoria_id) ?? "—") : "—"}</span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="font-body-md text-body-md text-on-surface-variant text-sm truncate block max-w-[200px]">{v.embed_url}</span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <ToggleStatus id={v.id} published={v.publicado} toggleAction={toggleVideoStatus} />
                </td>
                <td className="px-6 py-4 hidden md:table-cell font-body-md text-body-md text-on-surface-variant">
                  {new Date(v.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/teachings/${v.id}/editar`} className="text-primary hover:text-primary-fixed-dim p-1.5"><Icon name="edit" size={18} /></Link>
                    <DeleteButton action={deleteVideo.bind(null, v.id)} label="Video" />
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
