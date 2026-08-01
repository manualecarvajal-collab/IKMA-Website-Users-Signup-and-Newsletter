"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { checkAdmin, registrarActividad, slugify } from "@/lib/supabase/admin-helpers"

function articleFormData(formData: FormData) {
  const titulo_en = formData.get("titulo") as string | null
  const titulo_es = formData.get("titulo_es") as string | null

  // Only include fields that were actually submitted in the form
  const data: Record<string, unknown> = {}

  if (formData.has("titulo")) {
    data.titulo = titulo_en ?? ""
    data.slug = slugify(data.titulo as string)
  }
  if (formData.has("contenido_html")) data.contenido_html = formData.get("contenido_html") as string
  if (formData.has("resumen")) data.resumen = formData.get("resumen") as string
  if (formData.has("titulo_es")) {
    data.titulo_es = titulo_es
    // If English title wasn't submitted but Spanish was, use Spanish for slug
    if (!formData.has("titulo") && titulo_es) {
      data.slug = slugify(titulo_es)
    }
  }
  if (formData.has("contenido_html_es")) data.contenido_html_es = formData.get("contenido_html_es") as string
  if (formData.has("resumen_es")) data.resumen_es = formData.get("resumen_es") as string
  if (formData.has("imagen_url")) data.imagen_url = formData.get("imagen_url") as string
  if (formData.has("autor_nombre")) data.autor_nombre = formData.get("autor_nombre") as string
  if (formData.has("autor_avatar_url")) data.autor_avatar_url = formData.get("autor_avatar_url") as string
  // Always read publicado — browsers omit unchecked checkboxes, so has() won't work
  data.publicado = formData.get("publicado") === "on"

  return data
}

export async function createArticle(formData: FormData) {
  const { supabase } = await checkAdmin()
  const data = articleFormData(formData)
  // Fall back to Spanish title as main if English wasn't submitted
  if (!data.titulo && data.titulo_es) {
    data.titulo = data.titulo_es
  }
  if (!data.titulo) return { error: "Title is required (English or Spanish)" }

  const { error } = await supabase.from("articulos").insert(data)
  if (error) return { error: error.message }
  await registrarActividad(supabase, "articulo_creado", `Created article "${data.titulo}"`, "articulos", data.slug as string)
  revalidatePath("/admin/articulos")
  revalidatePath("/revista")
  redirect("/admin/articulos")
}

export async function updateArticle(id: string, formData: FormData) {
  const { supabase } = await checkAdmin()
  const data = articleFormData(formData)
  if (!data.titulo && !data.titulo_es) return { error: "At least one title is required" }

  // Must have a slug — use whichever title is available
  if (!data.slug && data.titulo_es) data.slug = slugify(data.titulo_es as string)

  if (Object.keys(data).length === 0) return { error: "No fields to update" }

  const { error } = await supabase.from("articulos").update(data).eq("id", id)
  if (error) return { error: error.message }
  await registrarActividad(supabase, "articulo_actualizado", `Updated article "${data.titulo || "[Spanish]"}"`, "articulos", id)
  revalidatePath("/admin/articulos")
  revalidatePath("/revista")
  redirect("/admin/articulos")
}

export async function deleteArticle(id: string, _formData: FormData): Promise<void> {
  const { supabase } = await checkAdmin()
  // Fetch title before deleting for the activity log
  const { data: articulo } = await supabase.from("articulos").select("titulo").eq("id", id).single()
  await supabase.from("articulos").delete().eq("id", id)
  await registrarActividad(supabase, "articulo_eliminado", `Deleted article "${articulo?.titulo || "unknown"}"`, "articulos", id)
  revalidatePath("/admin/articulos")
  revalidatePath("/revista")
}

export async function toggleArticleStatus(id: string, publicado: boolean): Promise<void> {
  const { supabase } = await checkAdmin()
  const { data: articulo } = await supabase.from("articulos").select("titulo").eq("id", id).single()
  await supabase.from("articulos").update({ publicado }).eq("id", id)
  const accion = publicado ? "Published" : "Unpublished"
  await registrarActividad(supabase, `articulo_${publicado ? "publicado" : "despublicado"}`, `${accion} article "${articulo?.titulo || "unknown"}"`, "articulos", id)
  revalidatePath("/admin/articulos")
  revalidatePath("/revista")
  revalidatePath(`/revista/*`)
}
