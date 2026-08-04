"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"

const TIPOS_VALIDOS = [1, 2, 3, 4]
const REGIONES_VALIDAS = ["A", "B"]

export async function submitMembership(data: {
  tipoMiembro: number
  region: string
  pais: string
  language: string
  genero: string | null
  direccion: string | null
  ciudad: string | null
  codigoPostal: string | null
  subgrupoProfesional: string | null
  otraProfesion: string | null
  username: string | null
  telefono: string | null
  sitioWeb: string | null
  anioGrado: number | null
  anioResidencia: number | null
  archivoLicenciaUrl: string | null
}) {
  if (!TIPOS_VALIDOS.includes(data.tipoMiembro)) {
    return { error: "Invalid member type" }
  }
  if (!REGIONES_VALIDAS.includes(data.region)) {
    return { error: "Invalid region" }
  }
  // Free membership (tipo 3) has no country requirement
  if (data.tipoMiembro !== 3 && !data.pais?.trim()) {
    return { error: "Country is required" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in to submit a membership application." }

  const adminSupabase = await createAdminClient()

  // Free membership activates immediately; paid types wait for approval/payment
  const esGratis = data.tipoMiembro === 3
  const estado = esGratis ? "aprobada" : "pendiente"

  const activarMembresiaGratis = async () => {
    if (!esGratis) return
    await adminSupabase.from("perfiles").update({ membresia_gratis: true }).eq("id", user.id)
  }

  const camposSolicitud = {
    tipo_miembro: data.tipoMiembro,
    region: data.region,
    pais: data.pais,
    language: data.language,
    genero: data.genero,
    direccion: data.direccion,
    ciudad: data.ciudad,
    codigo_postal: data.codigoPostal,
    subgrupo_profesional: data.subgrupoProfesional,
    otra_profesion: data.otraProfesion,
    username: data.username,
    telefono: data.telefono,
    sitio_web: data.sitioWeb,
    anio_grado: data.anioGrado,
    anio_residencia: data.anioResidencia,
    archivo_licencia_url: data.archivoLicenciaUrl,
    estado,
  }

  // Reuse existing pending/rejected solicitud instead of creating a new one
  const { data: existente } = await adminSupabase
    .from("solicitudes_membresia")
    .select("id")
    .eq("usuario_id", user.id)
    .in("estado", ["pendiente", "rechazada"])
    .maybeSingle()

  if (existente) {
    const { data: solicitud, error } = await adminSupabase
      .from("solicitudes_membresia")
      .update(camposSolicitud)
      .eq("id", existente.id)
      .select("id")
      .single()
    if (error) return { error: "Could not update membership request. Please try again." }
    await activarMembresiaGratis()
    return { success: "ok", id: solicitud.id }
  }

  const { data: solicitud, error } = await adminSupabase
    .from("solicitudes_membresia")
    .insert({ usuario_id: user.id, ...camposSolicitud })
    .select("id")
    .single()

  if (error) return { error: "Could not submit membership request. Please try again." }
  await activarMembresiaGratis()
  return { success: "ok", id: solicitud.id }
}
