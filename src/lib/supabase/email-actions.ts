"use server"

import { revalidatePath } from "next/cache"
import { checkAdmin, registrarActividad } from "@/lib/supabase/admin-helpers"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { buildMagazineHtml, buildMembershipDecisionHtml, buildMembershipMessageHtml, buildMembershipProcessingHtml, buildNewsletterHtml, buildPaymentConfirmedHtml, buildStudentWelcomeHtml } from "@/lib/email-template"
import { esMembresiaGratis, mergeFreeMembers } from "@/lib/supabase/free-membership"
import { filterByAudiences, type Audience, type Recipient } from "@/lib/newsletter-audiences"
import { sendResendEmail } from "@/lib/resend"

// ─── EMAIL CONFIG ────────────────────────────────────────

export async function getEmailConfig() {
  await checkAdmin()
  return loadEmailConfig()
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
  await checkAdmin()
  const admin = await createAdminClient()
  let suscriptores = (await admin
    .from("perfiles")
    .select("id, nombre_completo")
    .eq("suscripcion_activa", true)).data ?? []

  if (!suscriptores.length) return []

  suscriptores = await mergeFreeMembers(admin, suscriptores)

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

// All registered users (with email, not opted out), tagged with their latest
// membership application type so the newsletter forms can filter by audience.
type AdminClient = Awaited<ReturnType<typeof createAdminClient>>

async function listAllRecipients(admin: AdminClient): Promise<Recipient[]> {
  const { data: perfiles } = await admin
    .from("perfiles")
    .select("id, nombre_completo, newsletter_optout")
  const perfilMap = new Map((perfiles ?? []).map((p) => [p.id, p]))

  const { data: solicitudes } = await admin
    .from("solicitudes_membresia")
    .select("usuario_id, tipo_miembro")
    .order("created_at", { ascending: true })
  const tipoMap = new Map<string, number | null>()
  for (const s of solicitudes ?? []) tipoMap.set(s.usuario_id, s.tipo_miembro)

  const { data: users } = await admin.auth.admin.listUsers()
  return (users?.users ?? [])
    .filter((u) => !!u.email && !perfilMap.get(u.id)?.newsletter_optout)
    .map((u) => {
      const perfil = perfilMap.get(u.id)
      const meta = u.user_metadata as Record<string, unknown> | undefined
      return {
        id: u.id,
        nombre:
          perfil?.nombre_completo ||
          (meta?.nombre_completo as string) ||
          (meta?.full_name as string) ||
          (meta?.name as string) ||
          u.email!.split("@")[0],
        email: u.email as string,
        tipo_miembro: tipoMap.get(u.id) ?? null,
      }
    })
}

export async function getAllRecipients(): Promise<Recipient[]> {
  await checkAdmin()
  const admin = await createAdminClient()
  return listAllRecipients(admin)
}

// For server contexts without a user session (e.g. cron routes).
export async function getAllRecipientsForAdmin(admin: AdminClient): Promise<Recipient[]> {
  return listAllRecipients(admin)
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

// True if the magazine is the first published edition (the one included in the Free membership)
async function esPrimeraRevista(client: Awaited<ReturnType<typeof createAdminClient>>, revistaId: string): Promise<boolean> {
  const { data } = await client
    .from("revistas")
    .select("id")
    .eq("publicado", true)
    .order("fecha_publicacion", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()
  return data?.id === revistaId
}

async function sendEmail(config: Record<string, string>, to: string, subject: string, html: string) {
  return sendResendEmail({
    to,
    subject,
    html,
    fromName: config.email_from_name,
    fromEmail: config.email_from_email,
  })
}

// Retries on transient Resend errors (429 rate-limit, 5xx server). Returns the
// last response even if it still fails — caller decides what to do.
async function sendEmailWithRetry(config: Record<string, string>, to: string, subject: string, html: string) {
  let resp = await sendEmail(config, to, subject, html)
  if (!resp.ok && (resp.status === 429 || resp.status >= 500)) {
    const retryAfter = Number(resp.headers.get("retry-after") ?? "2") * 1000 || 3000
    await new Promise((r) => setTimeout(r, retryAfter))
    resp = await sendEmail(config, to, subject, html)
  }
  return resp
}

export async function sendStudentWelcomeEmail(input: {
  email: string
  nombre: string
  lang?: "en" | "es"
}): Promise<{ success?: string; error?: string }> {
  const config = await loadEmailConfig()

  const es = input.lang === "es"
  const subject = es
    ? "Solicitud de membresía recibida — IKMA"
    : "Membership application received — IKMA"

  const res = await sendResendEmail({
    to: input.email,
    subject,
    html: buildStudentWelcomeHtml({ nombre: input.nombre, lang: input.lang }),
    fromName: config.email_from_name,
    fromEmail: config.email_from_email,
  })

  if (!res.ok) {
    console.error("[sendStudentWelcomeEmail] resend error:", res.status, await res.text())
    return { error: "Failed to send welcome email" }
  }
  return { success: "ok" }
}

async function loadEmailConfig(): Promise<Record<string, string>> {
  const admin = await createAdminClient()
  const { data: configRows } = await admin.from("app_config").select("key, value")
  const config: Record<string, string> = {}
  for (const row of configRows ?? []) config[row.key] = row.value
  return config
}

async function sendMembershipEmail(input: {
  email: string
  nombre: string
  lang?: "en" | "es"
  subject: string
  html: string
}): Promise<{ success?: string; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[sendMembershipEmail] RESEND_API_KEY not configured")
    return { error: "Resend API key not configured" }
  }
  const config = await loadEmailConfig()
  const res = await sendResendEmail({
    to: input.email,
    subject: input.subject,
    html: input.html,
    fromName: config.email_from_name,
    fromEmail: config.email_from_email,
  })
  if (!res.ok) {
    console.error("[sendMembershipEmail] resend error:", res.status, await res.text())
    return { error: "Failed to send email" }
  }
  return { success: "ok" }
}

export async function sendPaymentConfirmedEmail(input: {
  email: string
  nombre: string
  lang?: "en" | "es"
}): Promise<{ success?: string; error?: string }> {
  const es = input.lang === "es"
  return sendMembershipEmail({
    email: input.email,
    nombre: input.nombre,
    lang: input.lang,
    subject: es ? "Pago recibido — IKMA" : "Payment received — IKMA",
    html: buildPaymentConfirmedHtml({ nombre: input.nombre, lang: input.lang }),
  })
}

export async function sendMembershipProcessingEmail(input: {
  email: string
  nombre: string
  lang?: "en" | "es"
}): Promise<{ success?: string; error?: string }> {
  const es = input.lang === "es"
  return sendMembershipEmail({
    email: input.email,
    nombre: input.nombre,
    lang: input.lang,
    subject: es ? "Solicitud recibida — IKMA" : "Application received — IKMA",
    html: buildMembershipProcessingHtml({ nombre: input.nombre, lang: input.lang }),
  })
}

export async function sendMembershipDecisionEmail(input: {
  email: string
  nombre: string
  lang?: "en" | "es"
  decision: "aprobada" | "rechazada"
}): Promise<{ success?: string; error?: string }> {
  const es = input.lang === "es"
  const subject =
    input.decision === "aprobada"
      ? es ? "Membresía aprobada — IKMA" : "Membership approved — IKMA"
      : es ? "Membresía no aprobada — IKMA" : "Membership not approved — IKMA"
  return sendMembershipEmail({
    email: input.email,
    nombre: input.nombre,
    lang: input.lang,
    subject,
    html: buildMembershipDecisionHtml({ nombre: input.nombre, lang: input.lang, decision: input.decision }),
  })
}

export async function sendMagazineToEmail(revistaId: string, userId: string): Promise<{ success?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: revista } = await supabase
    .from("revistas")
    .select("id, titulo, descripcion, archivo_url, imagen_portada")
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
    // Free members may receive only the first published edition by email
    const esFree = await esMembresiaGratis(admin, user.id)
    const puedeEnviar = esFree && (await esPrimeraRevista(admin, revista.id))
    if (!puedeEnviar) {
      return {
        error: esFree
          ? "This magazine is only available to active subscribers."
          : `Subscription not active for ${user.email}. Please refresh the page.`,
      }
    }
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
        email,
      })
    )
    if (!resp.ok) return { error: "Failed to send email" }
  }

  // Log activity
  await admin.from("actividad_admin").insert({
    usuario_id: user.id,
    usuario_nombre: perfil.nombre_completo || user.email || "User",
    tipo: "revista_enviada_email",
    descripcion: `Magazine "${revista.titulo}" sent to ${email}`,
    ref_tabla: "revistas",
    ref_id: revistaId,
  })

  return { success: "The magazine has been sent to your registered email" }
}

export async function sendMagazineToSubscribers(revistaId: string, excludeEmails: string[] = []): Promise<{ success?: string; error?: string }> {
  const { supabase } = await checkAdmin()

  const { data: revista } = await supabase
    .from("revistas")
    .select("id, titulo, descripcion, archivo_url, imagen_portada")
    .eq("id", revistaId)
    .single()

  if (!revista) return { error: "Magazine not found" }

  const admin = await createAdminClient()
  // Paid subscribers always; free members only when sending the first published edition
  const esPrimera = await esPrimeraRevista(admin, revista.id)
  let suscriptores = (await admin
    .from("perfiles")
    .select("id, nombre_completo")
    .eq("suscripcion_activa", true)).data ?? []
  if (esPrimera) {
    suscriptores = await mergeFreeMembers(admin, suscriptores)
  }

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
      const resp = await sendEmailWithRetry(
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
          email,
        })
      )
      if (resp.ok) sent++
      else {
        const body = await resp.text().catch(() => "")
        console.error(`[sendMagazineToSubscribers] FAILED ${resp.status} → ${email}: ${body}`)
      }
    }

    // Log activity
    const admin = await createAdminClient()
    await admin.from("actividad_admin").insert({
      tipo: "revista_enviada_masivo",
      descripcion: `Magazine "${revista.titulo}" sent to ${sent} of ${recipients.length} subscribers`,
      ref_tabla: "revistas",
      ref_id: revistaId,
    })

    return { success: `Email sent to ${sent} of ${recipients.length} subscribers` }
  }

  return { error: "Resend API key not configured" }
}

// ─── INDIVIDUAL MEMBER MESSAGE ──────────────────────────

export async function sendMemberMessage(
  solicitudId: string,
  _prevState: { success?: string; error?: string } | undefined,
  formData: FormData
): Promise<{ success?: string; error?: string } | undefined> {
  const subject = formData.get("subject") as string
  const contenidoHtml = formData.get("contenido_html") as string
  const { supabase } = await checkAdmin()
  if (!subject.trim() || !contenidoHtml.trim()) {
    return { error: "Subject and message are required" }
  }

  const admin = await createAdminClient()
  const { data: solicitud } = await admin
    .from("solicitudes_membresia")
    .select("usuario_id, language, tipo_miembro")
    .eq("id", solicitudId)
    .single()
  if (!solicitud) return { error: "Application not found" }

  const { data: { user } } = await admin.auth.admin.getUserById(solicitud.usuario_id)
  const email = user?.email
  if (!email) return { error: "Member has no email on file" }

  const nombre = (user.user_metadata?.nombre_completo as string) || email.split("@")[0] || "there"

  const result = await sendMembershipEmail({
    email,
    nombre,
    lang: solicitud.language === "es" ? "es" : "en",
    subject,
    html: buildMembershipMessageHtml({
      nombre,
      lang: solicitud.language === "es" ? "es" : "en",
      contenido_html: contenidoHtml,
    }),
  })
  if (result.error) return result

  // Store the sent message in the member's conversation history. The email has
  // already been sent, so a failure here is logged (not surfaced as a send error).
  const config = await loadEmailConfig()
  const { error: insertError } = await admin.from("mensajes_miembro").insert({
    solicitud_id: solicitudId,
    direccion: "enviado",
    asunto: subject,
    contenido: contenidoHtml,
    es_html: true,
    de: config.email_from_email || config.email_from_name || "IKMA",
    para: email,
  })
  if (insertError) {
    console.error("[sendMemberMessage] history insert error:", insertError.message)
  }

  await registrarActividad(
    supabase,
    "correo_miembro_enviado",
    `Message "${subject.slice(0, 60)}" sent to ${email}`,
    "solicitudes_membresia",
    solicitudId
  )
  revalidatePath(`/admin/members/${solicitudId}/email`)
  return { success: `Email sent to ${email}` }
}

// ─── MEMBER MESSAGE HISTORY ─────────────────────────────

export async function getMemberMessages(solicitudId: string) {
  await checkAdmin()
  const admin = await createAdminClient()
  const { data } = await admin
    .from("mensajes_miembro")
    .select("id, direccion, asunto, contenido, es_html, de, para, created_at")
    .eq("solicitud_id", solicitudId)
    .order("created_at", { ascending: false })
  return data ?? []
}

// ─── NEWSLETTERS ─────────────────────────────────────────

// Save as draft or schedule for later — does NOT send.
export async function saveNewsletterDraft(
  _prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const { user } = await checkAdmin()

  const titulo = formData.get("titulo") as string
  const contenido_html = formData.get("contenido_html") as string
  const imagen_url = formData.get("imagen_url") as string
  const audiencias = (formData.get("audiencias") as string)
    ?.split(",")
    .filter(Boolean) as Audience[]
  const scheduled_at = formData.get("scheduled_at") as string | null

  if (!titulo || !contenido_html) return { error: "Title and content are required" }
  if (!audiencias || audiencias.length === 0) return { error: "Select at least one recipient group" }

  const admin = await createAdminClient()
  const status = scheduled_at ? "scheduled" : "draft"

  await admin.from("newsletters").insert({
    titulo,
    contenido_html,
    imagen_url: imagen_url || null,
    enviado_por: user.id,
    destinatarios: 0,
    destinatarios_emails: [],
    status,
    scheduled_at: scheduled_at || null,
    audiencias,
  })

  await admin.from("actividad_admin").insert({
    usuario_id: user.id,
    tipo: status === "scheduled" ? "newsletter_programado" : "newsletter_borrador",
    descripcion: `Newsletter "${titulo}" ${status === "scheduled" ? `scheduled for ${scheduled_at}` : "saved as draft"}`,
    ref_tabla: "newsletters",
    ref_id: titulo,
  })

  revalidatePath("/admin/newsletter")
  return { success: status === "scheduled" ? `Newsletter scheduled for ${scheduled_at}` : "Newsletter saved as draft" }
}

export async function cancelScheduledNewsletter(
  newsletterId: string
): Promise<{ success?: string; error?: string }> {
  const { user } = await checkAdmin()
  const admin = await createAdminClient()

  const { data: nl } = await admin
    .from("newsletters")
    .select("titulo, status")
    .eq("id", newsletterId)
    .single()
  if (!nl) return { error: "Newsletter not found" }
  if (nl.status !== "scheduled") return { error: "Newsletter is not scheduled" }

  await admin.from("newsletters").update({
    status: "draft",
    scheduled_at: null,
  }).eq("id", newsletterId)

  await admin.from("actividad_admin").insert({
    usuario_id: user.id,
    tipo: "newsletter_cancelado",
    descripcion: `Scheduled newsletter "${nl.titulo}" cancelled`,
    ref_tabla: "newsletters",
    ref_id: newsletterId,
  })

  revalidatePath("/admin/newsletter")
  return { success: "Schedule cancelled" }
}

export async function sendNewsletter(
  _prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const { user } = await checkAdmin()

  const titulo = formData.get("titulo") as string
  const contenido_html = formData.get("contenido_html") as string
  const imagen_url = formData.get("imagen_url") as string
  const audiencias = (formData.get("audiencias") as string)
    ?.split(",")
    .filter(Boolean) as Audience[] | undefined
  const scheduled_at = formData.get("scheduled_at") as string | null
  const newsletter_id = formData.get("newsletter_id") as string | null

  if (!titulo || !contenido_html) return { error: "Title and content are required" }
  if (!audiencias || audiencias.length === 0) return { error: "Select at least one recipient group" }

  const admin = await createAdminClient()

  // If scheduled_at is in the future, save as scheduled instead of sending
  if (scheduled_at && new Date(scheduled_at) > new Date()) {
    const status = "scheduled"
    if (newsletter_id) {
      // Update existing draft/scheduled
      await admin.from("newsletters").update({
        titulo,
        contenido_html,
        imagen_url: imagen_url || null,
        status,
        scheduled_at,
        audiencias,
      }).eq("id", newsletter_id)
    } else {
      await admin.from("newsletters").insert({
        titulo,
        contenido_html,
        imagen_url: imagen_url || null,
        enviado_por: user.id,
        destinatarios: 0,
        destinatarios_emails: [],
        status,
        scheduled_at,
        audiencias,
      })
    }

    await admin.from("actividad_admin").insert({
      usuario_id: user.id,
      tipo: "newsletter_programado",
      descripcion: `Newsletter "${titulo}" scheduled for ${scheduled_at}`,
      ref_tabla: "newsletters",
      ref_id: newsletter_id || titulo,
    })

    revalidatePath("/admin/newsletter")
    return { success: `Newsletter scheduled for ${scheduled_at}` }
  }

  const allRecipients = await getAllRecipientsForAdmin(admin)
  const recipients = filterByAudiences(allRecipients, audiencias)

  if (!recipients.length) return { error: "No recipients match the selected groups" }

  const config = await getEmailConfig()
  let sent = 0
  const sentEmails: string[] = []

  const failedEmails: { email: string; status: number; body: string }[] = []

  if (process.env.RESEND_API_KEY) {
    for (const { email, nombre } of recipients) {
      const resp = await sendEmailWithRetry(
        config,
        email,
        `Newsletter: ${titulo}`,
        buildNewsletterHtml({
          nombre,
          titulo,
          contenido_html,
          imagen_url: imagen_url || null,
          from_name: config.email_from_name || "IKMA",
          email,
        })
      )
      if (resp.ok) {
        sent++
        sentEmails.push(email)
      } else {
        const body = await resp.text().catch(() => "")
        failedEmails.push({ email, status: resp.status, body })
        console.error(`[sendNewsletter] FAILED ${resp.status} → ${email}: ${body}`)
      }
    }
  }

  // Save to DB
  await admin.from("newsletters").insert({
    titulo,
    contenido_html,
    imagen_url: imagen_url || null,
    enviado_por: user.id,
    destinatarios: sent,
    destinatarios_emails: sentEmails,
    status: "sent",
    audiencias,
    ...(failedEmails.length ? { failed_emails: failedEmails } : {}),
  })

  // Log activity
  await admin.from("actividad_admin").insert({
    usuario_id: user.id,
    tipo: "newsletter_enviado",
    descripcion: `Newsletter "${titulo}" sent to ${sent} of ${recipients.length} recipients`,
    ref_tabla: "newsletters",
    ref_id: titulo,
  })

  revalidatePath("/admin/newsletter")
  return { success: `Newsletter sent to ${sent} of ${recipients.length} recipients` }
}

export async function resendNewsletterToEmails(
  newsletterId: string,
  emails: string[]
): Promise<{ success?: string; error?: string }> {
  const { user } = await checkAdmin()
  const admin = await createAdminClient()

  const { data: newsletter } = await admin
    .from("newsletters")
    .select("*")
    .eq("id", newsletterId)
    .single()
  if (!newsletter) return { error: "Newsletter not found" }

  const config = await getEmailConfig()
  let sent = 0
  const sentEmails: string[] = []

  if (!process.env.RESEND_API_KEY) return { error: "Resend API key not configured" }

  for (const email of emails) {
    const resp = await sendEmailWithRetry(
      config,
      email,
      `Newsletter: ${newsletter.titulo}`,
      buildNewsletterHtml({
        nombre: email.split("@")[0],
        titulo: newsletter.titulo,
        contenido_html: newsletter.contenido_html,
        imagen_url: newsletter.imagen_url,
        from_name: config.email_from_name || "IKMA",
        email,
      })
    )
    if (resp.ok) {
      sent++
      sentEmails.push(email)
    } else {
      const body = await resp.text().catch(() => "")
      console.error(`[resendNewsletterToEmails] FAILED ${resp.status} → ${email}: ${body}`)
    }
  }

  // Add successfully resent emails to destinatarios_emails and remove from failed_emails
  const prevSent = (newsletter.destinatarios_emails as string[] | null) ?? []
  const remaining = (newsletter.failed_emails as { email: string; status: number; body: string }[] | null ?? [])
    .filter((f) => !sentEmails.includes(f.email))
  await admin.from("newsletters").update({
    destinatarios_emails: [...prevSent, ...sentEmails],
    destinatarios: prevSent.length + sentEmails.length,
    failed_emails: remaining.length ? remaining : null,
  }).eq("id", newsletterId)

  await admin.from("actividad_admin").insert({
    usuario_id: user.id,
    tipo: "newsletter_reenviado",
    descripcion: `Newsletter "${newsletter.titulo}" resent to ${sent} of ${emails.length} recipients`,
    ref_tabla: "newsletters",
    ref_id: newsletterId,
  })

  revalidatePath("/admin/newsletter")
  return { success: `Resent to ${sent} of ${emails.length} recipients` }
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
