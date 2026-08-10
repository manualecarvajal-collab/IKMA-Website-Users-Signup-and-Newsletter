import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
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
  searchParams: Promise<{ tipo?: string; region?: string; step?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const params = await searchParams
  const tipo = TIPOS_VALIDOS.includes(Number(params.tipo)) ? Number(params.tipo) : null
  const region = REGIONES_VALIDAS.includes(params.region ?? "") ? (params.region as string) : null
  const startFormStep = (params.step === "2" || params.step === "3") && !!user

  // Student membership (tipo 3) uses its own application form with manual review
  if (tipo === 3) redirect("/membresia/estudiante")

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
      initialStep={startFormStep ? Number(params.step) : 1}
    />
  )
}
