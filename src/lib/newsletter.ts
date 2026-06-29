import { createAdminClient } from "@/lib/supabase/server"
import { buildMagazineHtml } from "@/lib/email-template"

export async function sendNewsletter(articuloId: string) {
  const admin = await createAdminClient()

  const { data: articulo } = await admin
    .from("articulos")
    .select("titulo, slug, resumen")
    .eq("id", articuloId)
    .single()

  if (!articulo) {
    throw new Error("Article not found")
  }

  const { data: suscriptores } = await admin
    .from("perfiles")
    .select("id, nombre_completo")
    .eq("suscripcion_activa", true)

  if (!suscriptores?.length) {
    return { sent: 0 }
  }

  const { data: users } = await admin.auth.admin.listUsers()

  const userMap = new Map(
    (users?.users ?? []).map((u) => [u.id, u.email])
  )

  const emails = suscriptores
    .map((s) => ({
      email: userMap.get(s.id),
      nombre: s.nombre_completo,
    }))
    .filter((e): e is { email: string; nombre: string } => !!e.email)

  if (!emails.length) {
    return { sent: 0 }
  }

  if (process.env.RESEND_API_KEY) {
    for (const { email, nombre } of emails) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "IKMA <onboarding@resend.dev>",
          to: email,
          subject: `New Article: ${articulo.titulo}`,
          html: `
            <h1>${articulo.titulo}</h1>
            <p>Hello ${nombre},</p>
            <p>${articulo.resumen || ""}</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/revista/${articulo.slug}">Read more</a>
          `,
        }),
      })
    }
  }

  return { sent: emails.length }
}
