import { getAllRecipients } from "@/lib/supabase/admin-actions"
import NuevaNewsletterForm from "./NuevaNewsletterForm"

export const dynamic = "force-dynamic"

export default async function NuevaNewsletterPage() {
  const recipients = await getAllRecipients()

  return (
    <>
      <NuevaNewsletterForm recipients={recipients} />
    </>
  )
}