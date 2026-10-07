/**
 * Los seis ponentes de la conferencia.
 *
 * El título va DENTRO del nombre ("Dr.", "Pastor"…), que es como lo pidió IKMA;
 * por eso no hay un campo aparte para el cargo.
 *
 * El orden del array es el orden del riel. Los nombres NO se traducen: son
 * nombres propios, así que viven aquí y no en i18n.
 *
 * Las fotos son recortes con transparencia, así que van en WebP sobre la
 * tarjeta blanca: el fondo de la tarjeta hace de fondo del retrato.
 */
export interface Ponente {
  /** Identificador estable; se usa como `key` en el riel. */
  id: string
  /** Nombre tal y como se muestra en la tarjeta. */
  nombre: string
  /** Ruta pública de la foto recortada. */
  foto: string
}

export const PONENTES: Ponente[] = [
  { id: "apostol", nombre: "Apostle Carlos De León", foto: "/images/conferencia/speakers/apostol.webp" },
  { id: "francisco", nombre: "Apostle Dr. Francisco Hernandez", foto: "/images/conferencia/speakers/francisco.webp" },
  { id: "joselin", nombre: "Pastor Jocelyn Gabillas", foto: "/images/conferencia/speakers/joselin.webp" },
  { id: "deleon", nombre: "Psychologist Victoria De León", foto: "/images/conferencia/speakers/deleon.webp" },
  { id: "jeusali", nombre: "Dr. Jesualy Suárez", foto: "/images/conferencia/speakers/jeusali.webp" },
  { id: "amanda", nombre: "Dr. Amanda Majanen", foto: "/images/conferencia/speakers/amanda.webp" },
]
