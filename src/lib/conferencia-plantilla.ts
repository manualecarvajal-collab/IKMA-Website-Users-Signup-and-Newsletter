import {
  buildConferenciaConfirmacionHtml,
  buildConferenciaInvitacionHtml,
  buildConferenciaRecordatorioHtml,
} from "./email-template"

/**
 * Composición de los correos de la conferencia.
 *
 * Este módulo NO toca el servidor a propósito: lo usan **los dos** lados.
 * El panel lo llama para pintar la vista previa y la acción de envío lo llama
 * para construir el correo de verdad. Al ser la misma función, lo que ves en
 * la vista previa es exactamente lo que se envía; con dos caminos distintos se
 * separarían al primer cambio.
 *
 * LAS TRES PLANTILLAS, Y CUÁNDO SALE CADA UNA
 *
 *   `confirmacion` — al verificar el código. Dice que la plaza está confirmada y
 *                    que el enlace de Zoom llega 24 horas antes. No lleva botón:
 *                    en ese momento no hay nada que pulsar.
 *   `recordatorio` — la víspera, a mano desde el panel. Lleva el enlace de Zoom,
 *                    que se pega en el panel ese mismo día.
 *   `invitacion`   — después del evento. Invita a hacerse miembro → /membresia.
 *
 * Antes el recordatorio NO llevaba el enlace a propósito, para que la reunión no
 * circulara por correo. Ese criterio ya no aplica: la página no emite nada y el
 * enlace es justo lo que hay que hacer llegar a cada inscrito.
 */

export const PLANTILLAS = ["confirmacion", "recordatorio", "invitacion"] as const

export type PlantillaId = (typeof PLANTILLAS)[number]

export interface Plantilla {
  asunto: string
  cuerpo: string
}

/**
 * Texto de partida de cada plantilla.
 *
 * Vive en el código y no solo en la base por un motivo concreto: la plantilla de
 * `confirmacion` se envía sola al verificar el código, así que si la fila no
 * existe todavía el correo tiene que salir con algo coherente en vez de vacío.
 * `getAjustes` devuelve estos textos cuando la clave falta, el panel los enseña
 * como punto de partida y, en cuanto se guardan, mandan los de la base.
 */
export const PLANTILLAS_POR_DEFECTO: Record<PlantillaId, Plantilla> = {
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
  recordatorio: {
    // Sin "tomorrow" a propósito: este correo sale en DOS momentos —el envío
    // manual del día antes y el envío inmediato a quien se inscribe dentro de
    // las últimas 24 h— y "mañana" sería mentira en el segundo.
    asunto: "Your Zoom link for the IKMA Conference",
    cuerpo: [
      "<p>Hi {{nombre}},</p>",
      "<p>The IKMA Conference is on <strong>Saturday, November 14</strong>, from 9:00 am to 3:30 pm (EST).</p>",
      "<p>This is your link to the meeting:</p>",
      '<p><a href="{{enlace}}">{{enlace}}</a></p>',
      "<p>You can join a few minutes early. If Zoom asks you for a passcode, it is the one included in the link.</p>",
      "<p>See you there,<br/>The IKMA team</p>",
    ].join("\n"),
  },
  invitacion: {
    asunto: "Become part of IKMA",
    cuerpo: [
      "<p>Hi {{nombre}},</p>",
      "<p>Thank you for joining us at the IKMA Conference. We hope it was a blessing to you.</p>",
      "<p>If you would like to keep walking with us, you can become a member of the association.</p>",
    ].join("\n"),
  },
}

interface DatosPlantilla {
  nombre: string
  email: string
  /** Enlace de Zoom de la reunión. Solo lo usa la plantilla de la víspera. */
  enlace?: string
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
    .replaceAll("{{enlace}}", escapar(datos.enlace ?? ""))
}

/**
 * Correo completo: cuerpo con los marcadores ya resueltos + el shell de marca
 * (logo, cuerpo, botón y pie) que corresponda a la plantilla.
 */
export function componerCorreo(
  plantilla: PlantillaId,
  contenidoHtml: string,
  datos: DatosPlantilla,
  ctaTexto?: string
): string {
  const contenido_html = renderPlantilla(contenidoHtml, datos)

  if (plantilla === "confirmacion") return buildConferenciaConfirmacionHtml({ contenido_html })
  if (plantilla === "recordatorio") {
    return buildConferenciaRecordatorioHtml({ contenido_html, ctaTexto, enlace: datos.enlace })
  }
  return buildConferenciaInvitacionHtml({ nombre: datos.nombre, contenido_html, ctaTexto })
}
