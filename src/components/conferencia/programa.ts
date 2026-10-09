import { PONENTES } from "./ponentes"
import type { Ponente } from "./ponentes"

/**
 * El día de la conferencia, tramo a tramo.
 *
 * Sale del documento que mandó IKMA ("IKMA FORWARD CONFERENCE nov 14th.docx"),
 * que es un orden de participación de producción: horas de reloj, quién habla y
 * de qué. Aquí no se inventa nada: lo que el documento no dice, no está.
 *
 * SEGUNDA VERSIÓN (la que manda ahora). IKMA corrigió el horario: el día acaba
 * a las 15:30 y no a las 15:00, hay un SEGUNDO tramo de adoración por la tarde,
 * Victoria De León pasa de 45 a 40 minutos, y la moderación y los medios cambian
 * de personas. Todo eso está aplicado.
 *
 * LAS ERRATAS DEL DOCUMENTO, Y POR QUÉ SE CORRIGEN.
 *
 * La tabla horaria nueva trae tres horas imposibles —el tiempo iría hacia
 * atrás— y una errata de tecleo. No se copian tal cual: una página pública no
 * puede anunciar un tramo que empieza antes de terminar. Cada arreglo lo imponen
 * los propios datos del documento —las duraciones que él mismo escribe y la hora
 * de inicio del tramo siguiente—, no una interpretación mía.
 *
 *   1. Francisco Hernandez. El documento dice "10:10- 10:45 / (30 min)". 10:10
 *      más 30 minutos son 10:40, y la pausa empieza a las 10:40. Se pone
 *      10:10–10:40: así cuadran sus dos datos; con 10:45, la pausa empezaría
 *      antes de que él acabe.
 *
 *   2. Adoración de la tarde. El documento escribe "12:55- 13-10": un guion donde
 *      va un dos puntos. Son las 13:10, y además es justo lo que dura el tramo
 *      (15 min).
 *
 *   3. Jocelyn Gabillas. "13:10- 14:55 / (45 min)": 13:10 más 45 minutos son
 *      13:55. Se pone 13:10–13:55.
 *
 *   4. Jesualy Suárez. "14:55- 14:25" termina antes de empezar. Con el arreglo
 *      anterior (Jocelyn acaba a las 13:55) y sus 30 minutos, el tramo es
 *      13:55–14:25, y encaja con el siguiente: Victoria empieza a las 14:25.
 *
 *   5. Anuncios. "15:20- 15:30)" con un paréntesis suelto.
 *
 * Con esos cinco arreglos el día cierra por los dos extremos: empieza a las
 * 09:00 y acaba a las 15:30, como dice la cabecera del documento, y las
 * duraciones que él mismo escribe van cuadrando una detrás de otra. Además, la
 * suma de las duraciones escritas (380 min) se queda 10 minutos corta respecto
 * al reloj, y esos 10 son exactamente las dos diferencias que el documento tiene
 * entre lo que rotula y lo que marca: Amanda Majanen (30 rotulados, 35 en el
 * reloj) y las preguntas (10 rotulados, 15 en el reloj).
 *
 * LAS HORAS VAN EN HORA DE CORO (UTC−4). El documento titula la columna
 * "EDT - Coro" y arriba escribe "9 am EST – 3:30 pm EST". EST es UTC−5: no puede
 * ser lo mismo que Coro. Manda la tabla horaria, que es la que cuadra con
 * `EVENT_DATE` (09:00 a 09:00−04:00), y por eso la página escribe "hora de Coro
 * (UTC−4)". Su cabecera de la tabla dice "9:00 am - 3:10 PM EST", que tampoco
 * puede ser: la propia tabla acaba a las 15:30.
 *
 * POR QUÉ NO SE IMPRIME NINGUNA DURACIÓN EN MINUTOS. Porque el documento se
 * contradice en dos tramos (Amanda y las preguntas, arriba): rotula 30 y 10
 * donde el reloj da 35 y 15. La página enseña solo la hora de inicio y de fin,
 * que es el dato que el documento sostiene sin contradecirse.
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
  /** Nombre suelto cuando no hay ficha (anfitrión, grupo, junta…). */
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
    nota: { en: "Moderator", es: "Moderador" },
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
  // 10:40 y no 10:45: ver la errata 1 de la cabecera.
  { id: "francisco", inicio: "10:10", fin: "10:40", tipo: "ensenanza", ponenteId: "francisco" },
  { id: "pausa", inicio: "10:40", fin: "10:50", tipo: "pausa" },
  {
    id: "amanda",
    inicio: "10:50",
    fin: "11:25",
    tipo: "testimonio",
    ponenteId: "amanda",
    tema: { en: "Testimony", es: "Testimonio" },
  },
  {
    id: "panel",
    inicio: "11:25",
    fin: "11:55",
    tipo: "panel",
    tema: { en: "IKMA Forward — what is in store", es: "IKMA Forward: lo que está por venir" },
    nota: { en: "With members of the board", es: "Con miembros de la junta directiva" },
  },
  { id: "almuerzo", inicio: "11:55", fin: "12:55", tipo: "almuerzo" },
  // Segundo tramo de adoración: es nuevo en esta versión del documento.
  {
    id: "adoracion-tarde",
    inicio: "12:55",
    fin: "13:10",
    tipo: "adoracion",
    nombre: "La Ciudad de las Águilas",
    tema: { en: "Worship the Lord", es: "Adorar al Señor" },
    nota: { en: "Coro, Venezuela", es: "Coro, Venezuela" },
  },
  {
    id: "joselin",
    inicio: "13:10", // 13:55 y no 14:55: ver la errata 3.
    fin: "13:55",
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
    inicio: "13:55", // ver la errata 4.
    fin: "14:25",
    tipo: "testimonio",
    ponenteId: "jeusali",
    tema: { en: "Testimony of healing", es: "Testimonio de sanación" },
  },
  {
    id: "victoria",
    inicio: "14:25",
    fin: "15:05",
    tipo: "ensenanza",
    ponenteId: "deleon",
    tema: {
      en: "How to overcome grief — when healing doesn't happen",
      es: "Cómo superar el duelo: cuando la sanación no ocurre",
    },
  },
  { id: "preguntas", inicio: "15:05", fin: "15:20", tipo: "preguntas" },
  {
    id: "anuncios",
    inicio: "15:20",
    fin: "15:30",
    tipo: "anuncios",
    tema: {
      // El documento los escribe como tres líneas sueltas ("IKMA International
      // congress 2027 / Website / Associate Membership"). Aquí van en una frase
      // porque en la página son el tema de un tramo, no una lista de apuntes.
      en: "IKMA International Congress 2027, the IKMA website and associate membership",
      es: "El Congreso Internacional IKMA 2027, la web de IKMA y la membresía",
    },
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
 * Quién más sostiene el día, del bloque de moderación del documento.
 *
 * Son listas y no texto suelto porque los nombres no se traducen: viven aquí y
 * el rótulo ("Moderación", "Traducción"…) sí va en i18n.
 *
 * OJO CON LA MODERACIÓN: en la primera versión del documento Gratia Boneza
 * figuraba como moderadora; en la segunda ya no, solo como la persona de los
 * anuncios. Se ha quitado de ahí, que es lo que dice la versión nueva.
 */
export const EQUIPO = {
  moderator: ["Alexis Lastra", "Amanda Majanen"],
  announcements: ["Gratia Boneza"],
  media: ["Manuel Carvajal"],
}

/**
 * Los ponentes que tienen foto y por tanto encabezan la tira de retratos del
 * hero (la que además sirve de índice: cada cara enlaza a su tramo del día).
 */
export const CON_FOTO = PONENTES
