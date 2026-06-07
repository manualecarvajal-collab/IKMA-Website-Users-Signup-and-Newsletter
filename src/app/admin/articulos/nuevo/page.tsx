import { ArticleForm } from "@/components/ArticleForm"
import { createArticle } from "@/lib/supabase/admin-actions"

export default function NuevoArticuloPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">New Article</h1>
      <ArticleForm action={createArticle} />
    </div>
  )
}
