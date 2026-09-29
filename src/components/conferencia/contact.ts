/**
 * Datos de contacto reales de IKMA.
 *
 * Viven aquí y no en i18n a propósito: un correo o un teléfono no se traducen,
 * y tenerlos duplicados en `messages/en.json` y `messages/es.json` sólo
 * garantiza que algún día se desincronicen.
 *
 * `null` significa "todavía no lo tenemos": el elemento no se renderiza.
 */
export const CONTACT = {
  website: "www.ikmaglobal.com",
  websiteUrl: "https://ikmaglobal.com",
  email: "ikma@emmint.com",
  /** Pendiente de confirmar por IKMA. */
  phone: null as string | null,
  /** Pendientes de confirmar por IKMA. */
  facebook: null as string | null,
  instagram: null as string | null,
}
