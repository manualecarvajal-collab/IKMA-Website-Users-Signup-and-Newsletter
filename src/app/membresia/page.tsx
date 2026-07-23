import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import MembershipForm from "./MembershipForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Membership - IKMA",
}

export default async function MembresiaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/registro")

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre_completo")
    .eq("id", user.id)
    .single()

  const fullName = perfil?.nombre_completo ?? ""
  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0] ?? ""
  const lastName = parts.slice(1).join(" ")

  return (
    <MembershipForm
      initialEmail={user.email ?? ""}
      initialFirstName={firstName}
      initialLastName={lastName}
    />
  )
}
