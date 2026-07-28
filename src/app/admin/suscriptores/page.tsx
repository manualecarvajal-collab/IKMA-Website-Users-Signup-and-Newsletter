import { getAllUsers } from "@/lib/supabase/admin-actions"
import UserManagementTable from "@/components/UserManagementTable"
import { getTranslations } from "next-intl/server"

export const dynamic = "force-dynamic"

export default async function AdminSuscriptoresPage() {
  const t = await getTranslations("Admin")
  const users = await getAllUsers()

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-primary">{t("userManagement")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {t("userManagementDesc")}
        </p>
      </div>

      <UserManagementTable initialUsers={users} />
    </div>
  )
}
