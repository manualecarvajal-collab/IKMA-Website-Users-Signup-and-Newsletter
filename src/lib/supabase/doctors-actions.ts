"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { checkAdmin, registrarActividad } from "@/lib/supabase/admin-helpers"

function doctorFormData(formData: FormData) {
  const parseArray = (val: string | null) =>
    val ? val.split(",").map((s) => s.trim()).filter(Boolean) : []
  const parseJSON = (val: string | null) => {
    if (!val) return []
    try { return JSON.parse(val) } catch { return [] }
  }

  return {
    nombre: formData.get("nombre") as string,
    especialidad_principal: formData.get("especialidad_principal") as string,
    frase: formData.get("frase") as string,
    acerca_de: formData.get("acerca_de") as string,
    imagen_url: formData.get("imagen_url") as string,
    estadisticas: {
      experience: formData.get("stat_experience") as string || "",
      patients: formData.get("stat_patients") as string || "",
      awards: formData.get("stat_awards") as string || "",
      publications: formData.get("stat_publications") as string || "",
    },
    rating: parseFloat(formData.get("rating") as string) || 0,
    num_resenas: parseInt(formData.get("num_resenas") as string) || 0,
    especialidades: parseArray(formData.get("especialidades") as string),
    idiomas: parseArray(formData.get("idiomas") as string),
    disponibilidad: formData.get("disponibilidad") as string,
    hospital: formData.get("hospital") as string,
    direccion: formData.get("direccion") as string,
    experiencia: parseJSON(formData.get("experiencia") as string),
    educacion: parseJSON(formData.get("educacion") as string),
    certificaciones: parseJSON(formData.get("certificaciones") as string),
    premios: parseJSON(formData.get("premios") as string),
    testimonios: parseJSON(formData.get("testimonios") as string),
    publicado: formData.get("publicado") === "on",
  }
}

export async function createDoctor(formData: FormData) {
  const { supabase } = await checkAdmin()
  const data = doctorFormData(formData)
  const nombre = data.nombre
  const { error } = await supabase.from("doctores").insert(data)
  if (error) return { error: error.message }
  await registrarActividad(supabase, "doctor_creado", `Created doctor "${nombre}"`, "doctores", nombre)
  revalidatePath("/admin/doctores")
  revalidatePath("/doctores")
  redirect("/admin/doctores")
}

export async function updateDoctor(id: string, formData: FormData) {
  const { supabase } = await checkAdmin()
  const data = doctorFormData(formData)
  const nombre = data.nombre
  const { error } = await supabase.from("doctores").update(data).eq("id", id)
  if (error) return { error: error.message }
  await registrarActividad(supabase, "doctor_actualizado", `Updated doctor "${nombre}"`, "doctores", id)
  revalidatePath("/admin/doctores")
  revalidatePath("/doctores")
  revalidatePath(`/doctores/${id}`)
  redirect("/admin/doctores")
}

export async function deleteDoctor(id: string, _formData: FormData): Promise<void> {
  const { supabase } = await checkAdmin()
  const { data: doctor } = await supabase.from("doctores").select("nombre").eq("id", id).single()
  await supabase.from("doctores").delete().eq("id", id)
  await registrarActividad(supabase, "doctor_eliminado", `Deleted doctor "${doctor?.nombre || "unknown"}"`, "doctores", id)
  revalidatePath("/admin/doctores")
  revalidatePath("/doctores")
}

export async function toggleDoctorStatus(id: string, publicado: boolean): Promise<void> {
  const { supabase } = await checkAdmin()
  const { data: doctor } = await supabase.from("doctores").select("nombre").eq("id", id).single()
  await supabase.from("doctores").update({ publicado }).eq("id", id)
  const accion = publicado ? "Published" : "Unpublished"
  await registrarActividad(supabase, `doctor_${publicado ? "publicado" : "despublicado"}`, `${accion} doctor "${doctor?.nombre || "unknown"}"`, "doctores", id)
  revalidatePath("/admin/doctores")
  revalidatePath("/doctores")
  revalidatePath(`/doctores/${id}`)
}
