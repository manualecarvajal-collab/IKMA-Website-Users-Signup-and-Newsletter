"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient, createAdminClient } from "@/lib/supabase/server"

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
  revalidatePath("/revista")
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
  revalidatePath("/revista")
  redirect("/admin/revistas")
}

export async function deleteRevista(id: string, _formData: FormData): Promise<void> {
  const { supabase } = await checkAdmin()
  await supabase.from("revistas").delete().eq("id", id)
  revalidatePath("/admin/revistas")
  revalidatePath("/revista")
}

export async function toggleRevistaStatus(id: string, publicado: boolean): Promise<void> {
  const { supabase } = await checkAdmin()
  await supabase.from("revistas").update({ publicado }).eq("id", id)
  revalidatePath("/admin/revistas")
  revalidatePath("/revista")
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

  // Use admin client (service_role) to bypass RLS and get all profiles
  // Note: only select columns that exist in the migration-defined schema
  const { data: perfiles } = await admin
    .from("perfiles")
    .select("id, nombre_completo, suscripcion_activa, rol")

  const perfilesMap = new Map((perfiles ?? []).map(p => [p.id, p]))

  // Get all auth users as the primary source
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
  
  // Borrar de auth (esto disparará el borrado en cascada del perfil si está configurado en Supabase, 
  // pero lo hacemos manual por seguridad si no hay triggers)
  await admin.auth.admin.deleteUser(userId)
  await supabase.from("perfiles").delete().eq("id", userId)
  
  revalidatePath("/admin/suscriptores")
}

export async function updateUsersBatch(updates: { id: string, suscripcion_activa: boolean }[]) {
  const { supabase } = await checkAdmin()
  
  for (const update of updates) {
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
  const supabase = await createClient()
  const { data } = await supabase.from("app_config").select("*")
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

  // Use admin client (service_role) to bypass RLS
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

  // Use admin client (service_role) to bypass RLS and ensure we read the real state
  const admin = await createAdminClient()
  const { data: perfil, error: perfilError } = await admin
    .from("perfiles")
    .select("nombre_completo, suscripcion_activa")
    .eq("id", user.id)
    .single()

  if (perfilError || !perfil) return { error: "Profile not found" }
  
  if (!perfil.suscripcion_activa) {
    return { error: `Subscription not active for ${user.email}. Please refresh the page.` }
  }

  const email = user.email
  if (!email) return { error: "No email on file" }

  const config = await getEmailConfig()

  if (process.env.RESEND_API_KEY) {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${config.email_from_name || "IKMA"} <${config.email_from_email || "onboarding@resend.dev"}>`,
        to: email,
        subject: (config.email_subject_template || "New Magazine: {{titulo}}").replace("{{titulo}}", revista.titulo),
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e0e0e0;">
            <div style="background-color: #074469; padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">IKMA JOURNAL</h1>
            </div>
            
            <div style="padding: 32px 24px;">
              <h2 style="color: #1c1b1f; margin-top: 0; font-size: 22px;">Hello ${perfil.nombre_completo || "there"},</h2>
              <p style="color: #49454f; line-height: 1.6; font-size: 16px;">
                A new edition of our medical journal is now available for you.
              </p>
              
              <div style="margin: 32px 0; text-align: center;">
                ${revista.imagen_portada ? `
                  <img src="${revista.imagen_portada}" alt="${revista.titulo}" style="width: 240px; border-radius: 12px; shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #eee;">
                ` : ""}
                <h3 style="color: #074469; margin-top: 24px; font-size: 20px;">${revista.titulo}</h3>
                <p style="color: #49454f; font-style: italic; margin-bottom: 24px; padding: 0 20px;">${revista.descripcion || ""}</p>
                
                <a href="${revista.archivo_url}" style="display: inline-block; background-color: #074469; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 8px rgba(7,68,105,0.2);">
                  Download PDF Magazine
                </a>
              </div>
              
              <p style="color: #79747e; font-size: 14px; border-top: 1px solid #f0f0f0; padding-top: 24px; margin-top: 32px;">
                Thank you for being part of the International Kingdom Medical Association. Your support allows us to continue our mission.
              </p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 24px; text-align: center; color: #938f99; font-size: 12px;">
              <p style="margin: 0;">&copy; 2026 IKMA. All rights reserved.</p>
              <p style="margin: 8px 0 0;">You are receiving this email because you are a registered subscriber.</p>
            </div>
          </div>
        `,
      }),
    })
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
  // Use admin client (service_role) to bypass RLS
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
    let sent = 0
    for (const { email, nombre } of recipients) {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${config.email_from_name || "IKMA"} <${config.email_from_email || "onboarding@resend.dev"}>`,
          to: email,
          subject: (config.email_subject_template || "New Magazine: {{titulo}}").replace("{{titulo}}", revista.titulo),
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e0e0e0;">
              <div style="background-color: #074469; padding: 32px 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">IKMA JOURNAL</h1>
              </div>
              
              <div style="padding: 32px 24px;">
                <h2 style="color: #1c1b1f; margin-top: 0; font-size: 22px;">Hello ${nombre},</h2>
                <p style="color: #49454f; line-height: 1.6; font-size: 16px;">
                  A new edition of our medical journal is now available for you.
                </p>
                
                <div style="margin: 32px 0; text-align: center;">
                  ${revista.imagen_portada ? `
                    <img src="${revista.imagen_portada}" alt="${revista.titulo}" style="width: 240px; border-radius: 12px; shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #eee;">
                  ` : ""}
                  <h3 style="color: #074469; margin-top: 24px; font-size: 20px;">${revista.titulo}</h3>
                  <p style="color: #49454f; font-style: italic; margin-bottom: 24px; padding: 0 20px;">${revista.descripcion || ""}</p>
                  
                  <a href="${revista.archivo_url}" style="display: inline-block; background-color: #074469; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 8px rgba(7,68,105,0.2);">
                    Download PDF Magazine
                  </a>
                </div>
                
                <p style="color: #79747e; font-size: 14px; border-top: 1px solid #f0f0f0; padding-top: 24px; margin-top: 32px;">
                  Thank you for being part of the International Kingdom Medical Association. Your support allows us to continue our mission.
                </p>
              </div>
              
              <div style="background-color: #f9f9f9; padding: 24px; text-align: center; color: #938f99; font-size: 12px;">
                <p style="margin: 0;">&copy; 2026 IKMA. All rights reserved.</p>
                <p style="margin: 8px 0 0;">You are receiving this email because you are a registered subscriber.</p>
              </div>
            </div>
          `,
        }),
      })
      if (resp.ok) sent++
    }
    return { success: `Email sent to ${sent} of ${recipients.length} subscribers` }
  }

  return { error: "Resend API key not configured" }
}

