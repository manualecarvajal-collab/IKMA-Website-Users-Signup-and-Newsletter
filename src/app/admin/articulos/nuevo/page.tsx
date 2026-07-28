import { ArticleForm } from "@/components/ArticleForm"
import { createArticle } from "@/lib/supabase/admin-actions"
import { getTranslations } from "next-intl/server"

export default async function NuevoArticuloPage() {
  const t = await getTranslations("Admin")
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">{t("newArticle")}</h1>
      <ArticleForm action={createArticle} />
    </div>
  )
}
