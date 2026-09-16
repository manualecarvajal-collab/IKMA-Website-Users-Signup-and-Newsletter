"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { checkAdmin, registrarActividad, slugify } from "@/lib/supabase/admin-helpers"
import { randomUUID } from "node:crypto"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getEmbedUrls, guardarEmbedUrl } from "@/lib/supabase/video-content"
import { extraerEmbedSrc } from "@/lib/video-embed"

// ─── GROUPS ─────────────────────────────────────────────

export async function getGrupos() {
  const supabase = await createClient()
  const { data } = await supabase.from("grupos").select("*").order("posicion", { ascending: true }).order("created_at", { ascending: true })
  return data ?? []
}

export async function reordenarGrupos(formData: FormData) {
  const { supabase } = await checkAdmin()
  const idsRaw = formData.get("ids") as string
  const ids: string[] = idsRaw ? JSON.parse(idsRaw) : []
  for (let i = 0; i < ids.length; i++) {
    await supabase.from("grupos").update({ posicion: i }).eq("id", ids[i])
  }
  await registrarActividad(supabase, "grupos_reordenados", `Reordered ${ids.length} groups`, "grupos")
  revalidatePath("/admin/teachings")
}

export async function createGrupo(formData: FormData) {
  const { supabase } = await checkAdmin()
  const nombre = formData.get("nombre") as string
  if (!nombre?.trim()) return { error: "Group name is required" }
  const slug = slugify(nombre.trim())
  const gratis = formData.get("gratis") === "on"
  const { data, error } = await supabase.from("grupos").insert({ nombre: nombre.trim(), slug, gratis }).select("id, nombre").single()
  if (error) {
    if (error.code === "23505") return { error: "Group already exists" }
    return { error: error.message }
  }
  await registrarActividad(supabase, "grupo_creado", `Created group "${nombre.trim()}"`, "grupos", data.id)
  revalidatePath("/admin/teachings")
  return { data }
}

export async function updateGrupo(id: string, formData: FormData) {
  const { supabase } = await checkAdmin()
  const nombre = formData.get("nombre") as string
  if (!nombre?.trim()) return { error: "Group name is required" }
  const slug = slugify(nombre.trim())
  const gratis = formData.get("gratis") === "on"
  const { error } = await supabase.from("grupos").update({ nombre: nombre.trim(), slug, gratis }).eq("id", id)
  if (error) return { error: error.message }
  await registrarActividad(supabase, "grupo_actualizado", `Renamed group to "${nombre.trim()}"`, "grupos", id)
  revalidatePath("/admin/teachings")
  revalidatePath(`/admin/teachings/${id}`)
}

export async function getVideosByGrupo(grupoId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("videos")
    .select("id, titulo, slug, descripcion, embed_url, imagen_preview, publicado, gratis, created_at, grupo_id, posicion")
    .eq("grupo_id", grupoId)
    .order("posicion", { ascending: true })
    .order("created_at", { ascending: false })
  const videos = data ?? []

  // El embed vive en `videos_contenido` (no legible por usuarios): el panel lo
  // recupera con el service role para poder mostrarlo y editarlo, y cae a la
  // columna heredada mientras la migración 00045 no esté aplicada.
  const embeds = await getEmbedUrls(videos.map((v) => v.id))
  return videos.map((v) => ({ ...v, embed_url: embeds.get(v.id) ?? v.embed_url ?? null }))
}

export async function reordenarVideos(formData: FormData) {
  const { supabase } = await checkAdmin()
  const grupoId = formData.get("grupo_id") as string
  const idsRaw = formData.get("ids") as string
  const ids: string[] = idsRaw ? JSON.parse(idsRaw) : []
  for (let i = 0; i < ids.length; i++) {
    await supabase.from("videos").update({ posicion: i }).eq("id", ids[i])
  }
  await registrarActividad(supabase, "videos_reordenados", `Reordered ${ids.length} videos in group`, "videos")
  revalidatePath(`/admin/teachings/${grupoId}`)
  revalidatePath(`/teachings`)
}

// ─── VIDEOS ────────────────────────────────────────────

export async function createVideo(formData: FormData) {
  const { supabase } = await checkAdmin()
  const titulo = formData.get("titulo") as string
  const slug = slugify(titulo)
  const grupoId = formData.get("grupo_id") as string
  const embedUrl = extraerEmbedSrc(formData.get("embed_url") as string)
  // `videos` ya no guarda el embed (es legible públicamente): solo metadatos.
  // El id se genera aquí: la política de SELECT solo deja ver videos publicados,
  // así que un insert().select() devolvería cero filas al crear un borrador.
  const videoId = randomUUID()
  const data: Record<string, unknown> = {
    id: videoId,
    titulo,
    slug,
    descripcion: formData.get("descripcion") as string,
    imagen_preview: formData.get("imagen_preview") as string,
    publicado: formData.get("publicado") === "on",
    gratis: formData.get("gratis") === "on",
    grupo_id: grupoId,
  }
  const { error } = await supabase.from("videos").insert(data)
  if (error) return { error: error.message }
  await guardarEmbedUrl(await createAdminClient(), videoId, embedUrl)
  await registrarActividad(supabase, "video_creado", `Created teaching "${titulo}"`, "videos", slug)
  revalidatePath("/admin/teachings")
  revalidatePath("/teachings")
  redirect(`/admin/teachings/${grupoId}`)
}

export async function updateVideo(id: string, formData: FormData) {
  const { supabase } = await checkAdmin()
  const titulo = formData.get("titulo") as string
  const slug = slugify(titulo)
  const grupoId = formData.get("grupo_id") as string
  const embedUrl = extraerEmbedSrc(formData.get("embed_url") as string)
  const data: Record<string, unknown> = {
    titulo,
    slug,
    descripcion: formData.get("descripcion") as string,
    imagen_preview: formData.get("imagen_preview") as string,
    publicado: formData.get("publicado") === "on",
    gratis: formData.get("gratis") === "on",
    grupo_id: grupoId,
  }
  const { error } = await supabase.from("videos").update(data).eq("id", id)
  if (error) return { error: error.message }
  await guardarEmbedUrl(await createAdminClient(), id, embedUrl)
  await registrarActividad(supabase, "video_actualizado", `Updated teaching "${titulo}"`, "videos", slug)
  revalidatePath("/admin/teachings")
  revalidatePath("/teachings")
  revalidatePath(`/teachings/${slug}`)
  redirect(`/admin/teachings/${grupoId}`)
}

export async function deleteVideo(id: string, _formData: FormData): Promise<void> {
  const { supabase } = await checkAdmin()
  const { data: video } = await supabase.from("videos").select("titulo, grupo_id").eq("id", id).single()
  await supabase.from("videos").delete().eq("id", id)
  await registrarActividad(supabase, "video_eliminado", `Deleted teaching "${video?.titulo || "unknown"}"`, "videos", id)
  revalidatePath("/admin/teachings")
  if (video?.grupo_id) revalidatePath(`/admin/teachings/${video.grupo_id}`)
  revalidatePath("/teachings")
}

export async function toggleVideoStatus(id: string, publicado: boolean): Promise<void> {
  const { supabase } = await checkAdmin()
  const { data: video } = await supabase.from("videos").select("titulo, grupo_id").eq("id", id).single()
  await supabase.from("videos").update({ publicado }).eq("id", id)
  const accion = publicado ? "Published" : "Unpublished"
  await registrarActividad(supabase, `video_${publicado ? "publicado" : "despublicado"}`, `${accion} teaching "${video?.titulo || "unknown"}"`, "videos", id)
  revalidatePath("/admin/teachings")
  if (video?.grupo_id) revalidatePath(`/admin/teachings/${video.grupo_id}`)
  revalidatePath("/teachings")
}
