"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { checkAdmin, registrarActividad } from "@/lib/supabase/admin-helpers"

function fromForm(formData: FormData) {
  return {
    nombre: (formData.get("nombre") as string)?.trim() || "",
    rol_es: (formData.get("rol_es") as string) || null,
    rol_en: (formData.get("rol_en") as string) || null,
    cita_es: (formData.get("cita_es") as string)?.trim() || "",
    cita_en: (formData.get("cita_en") as string)?.trim() || "",
    region: (formData.get("region") as string) || "north-america",
    imagen_url: (formData.get("imagen_url") as string) || null,
    publicado: formData.get("publicado") === "on",
  }
}

export async function createTestimonio(formData: FormData) {
  const { supabase } = await checkAdmin()
  const data = fromForm(formData)
  if (!data.nombre || !data.cita_es || !data.cita_en) return { error: "Name and both quotes are required." }
  const { error } = await supabase.from("testimonios").insert(data)
  if (error) return { error: error.message }
  await registrarActividad(supabase, "testimonio_creado", `Created testimonial "${data.nombre}"`, "testimonios", data.nombre)
  revalidatePath("/admin/testimonios")
  revalidatePath("/testimonios", "layout")
  redirect("/admin/testimonios")
}

export async function updateTestimonio(id: string, formData: FormData) {
  const { supabase } = await checkAdmin()
  const data = fromForm(formData)
  if (!data.nombre || !data.cita_es || !data.cita_en) return { error: "Name and both quotes are required." }
  const { error } = await supabase.from("testimonios").update(data).eq("id", id)
  if (error) return { error: error.message }
  await registrarActividad(supabase, "testimonio_actualizado", `Updated testimonial "${data.nombre}"`, "testimonios", id)
  revalidatePath("/admin/testimonios")
  revalidatePath("/testimonios", "layout")
  redirect("/admin/testimonios")
}

export async function deleteTestimonio(id: string, _formData: FormData): Promise<void> {
  const { supabase } = await checkAdmin()
  const { data: row } = await supabase.from("testimonios").select("nombre").eq("id", id).single()
  await supabase.from("testimonios").delete().eq("id", id)
  await registrarActividad(supabase, "testimonio_eliminado", `Deleted testimonial "${row?.nombre || "unknown"}"`, "testimonios", id)
  revalidatePath("/admin/testimonios")
  revalidatePath("/testimonios", "layout")
}

export async function toggleTestimonioStatus(id: string, publicado: boolean): Promise<void> {
  const { supabase } = await checkAdmin()
  const { data: row } = await supabase.from("testimonios").select("nombre").eq("id", id).single()
  await supabase.from("testimonios").update({ publicado }).eq("id", id)
  await registrarActividad(
    supabase,
    `testimonio_${publicado ? "publicado" : "despublicado"}`,
    `${publicado ? "Published" : "Unpublished"} testimonial "${row?.nombre || "unknown"}"`,
    "testimonios",
    id
  )
  revalidatePath("/admin/testimonios")
  revalidatePath("/testimonios", "layout")
}
