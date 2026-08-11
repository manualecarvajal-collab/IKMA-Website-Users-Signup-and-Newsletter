// Shared email templates
// ponytail: header/footer shell duplicated across templates; extract a shared
// layout when all templates get migrated to the logo header.

export function buildMembershipMessageHtml(config: {
  nombre: string
  contenido_html: string
  lang?: "en" | "es"
}) {
  const es = config.lang === "es"
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e0e0e0;">
      <div style="background-color: #074469; padding: 32px 24px; text-align: center;">
        <img src="https://ugdrmmukrckvpdagfecg.supabase.co/storage/v1/object/public/article-images/logo-white.png" alt="IKMA" style="max-width: 280px; max-height: 120px;">
      </div>

      <div style="padding: 32px 24px;">
        <h2 style="color: #1c1b1f; margin-top: 0; font-size: 22px;">${es ? `Hola ${config.nombre},` : `Hello ${config.nombre},`}</h2>

        <div style="color: #49454f; line-height: 1.8; font-size: 16px;">
          ${config.contenido_html}
        </div>

        <p style="color: #79747e; font-size: 14px; border-top: 1px solid #f0f0f0; padding-top: 24px; margin-top: 32px;">
          ${es
            ? "Gracias por ser parte de la Asociación Médica Internacional del Reino."
            : "Thank you for being part of the International Kingdom Medical Association."}
        </p>
      </div>

      <div style="background-color: #f9f9f9; padding: 24px; text-align: center; color: #938f99; font-size: 12px;">
        <p style="margin: 0;">&copy; 2026 IKMA. All rights reserved.</p>
        <p style="margin: 8px 0 0;">${es ? "Estás recibiendo este correo por tu solicitud de membresía en IKMA." : "You are receiving this email regarding your membership application at IKMA."}</p>
      </div>
    </div>
  `
}

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

export function buildPaymentConfirmedHtml(config: {
  nombre: string
  lang?: "en" | "es"
}) {
  const es = config.lang === "es"
  const title = es ? "PAGO RECIBIDO — IKMA" : "PAYMENT RECEIVED — IKMA"
  const heading = es
    ? `¡Pago exitoso, ${config.nombre}!`
    : `Payment successful, ${config.nombre}!`
  const body = es
    ? "Hemos recibido correctamente el pago de tu membresía en IKMA. ¡Gracias por tu confianza!"
    : "We have successfully received your IKMA membership payment. Thank you for your trust!"
  const disclaimer = es
    ? "Tu cuenta está siendo verificada para la aprobación de tu membresía. En breve haremos una revisión de tu información y te notificaremos cuando tu membresía sea aprobada."
    : "Your account is being verified for membership approval. We will review your information shortly and notify you once your membership is approved."
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const docsUrl = (path: string) => siteUrl + encodeURI(path)
  const invite = es
    ? "Mientras verificamos tu membresía, te invitamos a leer nuestros documentos oficiales:"
    : "While we verify your membership, we invite you to read our official documents:"
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

        <div style="margin: 24px 0;">
          <p style="color: #49454f; line-height: 1.6; font-size: 14px;">${invite}</p>
          <div style="margin-top: 12px;">
            <a href="${docsUrl("/Estatutos de Membresía- IKMA 2026.pdf")}" target="_blank" style="display: block; color: #074469; font-weight: bold; font-size: 14px; text-decoration: underline; margin-bottom: 8px;">Estatutos de Membresía IKMA 2026</a>
            <a href="${docsUrl("/Rules Applicable to IKMA Membership.pdf")}" target="_blank" style="display: block; color: #074469; font-weight: bold; font-size: 14px; text-decoration: underline;">Rules Applicable to IKMA Membership</a>
          </div>
        </div>

        <p style="color: #79747e; font-size: 14px; border-top: 1px solid #f0f0f0; padding-top: 24px; margin-top: 32px;">
          ${es
            ? "Gracias por ser parte de la Asociación Médica Internacional del Reino."
            : "Thank you for being part of the International Kingdom Medical Association."}
        </p>
      </div>

      <div style="background-color: #f9f9f9; padding: 24px; text-align: center; color: #938f99; font-size: 12px;">
        <p style="margin: 0;">&copy; 2026 IKMA. All rights reserved.</p>
        <p style="margin: 8px 0 0;">${es ? "Estás recibiendo este correo porque realizaste el pago de tu membresía en IKMA." : "You are receiving this email because you completed your membership payment at IKMA."}</p>
      </div>
    </div>
  `
}

export function buildMembershipProcessingHtml(config: {
  nombre: string
  lang?: "en" | "es"
}) {
  const es = config.lang === "es"
  const title = es ? "SOLICITUD RECIBIDA — IKMA" : "APPLICATION RECEIVED — IKMA"
  const heading = es
    ? `Gracias por completar tu proceso de membresía, ${config.nombre},`
    : `Thank you for completing your membership process, ${config.nombre},`
  const body = es
    ? "Hemos recibido correctamente los datos de tu membresía en IKMA. Estamos procesando tu información."
    : "We have successfully received your IKMA membership details. We are processing your information."
  const disclaimer = es
    ? "Tu cuenta está siendo verificada para la aprobación de tu membresía. En breve haremos una revisión de tu información y te notificaremos cuando tu membresía sea aprobada."
    : "Your account is being verified for membership approval. We will review your information shortly and notify you once your membership is approved."
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
        <p style="margin: 8px 0 0;">${es ? "Estás recibiendo este correo porque enviaste tu solicitud de membresía en IKMA." : "You are receiving this email because you submitted your membership application at IKMA."}</p>
      </div>
    </div>
  `
}

export function buildMembershipDecisionHtml(config: {
  nombre: string
  lang?: "en" | "es"
  decision: "aprobada" | "rechazada"
}) {
  const es = config.lang === "es"
  const aprobada = config.decision === "aprobada"

  const title = aprobada
    ? es ? "MEMBRESÍA APROBADA — IKMA" : "MEMBERSHIP APPROVED — IKMA"
    : es ? "MEMBRESÍA NO APROBADA — IKMA" : "MEMBERSHIP NOT APPROVED — IKMA"
  const heading = aprobada
    ? es ? `¡Felicidades, ${config.nombre}! Tu membresía ha sido aprobada.`
        : `Congratulations, ${config.nombre}! Your membership has been approved.`
    : es ? `Hola ${config.nombre}, tu solicitud de membresía no fue aprobada.`
        : `Hello ${config.nombre}, your membership application was not approved.`
  const body = aprobada
    ? es
      ? "Tu membresía de IKMA está ahora activa. Ya tienes acceso completo a todo el contenido exclusivo, incluyendo la revista, materiales de enseñanza y los beneficios de la asociación."
      : "Your IKMA membership is now active. You now have full access to all exclusive content, including the journal, teachings, and association benefits."
    : es
      ? "Lamentablemente, después de revisar tu información, no podemos aprobar tu membresía en este momento."
      : "Unfortunately, after reviewing your information, we are unable to approve your membership at this time."
  const nota = aprobada
    ? es
      ? "Inicia sesión en tu cuenta para disfrutar de todos los beneficios de tu membresía."
      : "Sign in to your account to enjoy all the benefits of your membership."
    : es
      ? "Si crees que esto es un error, puedes volver a aplicar o contactarnos para más información."
      : "If you believe this is a mistake, you can re-apply or contact us for more information."
  const boxColor = aprobada ? "#e8f5e9" : "#fce8e6"
  const boxBorder = aprobada ? "#4caf50" : "#e57373"
  const boxText = aprobada ? "#1b5e20" : "#b71c1c"
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e0e0e0;">
      <div style="background-color: #074469; padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">${title}</h1>
      </div>

      <div style="padding: 32px 24px;">
        <h2 style="color: #1c1b1f; margin-top: 0; font-size: 22px;">${heading}</h2>
        <p style="color: #49454f; line-height: 1.8; font-size: 16px;">${body}</p>

        <div style="background-color: ${boxColor}; border: 1px solid ${boxBorder}; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
          <p style="color: ${boxText}; font-size: 14px; line-height: 1.6; margin: 0;">
            <strong>${es ? "Nota:" : "Note:"}</strong> ${nota}
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
