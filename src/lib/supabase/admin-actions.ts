"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { buildMagazineHtml, buildNewsletterHtml } from "@/lib/email-template"

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

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
    .trim()
}

export async function createArticle(formData: FormData) {
  const { supabase } = await checkAdmin()
  const titulo = formData.get("titulo") as string
  const data = {
    titulo,
    slug: slugify(titulo),
    contenido_html: formData.get("contenido_html") as string,
    resumen: formData.get("resumen") as string,
    imagen_url: formData.get("imagen_url") as string,
    autor_nombre: formData.get("autor_nombre") as string,
    autor_avatar_url: formData.get("autor_avatar_url") as string,
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
  const titulo = formData.get("titulo") as string
  const data = {
    titulo,
    slug: slugify(titulo),
    contenido_html: formData.get("contenido_html") as string,
    resumen: formData.get("resumen") as string,
    imagen_url: formData.get("imagen_url") as string,
    autor_nombre: formData.get("autor_nombre") as string,
    autor_avatar_url: formData.get("autor_avatar_url") as string,
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

// ─── MAGAZINES ─────────────────────────────────────────

export async function createRevista(formData: FormData) {
  const { supabase } = await checkAdmin()
  const data = {
    titulo: formData.get("titulo") as string,
    descripcion: formData.get("descripcion") as string,
    archivo_url: formData.get("archivo_url") as string,
    imagen_portada: formData.get("imagen_portada") as string,
    publicado: formData.get("publicado") === "on",
  }
  const { error } = await supabase.from("revistas").insert(data)
  if (error) return { error: error.message }
  revalidatePath("/admin/revistas")
  revalidatePath("/revista", "layout")
  redirect("/admin/revistas")
}

export async function updateRevista(id: string, formData: FormData) {
  const { supabase } = await checkAdmin()
  const data = {
    titulo: formData.get("titulo") as string,
    descripcion: formData.get("descripcion") as string,
    archivo_url: formData.get("archivo_url") as string,
    imagen_portada: formData.get("imagen_portada") as string,
    publicado: formData.get("publicado") === "on",
  }
  const { error } = await supabase.from("revistas").update(data).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/revistas")
  revalidatePath("/revista", "layout")
  redirect("/admin/revistas")
}

export async function deleteRevista(id: string, _formData: FormData): Promise<void> {
  const { supabase } = await checkAdmin()
  await supabase.from("revistas").delete().eq("id", id)
  revalidatePath("/admin/revistas")
  revalidatePath("/revista", "layout")
}

export async function toggleRevistaStatus(id: string, publicado: boolean): Promise<void> {
  const { supabase } = await checkAdmin()
  await supabase.from("revistas").update({ publicado }).eq("id", id)
  revalidatePath("/admin/revistas")
  revalidatePath("/revista", "layout")
}

// ─── SUBSCRIPTION ────────────────────────────────────────

export async function activateSubscription(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const admin = await createAdminClient()
  const { data: existing } = await admin
    .from("perfiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (existing) {
    await admin.from("perfiles").update({ suscripcion_activa: true }).eq("id", user.id)
  } else {
    await admin.from("perfiles").insert({
      id: user.id,
      nombre_completo: (user.user_metadata?.nombre_completo as string) || "",
      suscripcion_activa: true,
      rol: "lector",
    })
  }

  revalidatePath("/", "layout")
}

export async function getAllUsers() {
  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()
  const { data: perfiles } = await admin
    .from("perfiles")
    .select("id, nombre_completo, suscripcion_activa, rol")

  const perfilesMap = new Map((perfiles ?? []).map(p => [p.id, p]))
  const { data: authData } = await admin.auth.admin.listUsers()
  const authUsers = authData?.users ?? []

  if (!authUsers.length) return []

  return authUsers
    .map(u => {
      const perfil = perfilesMap.get(u.id)
      return {
        id: u.id,
        nombre_completo: perfil?.nombre_completo || (u.user_metadata?.nombre_completo as string) || "",
        email: u.email || "No email",
        suscripcion_activa: perfil?.suscripcion_activa ?? false,
        rol: perfil?.rol || "lector",
        created_at: u.created_at,
      }
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function deactivateSubscription(userId: string): Promise<void> {
  const { supabase } = await checkAdmin()
  await supabase.from("perfiles").update({ suscripcion_activa: false }).eq("id", userId)
  revalidatePath("/admin/suscriptores")
}

export async function deleteUser(userId: string): Promise<void> {
  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()

  const { data: target } = await admin
    .from("perfiles")
    .select("rol")
    .eq("id", userId)
    .single()
  if (target?.rol === "administrador") {
    throw new Error("Cannot delete an admin user")
  }

  await admin.auth.admin.deleteUser(userId)
  await supabase.from("perfiles").delete().eq("id", userId)

  revalidatePath("/admin/suscriptores")
}

export async function updateUsersBatch(updates: { id: string, suscripcion_activa: boolean }[]) {
  const { supabase } = await checkAdmin()
  const admin = await createAdminClient()

  // Batch-fetch roles for all users in one query instead of N+1
  const ids = updates.map(u => u.id)
  const { data: targets } = await admin
    .from("perfiles")
    .select("id, rol")
    .in("id", ids)

  const adminIds = new Set((targets ?? []).filter(t => t.rol === "administrador").map(t => t.id))

  for (const update of updates) {
    if (adminIds.has(update.id)) continue
    await supabase
      .from("perfiles")
      .update({ suscripcion_activa: update.suscripcion_activa })
      .eq("id", update.id)
  }

  revalidatePath("/admin/suscriptores")
  return { success: true }
}

// ─── EMAIL CONFIG ────────────────────────────────────────

export async function getEmailConfig() {
  const admin = await createAdminClient()
  const { data } = await admin.from("app_config").select("*")
  if (!data) return {}
  const config: Record<string, string> = {}
  for (const row of data) {
    config[row.key] = row.value
  }
  return config
}

export async function updateEmailConfig(formData: FormData) {
  const { supabase } = await checkAdmin()
  const entries = [
    ["email_from_name", formData.get("email_from_name") as string],
    ["email_from_email", formData.get("email_from_email") as string],
    ["email_subject_template", formData.get("email_subject_template") as string],
  ]
  for (const [key, value] of entries) {
    if (value) {
      await supabase.from("app_config").upsert({ key, value }, { onConflict: "key" })
    }
  }
  revalidatePath("/admin/configuracion")
}

// ─── SUBSCRIBERS ─────────────────────────────────────────

export async function getSubscribersWithEmails() {
  const admin = await createAdminClient()
  const { data: suscriptores } = await admin
    .from("perfiles")
    .select("id, nombre_completo")
    .eq("suscripcion_activa", true)

  if (!suscriptores?.length) return []

  const { data: users } = await admin.auth.admin.listUsers()
  const userMap = new Map(
    (users?.users ?? []).map((u) => [u.id, u.email ?? ""])
  )

  return suscriptores
    .map((s) => ({
      id: s.id,
      nombre: s.nombre_completo,
      email: userMap.get(s.id) || "",
    }))
    .filter((s) => !!s.email)
}

// ─── SEND MAGAZINE ───────────────────────────────────────

function extractPdfPath(archivoUrl: string): string {
  const marker = "/object/public/revistas-pdf/"
  const idx = archivoUrl.indexOf(marker)
  if (idx === -1) return archivoUrl
  return archivoUrl.slice(idx + marker.length)
}

async function signedPdfUrl(archivoUrl: string): Promise<string> {
  const path = extractPdfPath(archivoUrl)
  if (path === archivoUrl) return archivoUrl // not a Supabase URL, return as-is
  const admin = await createAdminClient()
  const { data } = await admin.storage.from("revistas-pdf").createSignedUrl(path, 60 * 60 * 24 * 7)
  // ponytail: 7-day expiry covers newsletter window; refresh if link expires
  return data?.signedUrl ?? archivoUrl
}

async function sendEmail(config: Record<string, string>, to: string, subject: string, html: string) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${config.email_from_name || "IKMA"} <${config.email_from_email || "onboarding@resend.dev"}>`,
      to,
      subject,
      html,
    }),
  })
}

export async function sendMagazineToEmail(revistaId: string, userId: string): Promise<{ success?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: revista } = await supabase
    .from("revistas")
    .select("titulo, descripcion, archivo_url, imagen_portada")
    .eq("id", revistaId)
    .single()

  if (!revista) return { error: "Magazine not found" }

  const admin = await createAdminClient()
  const { data: perfil } = await admin
    .from("perfiles")
    .select("nombre_completo, suscripcion_activa")
    .eq("id", user.id)
    .single()

  if (!perfil) return { error: "Profile not found" }

  if (!perfil.suscripcion_activa) {
    return { error: `Subscription not active for ${user.email}. Please refresh the page.` }
  }

  const email = user.email
  if (!email) return { error: "No email on file" }

  const config = await getEmailConfig()

  if (process.env.RESEND_API_KEY) {
    const pdfUrl = await signedPdfUrl(revista.archivo_url)
    const resp = await sendEmail(
      config,
      email,
      (config.email_subject_template || "New Magazine: {{titulo}}").replace("{{titulo}}", revista.titulo),
      buildMagazineHtml({
        nombre: perfil.nombre_completo || "there",
        titulo: revista.titulo,
        descripcion: revista.descripcion ?? undefined,
        imagen_portada: revista.imagen_portada,
        archivo_url: pdfUrl,
        from_name: config.email_from_name || "IKMA",
      })
    )
    if (!resp.ok) return { error: "Failed to send email" }
  }

  return { success: "The magazine has been sent to your registered email" }
}

export async function sendMagazineToSubscribers(revistaId: string, excludeEmails: string[] = []): Promise<{ success?: string; error?: string }> {
  const { supabase } = await checkAdmin()

  const { data: revista } = await supabase
    .from("revistas")
    .select("titulo, descripcion, archivo_url, imagen_portada")
    .eq("id", revistaId)
    .single()

  if (!revista) return { error: "Magazine not found" }

  const admin = await createAdminClient()
  const { data: suscriptores } = await admin
    .from("perfiles")
    .select("id, nombre_completo")
    .eq("suscripcion_activa", true)

  if (!suscriptores?.length) return { error: "No subscribers" }

  const { data: users } = await admin.auth.admin.listUsers()
  const userMap = new Map(
    (users?.users ?? []).map((u) => [u.id, u.email ?? ""])
  )

  const recipients = suscriptores
    .map((s) => ({
      email: userMap.get(s.id) || "",
      nombre: s.nombre_completo,
    }))
    .filter((r): r is { email: string; nombre: string } => !!r.email)
    .filter((r) => !excludeEmails.includes(r.email))

  if (!recipients.length) return { error: "No recipients after exclusions" }

  const config = await getEmailConfig()

  if (process.env.RESEND_API_KEY) {
    const pdfUrl = await signedPdfUrl(revista.archivo_url)
    let sent = 0
    for (const { email, nombre } of recipients) {
      const resp = await sendEmail(
        config,
        email,
        (config.email_subject_template || "New Magazine: {{titulo}}").replace("{{titulo}}", revista.titulo),
        buildMagazineHtml({
          nombre,
          titulo: revista.titulo,
          descripcion: revista.descripcion ?? undefined,
          imagen_portada: revista.imagen_portada,
          archivo_url: pdfUrl,
          from_name: config.email_from_name || "IKMA",
        })
      )
      if (resp.ok) sent++
    }
    return { success: `Email sent to ${sent} of ${recipients.length} subscribers` }
  }

  return { error: "Resend API key not configured" }
}

// ─── NEWSLETTERS ─────────────────────────────────────────

export async function sendNewsletter(
  _prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const { user } = await checkAdmin()

  const titulo = formData.get("titulo") as string
  const contenido_html = formData.get("contenido_html") as string
  const imagen_url = formData.get("imagen_url") as string

  if (!titulo || !contenido_html) return { error: "Title and content are required" }

  const admin = await createAdminClient()

  const { data: suscriptores } = await admin
    .from("perfiles")
    .select("id, nombre_completo")
    .eq("suscripcion_activa", true)

  if (!suscriptores?.length) return { error: "No active subscribers" }

  const { data: users } = await admin.auth.admin.listUsers()
  const userMap = new Map(
    (users?.users ?? []).map((u) => [u.id, u.email ?? ""])
  )

  const recipients = suscriptores
    .map((s) => ({
      email: userMap.get(s.id) || "",
      nombre: s.nombre_completo,
    }))
    .filter((r): r is { email: string; nombre: string } => !!r.email)

  if (!recipients.length) return { error: "No recipients with emails" }

  const config = await getEmailConfig()
  let sent = 0

  if (process.env.RESEND_API_KEY) {
    for (const { email, nombre } of recipients) {
      const resp = await sendEmail(
        config,
        email,
        `Newsletter: ${titulo}`,
        buildNewsletterHtml({
          nombre,
          titulo,
          contenido_html,
          imagen_url: imagen_url || null,
          from_name: config.email_from_name || "IKMA",
        })
      )
      if (resp.ok) sent++
    }
  }

  // Save to DB
  await admin.from("newsletters").insert({
    titulo,
    contenido_html,
    imagen_url: imagen_url || null,
    enviado_por: user.id,
    destinatarios: sent,
  })

  revalidatePath("/admin/newsletter")
  return { success: `Newsletter sent to ${sent} of ${recipients.length} subscribers` }
}

export async function getNewsletters() {
  await checkAdmin()
  const admin = await createAdminClient()
  const { data } = await admin
    .from("newsletters")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getNewsletter(id: string) {
  await checkAdmin()
  const admin = await createAdminClient()
  const { data } = await admin
    .from("newsletters")
    .select("*")
    .eq("id", id)
    .single()
  return data
}

export async function deleteNewsletter(id: string) {
  await checkAdmin()
  const admin = await createAdminClient()
  await admin.from("newsletters").delete().eq("id", id)
  revalidatePath("/admin/newsletter")
}

// ─── VIDEOS ────────────────────────────────────────────

export async function createVideo(formData: FormData) {
  const { supabase } = await checkAdmin()
  const titulo = formData.get("titulo") as string
  const data = {
    titulo,
    slug: slugify(titulo),
    descripcion: formData.get("descripcion") as string,
    embed_url: formData.get("embed_url") as string,
    imagen_preview: formData.get("imagen_preview") as string,
    publicado: formData.get("publicado") === "on",
  }
  const { error } = await supabase.from("videos").insert(data)
  if (error) return { error: error.message }
  revalidatePath("/admin/teachings")
  revalidatePath("/teachings")
  redirect("/admin/teachings")
}

export async function updateVideo(id: string, formData: FormData) {
  const { supabase } = await checkAdmin()
  const titulo = formData.get("titulo") as string
  const data = {
    titulo,
    slug: slugify(titulo),
    descripcion: formData.get("descripcion") as string,
    embed_url: formData.get("embed_url") as string,
    imagen_preview: formData.get("imagen_preview") as string,
    publicado: formData.get("publicado") === "on",
  }
  const { error } = await supabase.from("videos").update(data).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/teachings")
  revalidatePath("/teachings")
  revalidatePath(`/teachings/${data.slug}`)
  redirect("/admin/teachings")
}

export async function deleteVideo(id: string, _formData: FormData): Promise<void> {
  const { supabase } = await checkAdmin()
  await supabase.from("videos").delete().eq("id", id)
  revalidatePath("/admin/teachings")
  revalidatePath("/teachings")
}

export async function toggleVideoStatus(id: string, publicado: boolean): Promise<void> {
  const { supabase } = await checkAdmin()
  await supabase.from("videos").update({ publicado }).eq("id", id)
  revalidatePath("/admin/teachings")
  revalidatePath("/teachings")
}
