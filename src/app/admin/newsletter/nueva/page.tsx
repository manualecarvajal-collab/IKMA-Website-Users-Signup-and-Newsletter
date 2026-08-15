import { getSubscribersWithEmails } from "@/lib/supabase/admin-actions"
import NuevaNewsletterForm from "./NuevaNewsletterForm"

export const dynamic = "force-dynamic"

export default async function NuevaNewsletterPage() {
  const subscribers = await getSubscribersWithEmails()

  return (
    <>
      <NuevaNewsletterForm subscribers={subscribers} />
    </>
  )
}