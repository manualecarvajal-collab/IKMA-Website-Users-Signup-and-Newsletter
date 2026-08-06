"use server"

import { revalidatePath } from "next/cache"
import { checkAdmin, registrarActividad } from "@/lib/supabase/admin-helpers"
import { createAdminClient } from "@/lib/supabase/server"

export async function approveMembership(id: string): Promise<void> {
  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()
  const { data: solicitud } = await admin
    .from("solicitudes_membresia")
    .select("usuario_id, tipo_miembro")
    .eq("id", id)
    .single()
  await admin.from("solicitudes_membresia").update({ estado: "aprobada" }).eq("id", id)
  if (solicitud?.usuario_id) {
    if (solicitud.tipo_miembro === 3) {
      // Student: activates the free plan, NOT the paid subscription
      await admin.from("perfiles").update({ membresia_gratis: true }).eq("id", solicitud.usuario_id)
    } else {
      await admin.from("perfiles").update({ suscripcion_activa: true }).eq("id", solicitud.usuario_id)
    }
  }
  await registrarActividad(supabase, "membresia_aprobada", `Membership ${id.slice(0, 8)} approved`, "solicitudes_membresia", id)
  revalidatePath("/admin/members")
}

export async function rejectMembership(id: string): Promise<void> {
  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()
  const { data: solicitud } = await admin
    .from("solicitudes_membresia")
    .select("usuario_id, tipo_miembro")
    .eq("id", id)
    .single()
  await admin.from("solicitudes_membresia").update({ estado: "rechazada" }).eq("id", id)
  // Revoke free/student access when an approved student application is denied
  if (solicitud?.usuario_id && solicitud.tipo_miembro === 3) {
    await admin.from("perfiles").update({ membresia_gratis: false }).eq("id", solicitud.usuario_id)
  }
  await registrarActividad(supabase, "membresia_rechazada", `Membership ${id.slice(0, 8)} rejected`, "solicitudes_membresia", id)
  revalidatePath("/admin/members")
}

export async function deleteMembership(id: string): Promise<void> {
  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()
  await admin.from("solicitudes_membresia").delete().eq("id", id)
  await registrarActividad(supabase, "membresia_eliminada", `Membership ${id.slice(0, 8)} deleted`, "solicitudes_membresia", id)
  revalidatePath("/admin/members")
}
