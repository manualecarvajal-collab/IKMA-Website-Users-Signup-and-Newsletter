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
  // Professionals (1) and residents (2) must pick their graduation year before
  // the payment step, so deep links never skip past step 2 for them.
  const maxStep = tipo === 1 || tipo === 2 ? 2 : 4
  const requestedStep = Number(params.step)
  const isDeepLink = params.step === "2" || params.step === "3" ? !!user : params.step === "4"
  const startFormStep = isDeepLink && Number.isInteger(requestedStep)
  const initialStep = startFormStep ? Math.min(requestedStep, maxStep) : 1

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
      initialStep={initialStep}
    />
  )
}
