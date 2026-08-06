import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import StudentForm from "./StudentForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Student Membership - IKMA",
}

export default async function EstudiantePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/registro?tipo=3")

  const { data: solicitud } = await supabase
    .from("solicitudes_membresia")
    .select("estado")
    .eq("usuario_id", user.id)
    .eq("tipo_miembro", 3)
    .maybeSingle()

  if (solicitud?.estado === "aprobada") redirect("/")
  if (solicitud?.estado === "pendiente") redirect("/membresia/estudiante/gracias")

  return <StudentForm />
}
