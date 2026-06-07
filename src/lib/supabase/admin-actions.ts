"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single()
  if (perfil?.rol !== "administrador") redirect("/")
  return { supabase, user }
}

// ─── ARTICLES ───────────────────────────────────────────

export async function createArticle(formData: FormData) {
  const { supabase } = await checkAdmin()
  const data = {
    titulo: formData.get("titulo") as string,
    slug: formData.get("slug") as string,
    contenido_html: formData.get("contenido_html") as string,
    resumen: formData.get("resumen") as string,
    categoria: formData.get("categoria") as string,
    imagen_url: formData.get("imagen_url") as string,
    publicado: formData.get("publicado") === "on",
  }
  const { error } = await supabase.from("articulos").insert(data)
  if (error) return { error: error.message }
  revalidatePath("/admin/articulos")
  revalidatePath("/revista")
  redirect("/admin/articulos")
}

export async function updateArticle(id: string, formData: FormData) {
  const { supabase } = await checkAdmin()
  const data = {
    titulo: formData.get("titulo") as string,
    slug: formData.get("slug") as string,
    contenido_html: formData.get("contenido_html") as string,
    resumen: formData.get("resumen") as string,
    categoria: formData.get("categoria") as string,
    imagen_url: formData.get("imagen_url") as string,
    publicado: formData.get("publicado") === "on",
  }
  const { error } = await supabase.from("articulos").update(data).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/articulos")
  revalidatePath("/revista")
  revalidatePath(`/revista/${data.slug}`)
  redirect("/admin/articulos")
}

export async function deleteArticle(id: string, _formData: FormData): Promise<void> {
  const { supabase } = await checkAdmin()
  await supabase.from("articulos").delete().eq("id", id)
  revalidatePath("/admin/articulos")
  revalidatePath("/revista")
}

export async function toggleArticleStatus(id: string, publicado: boolean): Promise<void> {
  const { supabase } = await checkAdmin()
  await supabase.from("articulos").update({ publicado }).eq("id", id)
  revalidatePath("/admin/articulos")
  revalidatePath("/revista")
  revalidatePath(`/revista/*`)
}

// ─── DOCTORS ────────────────────────────────────────────

export async function createDoctor(formData: FormData) {
  const { supabase } = await checkAdmin()
  const parseArray = (val: string | null) =>
    val ? val.split(",").map((s) => s.trim()).filter(Boolean) : []
  const parseJSON = (val: string | null) => {
    if (!val) return []
    try { return JSON.parse(val) } catch { return [] }
  }

  const buildStats = () => ({
    experience: formData.get("stat_experience") as string || "",
    patients: formData.get("stat_patients") as string || "",
    awards: formData.get("stat_awards") as string || "",
    publications: formData.get("stat_publications") as string || "",
  })

  const data = {
    nombre: formData.get("nombre") as string,
    especialidad_principal: formData.get("especialidad_principal") as string,
    frase: formData.get("frase") as string,
    acerca_de: formData.get("acerca_de") as string,
    imagen_url: formData.get("imagen_url") as string,
    estadisticas: buildStats(),
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
  const { error } = await supabase.from("doctores").insert(data)
  if (error) return { error: error.message }
  revalidatePath("/admin/doctores")
  revalidatePath("/doctores")
  redirect("/admin/doctores")
}

export async function updateDoctor(id: string, formData: FormData) {
  const { supabase } = await checkAdmin()
  const parseArray = (val: string | null) =>
    val ? val.split(",").map((s) => s.trim()).filter(Boolean) : []
  const parseJSON = (val: string | null) => {
    if (!val) return []
    try { return JSON.parse(val) } catch { return [] }
  }
  const buildStats = () => ({
    experience: formData.get("stat_experience") as string || "",
    patients: formData.get("stat_patients") as string || "",
    awards: formData.get("stat_awards") as string || "",
    publications: formData.get("stat_publications") as string || "",
  })

  const data = {
    nombre: formData.get("nombre") as string,
    especialidad_principal: formData.get("especialidad_principal") as string,
    frase: formData.get("frase") as string,
    acerca_de: formData.get("acerca_de") as string,
    imagen_url: formData.get("imagen_url") as string,
    estadisticas: buildStats(),
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
  const { error } = await supabase.from("doctores").update(data).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/doctores")
  revalidatePath("/doctores")
  revalidatePath(`/doctores/${id}`)
  redirect("/admin/doctores")
}

export async function deleteDoctor(id: string, _formData: FormData): Promise<void> {
  const { supabase } = await checkAdmin()
  await supabase.from("doctores").delete().eq("id", id)
  revalidatePath("/admin/doctores")
  revalidatePath("/doctores")
}

export async function toggleDoctorStatus(id: string, publicado: boolean): Promise<void> {
  const { supabase } = await checkAdmin()
  await supabase.from("doctores").update({ publicado }).eq("id", id)
  revalidatePath("/admin/doctores")
  revalidatePath("/doctores")
  revalidatePath(`/doctores/${id}`)
}
