import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { grantFreeMembership } from "@/lib/supabase/membresia-actions"
import MembershipForm from "./MembershipForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Membership - IKMA",
}

const TIPOS_VALIDOS = [1, 2, 3, 4]
const REGIONES_VALIDAS = ["A", "B"]

export default async function MembresiaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; region?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const params = await searchParams
  const tipo = TIPOS_VALIDOS.includes(Number(params.tipo)) ? Number(params.tipo) : null
  const region = REGIONES_VALIDAS.includes(params.region ?? "") ? (params.region as string) : null

  // Free membership chosen before registering: grant it and land on the homepage
  if (tipo === 3) {
    if (!user) redirect(`/registro?tipo=3&region=${region ?? "A"}`)
    await grantFreeMembership(user.id)
    redirect("/")
  }

  let fullName = ""
  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("nombre_completo")
      .eq("id", user.id)
      .single()
    fullName = perfil?.nombre_completo ?? ""
  }

  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0] ?? ""
  const lastName = parts.slice(1).join(" ")

  return (
    <MembershipForm
      initialEmail={user?.email ?? ""}
      initialFirstName={firstName}
      initialLastName={lastName}
      initialMemberType={tipo ?? undefined}
      initialRegion={region ?? undefined}
      isAuthenticated={!!user}
    />
  )
}
