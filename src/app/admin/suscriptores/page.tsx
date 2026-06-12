import { getAllUsers } from "@/lib/supabase/admin-actions"
import UserManagementTable from "@/components/UserManagementTable"

export const dynamic = "force-dynamic"

export default async function AdminSuscriptoresPage() {
  const users = await getAllUsers()

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-primary">User Management</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          View all registered users and manage their subscription status.
        </p>
      </div>

      <UserManagementTable initialUsers={users} />
    </div>
  )
}
