import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CrearContrasenaForm from "./CrearContrasenaForm"

export default async function CrearContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()
  if (error || !userData.user) {
    redirect("/login")
  }

  return <CrearContrasenaForm email={email ?? userData.user.email ?? ""} />
}
