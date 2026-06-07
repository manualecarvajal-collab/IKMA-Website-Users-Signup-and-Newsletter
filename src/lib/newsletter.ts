import { createClient } from "@/lib/supabase/server"

export async function sendNewsletter(articuloId: string) {
  const supabase = await createClient()

  const { data: articulo } = await supabase
    .from("articulos")
    .select("titulo, slug, resumen")
    .eq("id", articuloId)
    .single()

  if (!articulo) {
    throw new Error("Article not found")
  }

  const { data: suscriptores } = await supabase
    .from("perfiles")
    .select("id, nombre_completo")
    .eq("suscripcion_activa", true)

  if (!suscriptores?.length) {
    return { sent: 0 }
  }

  const emails = suscriptores.map((s) => ({
    to: s.nombre_completo,
    subject: `New Article: ${articulo.titulo}`,
    html: `
      <h1>${articulo.titulo}</h1>
      <p>${articulo.resumen || ""}</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/revista/${articulo.slug}">Read more</a>
    `,
  }))

  if (process.env.RESEND_API_KEY) {
    for (const email of emails) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "IKMA <newsletter@ikma.org>",
          to: email.to,
          subject: email.subject,
          html: email.html,
        }),
      })
    }
  }

  return { sent: emails.length }
}
