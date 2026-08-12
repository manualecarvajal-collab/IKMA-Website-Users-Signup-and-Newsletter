"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { sendMembershipProcessingEmail, sendStudentWelcomeEmail } from "@/lib/supabase/email-actions"

const TIPOS_VALIDOS = [1, 2, 3, 4]
const REGIONES_VALIDAS = ["A", "B"]

export async function submitStudentMembership(data: {
  region: string
  pais: string
  universidad: string
  carrera: string
  anioIngreso: string
  anioEgreso: string
  telefono: string
  language: string
}): Promise<{ success?: string; error?: string; id?: string }> {
  const region = data.region?.trim()
  const pais = data.pais?.trim()
  const universidad = data.universidad?.trim()
  const carrera = data.carrera?.trim()
  const telefono = data.telefono?.trim()
  const anioIngreso = Number(data.anioIngreso)
  const anioEgreso = Number(data.anioEgreso)

  if (!REGIONES_VALIDAS.includes(region)) return { error: "Invalid region" }
  if (!pais) return { error: "Country of residence is required" }
  if (!universidad) return { error: "University name is required" }
  if (!carrera) return { error: "Career/field of study is required" }
  if (!telefono) return { error: "Phone number is required" }
  if (!anioIngreso || !anioEgreso || anioIngreso > anioEgreso) {
    return { error: "Invalid entry or graduation year" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in to submit a membership application." }

  const adminSupabase = await createAdminClient()

  // Students start "en revision" (pendiente): no access until an admin approves
  const camposSolicitud = {
    tipo_miembro: 3,
    region,
    pais,
    language: data.language || "en",
    universidad,
    carrera,
    anio_ingreso: anioIngreso,
    anio_egreso: anioEgreso,
    telefono,
    estado: "pendiente",
  }

  const { data: existente } = await adminSupabase
    .from("solicitudes_membresia")
    .select("id")
    .eq("usuario_id", user.id)
    .in("estado", ["pendiente", "rechazada"])
    .eq("tipo_miembro", 3)
    .maybeSingle()

  let solicitudId: string
  if (existente) {
    const { data: solicitud, error } = await adminSupabase
      .from("solicitudes_membresia")
      .update(camposSolicitud)
      .eq("id", existente.id)
      .select("id")
      .single()
    if (error) return { error: "Could not submit membership request. Please try again." }
    solicitudId = solicitud.id
  } else {
    const { data: solicitud, error } = await adminSupabase
      .from("solicitudes_membresia")
      .insert({ usuario_id: user.id, ...camposSolicitud })
      .select("id")
      .single()
    if (error) return { error: "Could not submit membership request. Please try again." }
    solicitudId = solicitud.id
  }

  // Welcome email with the review disclaimer, in the user's language
  const lang = data.language === "es" ? "es" : "en"
  const nombre = (user.user_metadata?.nombre_completo as string) || user.email?.split("@")[0] || ""
  await sendStudentWelcomeEmail({ email: user.email ?? "", nombre, lang })

  return { success: "ok", id: solicitudId }
}

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
  nombreCompleto: string
  telefono: string | null
  sitioWeb: string | null
  anioGrado: number | null
  anioResidencia: number | null
  archivoLicenciaUrl: string | null
  consentStatutory: boolean
  metodoPago?: "card" | "zelle" | null
  referenciaZelle?: string | null
}): Promise<{ success?: string; error?: string; id?: string }> {
  // All fields are mandatory — validated server-side (defense in depth)
  if (!TIPOS_VALIDOS.includes(data.tipoMiembro)) return { error: "Invalid member type" }
  if (!REGIONES_VALIDAS.includes(data.region)) return { error: "Invalid region" }
  if (!data.pais?.trim()) return { error: "Country of residence is required" }
  if (!data.nombreCompleto?.trim()) return { error: "Full name is required" }
  if (!data.genero) return { error: "Gender is required" }
  if (!data.direccion?.trim()) return { error: "Address is required" }
  if (!data.ciudad?.trim()) return { error: "City is required" }
  if (!data.codigoPostal?.trim()) return { error: "Postal code is required" }
  if (!data.subgrupoProfesional?.trim()) return { error: "Specialty / specific area is required" }
  if (data.subgrupoProfesional === "Other..." && !data.otraProfesion?.trim()) {
    return { error: "Please specify your profession" }
  }
  if (!data.username?.trim()) return { error: "Username is required" }
  if (!data.telefono?.trim()) return { error: "Phone number is required" }
  if (!data.sitioWeb?.trim()) return { error: "Website is required" }
  if ([1, 2].includes(data.tipoMiembro) && !data.anioGrado) return { error: "Graduation year is required" }
  if (data.tipoMiembro === 2 && !data.anioResidencia) return { error: "Residency year is required" }
  if (data.tipoMiembro === 1 && !data.archivoLicenciaUrl) return { error: "Professional credential file is required" }
  if (!data.consentStatutory) return { error: "Statutory consent is required" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in to submit a membership application." }

  const adminSupabase = await createAdminClient()

  // Student membership (tipo 3) is submitted through submitStudentMembership
  // (manual review). Paid types only start as "incompleta" (card, no payment yet)
  // or "pendiente" (zelle, transfer reference awaiting manual verification).
  const estado = data.metodoPago === "zelle" ? "pendiente" : "incompleta"

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
    metodo_pago: data.metodoPago || null,
    referencia_zelle_email: data.metodoPago === "zelle" ? data.referenciaZelle ?? null : null,
    estado,
  }

  // Users who already paid (awaiting approval) or are approved must not start a
  // new application — it would create a duplicate "incompleta" row.
  const { data: yaProcesada } = await adminSupabase
    .from("solicitudes_membresia")
    .select("id")
    .eq("usuario_id", user.id)
    .in("estado", ["pagada", "aprobada"])
    .eq("tipo_miembro", data.tipoMiembro)
    .maybeSingle()
  if (yaProcesada) {
    return { error: "Your membership application has already been processed." }
  }

  // Reuse existing pending/rejected/incomplete solicitud instead of creating a new one
  const { data: existente } = await adminSupabase
    .from("solicitudes_membresia")
    .select("id")
    .eq("usuario_id", user.id)
    .in("estado", ["pendiente", "rechazada", "incompleta"])
    .eq("tipo_miembro", data.tipoMiembro)
    .maybeSingle()

  // Keep the applicant's real name on the profile (admin panel reads it from here)
  const guardarNombre = () =>
    adminSupabase
      .from("perfiles")
      .update({ nombre_completo: data.nombreCompleto.trim() })
      .eq("id", user.id)

  if (existente) {
    const { data: solicitud, error } = await adminSupabase
      .from("solicitudes_membresia")
      .update(camposSolicitud)
      .eq("id", existente.id)
      .select("id")
      .single()
    if (error) {
      console.error("[membresia-actions] update solicitud error:", error.message)
      return { error: "Could not update membership request. Please try again." }
    }
    await guardarNombre()
    if (data.metodoPago === "zelle") await notificarProcesamiento(user, data.language)
    return { success: "ok", id: solicitud.id }
  }

  const { data: solicitud, error } = await adminSupabase
    .from("solicitudes_membresia")
    .insert({ usuario_id: user.id, ...camposSolicitud })
    .select("id")
    .single()

  if (error) {
    console.error("[membresia-actions] insert solicitud error:", error.message)
    return { error: "Could not submit membership request. Please try again." }
  }
  await guardarNombre()
  if (data.metodoPago === "zelle") await notificarProcesamiento(user, data.language)
  return { success: "ok", id: solicitud.id }
}

async function notificarProcesamiento(user: { email?: string; user_metadata?: { nombre_completo?: string } }, language: string) {
  if (!user.email) return
  const lang = language === "es" ? "es" : "en"
  const nombre = (user.user_metadata?.nombre_completo as string) || user.email.split("@")[0] || ""
  await sendMembershipProcessingEmail({ email: user.email, nombre, lang })
}
