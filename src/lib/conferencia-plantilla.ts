import {
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
 */

/**
 * Las dos plantillas del panel.
 *
 *   `invitacion`   — tras el evento, invita a hacerse miembro → /membresia
 *   `recordatorio` — antes del evento, manda a la landing → /conferencia
 *
 * El recordatorio NO lleva el link de Zoom a propósito: así el enlace de la
 * reunión no circula por correo y no se puede reenviar a terceros.
 */
export type PlantillaId = "invitacion" | "recordatorio"

export interface DatosPlantilla {
  nombre: string
  email: string
}

/**
 * Sustituye los marcadores.
 *
 * Se escapa el valor porque acaba dentro de HTML: si alguien se registra como
 * `<script>`, no queremos que eso se cuele en el correo.
 */
export function renderPlantilla(texto: string, datos: DatosPlantilla): string {
  const escapar = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))

  return texto
    .replaceAll("{{nombre}}", escapar(datos.nombre || "asistente"))
    .replaceAll("{{email}}", escapar(datos.email))
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
  const base = {
    nombre: datos.nombre || "asistente",
    contenido_html: renderPlantilla(contenidoHtml, datos),
    ctaTexto,
  }

  return plantilla === "recordatorio"
    ? buildConferenciaRecordatorioHtml(base)
    : buildConferenciaInvitacionHtml(base)
}
