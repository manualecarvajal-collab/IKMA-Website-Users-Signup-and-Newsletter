import {
  buildConferenciaAccesoHtml,
  buildConferenciaAvisoHtml,
  buildConferenciaCampanaHtml,
} from "./email-template"

/**
 * Plantillas de correo de la conferencia.
 *
 * Hay DOS familias, y no se mezclan:
 *
 *   · SISTEMA — `confirmacion` y `acceso`. Los dispara el registro público en
 *     la conferencia. No se editan desde Bait: el panel ya no los muestra,
 *     pero siguen funcionando con sus textos guardados.
 *
 *   · CAMPAÑAS — `membresia`, `newsletter`, `proxima`. Es lo que se edita y
 *     se envía a mano desde Bait. Cada una existe en español y en inglés.
 *
 * Este módulo NO toca el servidor a propósito: lo usan el panel (vista previa)
 * y la acción de envío (correo real). Al ser la misma función, lo que se ve en
 * la vista previa es exactamente lo que se manda.
 */

export const IDIOMAS = ["es", "en"] as const
export type Idioma = (typeof IDIOMAS)[number]

export const CAMPANAS = ["membresia", "newsletter", "proxima"] as const
export type CampanaId = (typeof CAMPANAS)[number]

export interface Plantilla {
  asunto: string
  cuerpo: string
}

export type PlantillasCampana = Record<CampanaId, Record<Idioma, Plantilla>>

/**
 * Texto de partida de las campañas.
 *
 * Vive en el código además de en la base por el mismo motivo que antes: si la
 * clave no existe (migración pendiente, fila borrada), el panel y el envío
 * tienen que funcionar con algo coherente en vez de con un correo vacío.
 */
export const CAMPANAS_POR_DEFECTO: PlantillasCampana = {
  membresia: {
    es: {
      asunto: "Tu lugar en IKMA",
      cuerpo: [
        "<p>Hola {{nombre}},</p>",
        "<p>Gracias por acompañarnos en la Conferencia IKMA 2026. Esperamos que haya sido tan valioso para ti como para nosotros.</p>",
        "<p>Si quieres seguir caminando con nosotros, puedes solicitar tu membresía de IKMA y acceder a nuestros contenidos, revistas y próximos encuentros.</p>",
        "<p>Un abrazo,<br/>El equipo de IKMA</p>",
      ].join("\n"),
    },
    en: {
      asunto: "Your place at IKMA",
      cuerpo: [
        "<p>Hi {{nombre}},</p>",
        "<p>Thank you for joining us at the IKMA Conference 2026. We hope it was as valuable for you as it was for us.</p>",
        "<p>If you would like to keep walking with us, you can apply for IKMA membership and get access to our content, journals and upcoming gatherings.</p>",
        "<p>Warm regards,<br/>The IKMA team</p>",
      ].join("\n"),
    },
  },
  newsletter: {
    es: {
      asunto: "Sigue conectado con IKMA",
      cuerpo: [
        "<p>Hola {{nombre}},</p>",
        "<p>Queremos seguir compartiendo contigo lo que hacemos: artículos, revistas y encuentros de la comunidad IKMA.</p>",
        "<p>Suscríbete a nuestro boletín para recibir las novedades directamente en tu correo.</p>",
        "<p>Un abrazo,<br/>El equipo de IKMA</p>",
      ].join("\n"),
    },
    en: {
      asunto: "Stay connected with IKMA",
      cuerpo: [
        "<p>Hi {{nombre}},</p>",
        "<p>We want to keep sharing what we do with you: articles, journals and gatherings from the IKMA community.</p>",
        "<p>Subscribe to our newsletter to get the latest news straight to your inbox.</p>",
        "<p>Warm regards,<br/>The IKMA team</p>",
      ].join("\n"),
    },
  },
  proxima: {
    es: {
      asunto: "La próxima Conferencia IKMA",
      cuerpo: [
        "<p>Hola {{nombre}},</p>",
        "<p>Gracias por haber sido parte de la Conferencia IKMA 2026.</p>",
        "<p>Ya estamos preparando la próxima edición y queremos que seas de los primeros en saberlo. Las fechas y el programa se publicarán pronto.</p>",
        "<p>Nos encantará volver a verte.</p>",
      ].join("\n"),
    },
    en: {
      asunto: "The next IKMA Conference",
      cuerpo: [
        "<p>Hi {{nombre}},</p>",
        "<p>Thank you for being part of the IKMA Conference 2026.</p>",
        "<p>We are already preparing the next edition and want you to be among the first to know. Dates and programme will be published soon.</p>",
        "<p>We would love to see you again.</p>",
      ].join("\n"),
    },
  },
}

/** Botón de cada campaña. El href apunta al sitio real, no a una ruta interna. */
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ikmaglobal.com"

const CTA: Record<CampanaId, Record<Idioma, { titulo: string; linea: string; texto: string; href: string }>> = {
  membresia: {
    es: {
      titulo: "Hazte miembro de IKMA",
      linea: "Solicita tu membresía y sigue accediendo a nuestros contenidos, revistas y encuentros.",
      texto: "Solicitar membresía",
      href: `${SITE}/membresia`,
    },
    en: {
      titulo: "Become an IKMA member",
      linea: "Apply for membership and keep access to our content, journals and gatherings.",
      texto: "Apply for membership",
      href: `${SITE}/membresia`,
    },
  },
  newsletter: {
    es: {
      titulo: "Sigue conectado con IKMA",
      linea: "Recibe nuestros artículos, revistas y novedades directamente en tu correo.",
      texto: "Suscribirme al boletín",
      href: `${SITE}/#newsletter`,
    },
    en: {
      titulo: "Stay connected with IKMA",
      linea: "Get our articles, journals and updates straight to your inbox.",
      texto: "Subscribe to the newsletter",
      href: `${SITE}/#newsletter`,
    },
  },
  proxima: {
    es: {
      titulo: "La próxima Conferencia IKMA",
      linea: "Estamos preparando la siguiente edición. Te avisaremos en cuanto haya fechas.",
      texto: "Ver próximos eventos",
      href: `${SITE}/events`,
    },
    en: {
      titulo: "The next IKMA Conference",
      linea: "We are preparing the next edition. We will let you know as soon as dates are ready.",
      texto: "See upcoming events",
      href: `${SITE}/events`,
    },
  },
}

// ---------------------------------------------------------------- sistema

export const PLANTILLAS_SISTEMA = ["confirmacion", "acceso"] as const
export type PlantillaSistemaId = (typeof PLANTILLAS_SISTEMA)[number]

/**
 * Textos de los correos que dispara el registro público.
 *
 * La confirmación se envía sola al verificar el código, así que si la fila no
 * existe todavía el correo tiene que salir con algo coherente en vez de vacío.
 */
export const SISTEMA_POR_DEFECTO: Record<PlantillaSistemaId, Plantilla> = {
  confirmacion: {
    asunto: "Your place at the IKMA Conference is confirmed",
    cuerpo: [
      "<p>Hi {{nombre}},</p>",
      "<p>Your place at <strong>IKMA Forward 2026</strong> is confirmed. We are glad to have you with us.</p>",
      "<p><strong>Saturday, November 14, 2026 · 9:00 am – 3:30 pm (EST)</strong></p>",
      "<p>The conference is held on <strong>Zoom</strong>. We will email you the meeting link on <strong>Friday, November 13</strong> — 24 hours before the conference — to this same address, so there is nothing else you need to do today.</p>",
      "<p>If you do not see it that day, please check your spam folder.</p>",
    ].join("\n"),
  },
  acceso: {
    asunto: "Your sign-in link — IKMA Conference",
    cuerpo: [
      "<p>Hi {{nombre}},</p>",
      '<p style="font-size:19px;font-weight:700;line-height:1.4;color:#3C4A56">Click the button below to get access to the conference information.</p>',
      "<p>The link works for 30 days and in any browser. If you did not ask for it, you can ignore this message: your registration is not affected.</p>",
    ].join("\n"),
  },
}

interface DatosPlantilla {
  nombre: string
  email: string
  /** Enlace firmado para volver a entrar («iniciar sesión» sin contraseña). */
  acceso?: string
}

/**
 * Sustituye los marcadores.
 *
 * Se escapa el valor porque acaba dentro de HTML: si alguien se registra como
 * `<script>`, no queremos que eso se cuele en el correo. El enlace se escapa
 * igual: es una URL, y en un `href` lo único que puede hacer daño son las
 * comillas y los ángulos.
 */
function renderPlantilla(texto: string, datos: DatosPlantilla): string {
  const escapar = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))

  return texto
    .replaceAll("{{nombre}}", escapar(datos.nombre || "asistente"))
    .replaceAll("{{email}}", escapar(datos.email))
    .replaceAll("{{acceso}}", escapar(datos.acceso ?? ""))
}

/** Correo completo de una plantilla de sistema (siempre en inglés). */
export function componerCorreoSistema(
  plantilla: PlantillaSistemaId,
  contenidoHtml: string,
  datos: DatosPlantilla
): string {
  const contenido_html = renderPlantilla(contenidoHtml, datos)

  if (plantilla === "acceso") {
    return buildConferenciaAccesoHtml({ contenido_html, acceso: datos.acceso ?? "" })
  }
  return buildConferenciaAvisoHtml({ contenido_html })
}

/** Correo completo de una campaña, con su botón y su pie en el idioma elegido. */
export function componerCampana(
  campana: CampanaId,
  contenidoHtml: string,
  datos: Pick<DatosPlantilla, "nombre" | "email">,
  idioma: Idioma
): string {
  return buildConferenciaCampanaHtml({
    contenido_html: renderPlantilla(contenidoHtml, datos),
    cta: CTA[campana][idioma],
    idioma,
  })
}
