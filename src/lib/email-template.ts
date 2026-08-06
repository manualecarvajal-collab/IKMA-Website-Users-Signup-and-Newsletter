// Shared email templates
// ponytail: one template, two callers

export function buildNewsletterHtml(config: {
  nombre: string
  titulo: string
  contenido_html: string
  imagen_url?: string | null
  from_name: string
  email?: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const unsubscribeUrl = config.email
    ? `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(config.email)}`
    : ""
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e0e0e0;">
      <div style="background-color: #074469; padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">IKMA NEWSLETTER</h1>
      </div>

      <div style="padding: 32px 24px;">
        <h2 style="color: #1c1b1f; margin-top: 0; font-size: 22px;">Hello ${config.nombre},</h2>
        <h3 style="color: #074469; font-size: 20px; margin: 16px 0;">${config.titulo}</h3>

        <div style="color: #49454f; line-height: 1.8; font-size: 16px;">
          ${config.imagen_url ? `<img src="${config.imagen_url}" alt="${config.titulo}" style="width: 100%; max-width: 560px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #eee;">` : ""}
          ${config.contenido_html}
        </div>

        <p style="color: #79747e; font-size: 14px; border-top: 1px solid #f0f0f0; padding-top: 24px; margin-top: 32px;">
          Thank you for being part of the International Kingdom Medical Association. Your support allows us to continue our mission.
        </p>
      </div>

      <div style="background-color: #f9f9f9; padding: 24px; text-align: center; color: #938f99; font-size: 12px;">
        <p style="margin: 0;">&copy; 2026 IKMA. All rights reserved.</p>
        <p style="margin: 8px 0 0;">You are receiving this email because you are a registered subscriber.</p>
        ${unsubscribeUrl ? `<p style="margin: 8px 0 0;"><a href="${unsubscribeUrl}" style="color: #938f99;">Unsubscribe</a></p>` : ""}
      </div>
    </div>
  `
}

export function buildStudentWelcomeHtml(config: {
  nombre: string
  lang?: "en" | "es"
}) {
  const es = config.lang === "es"
  const title = es ? "SOLICITUD DE MEMBRESÍA IKMA" : "IKMA MEMBERSHIP APPLICATION"
  const heading = es
    ? `Gracias por solicitar tu membresía, ${config.nombre},`
    : `Thank you for applying, ${config.nombre},`
  const body = es
    ? "Hemos recibido tu solicitud de membresía de estudiante en IKMA. En breve haremos una revisión de tu información y te notificaremos cuando tu membresía sea aprobada."
    : "We have received your student membership application. We will review your information shortly and notify you once your membership is approved."
  const disclaimer = es
    ? "Mientras tanto, no tendrás acceso a los beneficios de la membresía. Si tu solicitud es aprobada, recibirás un correo con los detalles de acceso."
    : "Until then, you will not have access to the membership benefits. If your application is approved, you will receive an email with your access details."
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e0e0e0;">
      <div style="background-color: #074469; padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">${title}</h1>
      </div>

      <div style="padding: 32px 24px;">
        <h2 style="color: #1c1b1f; margin-top: 0; font-size: 22px;">${heading}</h2>
        <p style="color: #49454f; line-height: 1.8; font-size: 16px;">${body}</p>

        <div style="background-color: #fff8e1; border: 1px solid #f2c94c; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
          <p style="color: #6b5b00; font-size: 14px; line-height: 1.6; margin: 0;">
            <strong>${es ? "Importante:" : "Important:"}</strong> ${disclaimer}
          </p>
        </div>

        <p style="color: #79747e; font-size: 14px; border-top: 1px solid #f0f0f0; padding-top: 24px; margin-top: 32px;">
          ${es
            ? "Gracias por ser parte de la Asociación Médica Internacional del Reino."
            : "Thank you for being part of the International Kingdom Medical Association."}
        </p>
      </div>

      <div style="background-color: #f9f9f9; padding: 24px; text-align: center; color: #938f99; font-size: 12px;">
        <p style="margin: 0;">&copy; 2026 IKMA. All rights reserved.</p>
        <p style="margin: 8px 0 0;">${es ? "Estás recibiendo este correo porque solicitaste una membresía en IKMA." : "You are receiving this email because you applied for membership at IKMA."}</p>
      </div>
    </div>
  `
}

export function buildMagazineHtml(config: {
  nombre: string
  titulo: string
  descripcion?: string
  imagen_portada?: string | null
  archivo_url: string
  from_name: string
  email?: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const unsubscribeUrl = config.email
    ? `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(config.email)}`
    : ""
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e0e0e0;">
      <div style="background-color: #074469; padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">IKMA JOURNAL</h1>
      </div>

      <div style="padding: 32px 24px;">
        <h2 style="color: #1c1b1f; margin-top: 0; font-size: 22px;">Hello ${config.nombre},</h2>
        <p style="color: #49454f; line-height: 1.6; font-size: 16px;">
          A new edition of our medical journal is now available for you.
        </p>

        <div style="margin: 32px 0; text-align: center;">
          ${config.imagen_portada ? `
            <img src="${config.imagen_portada}" alt="${config.titulo}" style="width: 240px; border-radius: 12px; border: 1px solid #eee;">
          ` : ""}
          <h3 style="color: #074469; margin-top: 24px; font-size: 20px;">${config.titulo}</h3>
          ${config.descripcion ? `<p style="color: #49454f; font-style: italic; margin-bottom: 24px; padding: 0 20px;">${config.descripcion}</p>` : ""}

          <a href="${config.archivo_url}" style="display: inline-block; background-color: #074469; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 8px rgba(7,68,105,0.2);">
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
        ${unsubscribeUrl ? `<p style="margin: 8px 0 0;"><a href="${unsubscribeUrl}" style="color: #938f99;">Unsubscribe</a></p>` : ""}
      </div>
    </div>
  `
}
