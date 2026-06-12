import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ArticleForm } from "@/components/ArticleForm"
import { updateArticle } from "@/lib/supabase/admin-actions"

export default async function EditarArticuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: article } = await supabase.from("articulos").select("*").eq("id", id).single()
  if (!article) notFound()

  const updateWithId = updateArticle.bind(null, id)

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Edit Article</h1>
      <ArticleForm action={updateWithId} article={article} />
    </div>
  )
}
