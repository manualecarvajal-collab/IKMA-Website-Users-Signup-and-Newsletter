"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { checkAdmin, registrarActividad } from "@/lib/supabase/admin-helpers"

export async function createRevista(formData: FormData) {
  const { supabase } = await checkAdmin()
  const titulo = formData.get("titulo") as string
  const data = {
    titulo,
    descripcion: formData.get("descripcion") as string,
    archivo_url: formData.get("archivo_url") as string,
    imagen_portada: formData.get("imagen_portada") as string,
    publicado: formData.get("publicado") === "on",
  }
  const { error } = await supabase.from("revistas").insert(data)
  if (error) return { error: error.message }
  await registrarActividad(supabase, "revista_creada", `Created magazine "${titulo}"`, "revistas", titulo)
  revalidatePath("/admin/revistas")
  revalidatePath("/revista", "layout")
  redirect("/admin/revistas")
}

export async function updateRevista(id: string, formData: FormData) {
  const { supabase } = await checkAdmin()
  const titulo = formData.get("titulo") as string
  const data = {
    titulo,
    descripcion: formData.get("descripcion") as string,
    archivo_url: formData.get("archivo_url") as string,
    imagen_portada: formData.get("imagen_portada") as string,
    publicado: formData.get("publicado") === "on",
  }
  const { error } = await supabase.from("revistas").update(data).eq("id", id)
  if (error) return { error: error.message }
  await registrarActividad(supabase, "revista_actualizada", `Updated magazine "${titulo}"`, "revistas", id)
  revalidatePath("/admin/revistas")
  revalidatePath("/revista", "layout")
  redirect("/admin/revistas")
}

export async function deleteRevista(id: string, _formData: FormData): Promise<void> {
  const { supabase } = await checkAdmin()
  const { data: revista } = await supabase.from("revistas").select("titulo").eq("id", id).single()
  await supabase.from("revistas").delete().eq("id", id)
  await registrarActividad(supabase, "revista_eliminada", `Deleted magazine "${revista?.titulo || "unknown"}"`, "revistas", id)
  revalidatePath("/admin/revistas")
  revalidatePath("/revista", "layout")
}

export async function toggleRevistaStatus(id: string, publicado: boolean): Promise<void> {
  const { supabase } = await checkAdmin()
  const { data: revista } = await supabase.from("revistas").select("titulo").eq("id", id).single()
  await supabase.from("revistas").update({ publicado }).eq("id", id)
  const accion = publicado ? "Published" : "Unpublished"
  await registrarActividad(supabase, `revista_${publicado ? "publicada" : "despublicada"}`, `${accion} magazine "${revista?.titulo || "unknown"}"`, "revistas", id)
  revalidatePath("/admin/revistas")
  revalidatePath("/revista", "layout")
}
