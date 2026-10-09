import { PONENTES } from "./ponentes"
import type { Ponente } from "./ponentes"

/**
 * El día de la conferencia, tramo a tramo.
 *
 * Sale del documento que mandó IKMA ("IKMA FORWARD CONFERENCE nov 14th.docx"),
 * que es un orden de participación de producción: horas de reloj, quién habla y
 * de qué. Aquí no se inventa nada: lo que el documento no dice, no está.
 *
 * DOS AVISOS SOBRE EL ORIGINAL (respetados a propósito):
 *
 *  1. Las horas van en hora de Coro (UTC−4). El documento titula la columna
 *     "EDT - Coro" y en la primera línea dice "9 am EST – 3 pm EST". EST es
 *     UTC−5: no puede ser lo mismo que Coro. Manda la tabla horaria, que es la
 *     que cuadra con `EVENT_DATE` (9:00 a 09:00−04:00), y por eso la página
 *     escribe "hora de Coro (UTC−4)" y no "EST".
 *
 *  2. El documento se contradice en las duraciones: la lista de ponentes dice
 *     30 min para Amanda Majanen y 45 para Victoria De León, y su propia tabla
 *     horaria les da 20 min a cada una (10:45–11:05 y 14:15–14:35). También el
 *     panel: 30 min en la lista, 55 en la tabla. Aquí NO se imprime ninguna
 *     duración en minutos —solo la hora de inicio y de fin—, así que la página
 *     enseña el dato que el propio documento sostiene sin elegir bando en la
 *     contradicción. Cuando IKMA la resuelva, se corrige en la tabla horaria.
 *
 * Los nombres NO se traducen y, cuando la persona ya tiene ficha en `PONENTES`,
 * tampoco se repiten aquí: se enlazan por `ponenteId`, que es lo que ata el
 * nombre y la foto a un único sitio. Lo que sí va en los dos idiomas son los
 * temas, porque el documento los trae en inglés y en español.
 */

export interface Texto {
  en: string
  es: string
}

/**
 * De qué va cada tramo. No es decoración: decide el color de la pestaña de la
 * fila y la etiqueta que se lee encima, así que la página se puede recorrer
 * solo por el color —enseñanza, testimonio, adoración, logística—.
 */
export type TipoSesion =
  | "bienvenida"
  | "adoracion"
  | "palabras"
  | "ensenanza"
  | "testimonio"
  | "panel"
  | "pausa"
  | "almuerzo"
  | "preguntas"
  | "anuncios"

export interface Sesion {
  /** Ancla de la fila (`#spk-<id>`) y `key` en React. */
  id: string
  /** Hora de inicio, "HH:MM". */
  inicio: string
  /** Hora de fin, "HH:MM". */
  fin: string
  tipo: TipoSesion
  /** Ficha de `PONENTES`, cuando la persona ya está en la landing. */
  ponenteId?: string
  /** Nombre suelto cuando no hay ficha (anfitriona, grupo, junta…). */
  nombre?: string
  /**
   * Iniciales para el recuadro. Solo para quien ES ponente y todavía no tiene
   * foto: así su fila no queda coja respecto a las demás. No se usa para
   * logística ni para el panel, que no son personas.
   */
  iniciales?: string
  /** Tema del tramo. Ausente cuando el documento no lo dice. */
  tema?: Texto
  /** Apunte corto (traductores, quién compone el panel…). */
  nota?: Texto
}

/**
 * Color de la pestaña lateral y del punto de la etiqueta.
 *
 * Los tres primeros son los bloques del cartel de la landing (#1F4D75,
 * #B27A59, #8C9487): la página nueva no estrena paleta, reutiliza la del
 * cartel. La logística va en el gris de las barras del fondo, para que no
 * compita con las sesiones.
 */
export const COLOR_TIPO: Record<TipoSesion, string> = {
  bienvenida: "#C3CAD2",
  adoracion: "#8C9487",
  palabras: "#C3CAD2",
  ensenanza: "#1F4D75",
  testimonio: "#B27A59",
  panel: "#11324F",
  pausa: "#C3CAD2",
  almuerzo: "#C3CAD2",
  preguntas: "#C3CAD2",
  anuncios: "#C3CAD2",
}

export const PROGRAMA: Sesion[] = [
  {
    id: "bienvenida",
    inicio: "09:00",
    fin: "09:10",
    tipo: "bienvenida",
    nombre: "Alexis Lastra",
    tema: {
      en: "Welcoming everyone, introducing the conference and IKMA",
      es: "Bienvenida, presentación de la conferencia y de IKMA",
    },
  },
  {
    id: "adoracion",
    inicio: "09:10",
    fin: "09:30",
    tipo: "adoracion",
    nombre: "La Ciudad de las Águilas",
    tema: { en: "Worship the Lord", es: "Adorar al Señor" },
    nota: { en: "Coro, Venezuela", es: "Coro, Venezuela" },
  },
  {
    id: "carmen",
    inicio: "09:30",
    fin: "09:40",
    tipo: "palabras",
    nombre: "Mum Carmen Boney",
    iniciales: "CB",
    tema: { en: "Share a few words", es: "Comparte unas palabras" },
  },
  { id: "carlos", inicio: "09:40", fin: "10:10", tipo: "ensenanza", ponenteId: "apostol" },
  { id: "francisco", inicio: "10:10", fin: "10:35", tipo: "ensenanza", ponenteId: "francisco" },
  { id: "pausa", inicio: "10:35", fin: "10:45", tipo: "pausa" },
  {
    id: "amanda",
    inicio: "10:45",
    fin: "11:05",
    tipo: "testimonio",
    ponenteId: "amanda",
    tema: { en: "Testimony", es: "Testimonio" },
  },
  {
    id: "panel",
    inicio: "11:05",
    fin: "12:00",
    tipo: "panel",
    tema: { en: "IKMA Forward — what is in store", es: "IKMA Forward: lo que está por venir" },
    nota: { en: "With members of the board", es: "Con miembros de la junta directiva" },
  },
  { id: "almuerzo", inicio: "12:00", fin: "13:00", tipo: "almuerzo" },
  {
    id: "joselin",
    inicio: "13:00",
    fin: "13:45",
    tipo: "ensenanza",
    ponenteId: "joselin",
    tema: {
      en: "Healing as a manifestation of the Kingdom of God",
      es: "La sanación como manifestación del Reino de Dios",
    },
    nota: { en: "With two translators", es: "Con dos traductores" },
  },
  {
    id: "jeusali",
    inicio: "13:45",
    fin: "14:15",
    tipo: "testimonio",
    ponenteId: "jeusali",
    tema: { en: "Testimony of healing", es: "Testimonio de sanación" },
  },
  {
    id: "victoria",
    inicio: "14:15",
    fin: "14:35",
    tipo: "ensenanza",
    ponenteId: "deleon",
    tema: {
      en: "How to overcome grief — when healing doesn't happen",
      es: "Cómo superar el duelo: cuando la sanación no ocurre",
    },
  },
  { id: "preguntas", inicio: "14:35", fin: "14:50", tipo: "preguntas" },
  {
    id: "anuncios",
    inicio: "14:50",
    fin: "15:00",
    tipo: "anuncios",
    tema: { en: "IKMA International Congress 2027", es: "Congreso Internacional IKMA 2027" },
  },
]

const POR_ID = new Map(PONENTES.map((p) => [p.id, p]))

/** Ficha del ponente de una sesión, si la tiene. */
export function ponenteDe(sesion: Sesion): Ponente | undefined {
  return sesion.ponenteId ? POR_ID.get(sesion.ponenteId) : undefined
}

/**
 * Nombre a mostrar. Para las personas que ya están en `PONENTES` sale de ahí
 * (una sola fuente para la landing y para esta página); para el resto, del
 * nombre suelto de la sesión.
 */
export function nombreDe(sesion: Sesion): string {
  return ponenteDe(sesion)?.nombre ?? sesion.nombre ?? ""
}

/** La sesión que lleva un ponente, para que su retrato enlace a su tramo. */
export function sesionDePonente(ponenteId: string): Sesion | undefined {
  return PROGRAMA.find((s) => s.ponenteId === ponenteId)
}

/**
 * Quién más sostiene el día, de la línea de moderación del documento.
 *
 * Son listas y no texto suelto porque los nombres no se traducen: viven aquí y
 * el rótulo ("Moderación", "Traducción"…) sí va en i18n.
 */
export const EQUIPO = {
  moderator: ["Alexis Lastra", "Amanda Majanen", "Gratia Boneza"],
  announcements: ["Gratia Boneza"],
}

/**
 * Los ponentes que tienen foto y por tanto encabezan la tira de retratos del
 * hero (la que además sirve de índice: cada cara enlaza a su tramo del día).
 */
export const CON_FOTO = PONENTES
