// Shared email templates
// ponytail: one template, two callers

export function buildNewsletterHtml(config: {
  nombre: string
  titulo: string
  contenido_html: string
  imagen_url?: string | null
  from_name: string
}) {
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
}) {
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
      </div>
    </div>
  `
}
