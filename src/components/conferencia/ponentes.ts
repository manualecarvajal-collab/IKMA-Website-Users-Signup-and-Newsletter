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
 *
 * `bio` son las biografías que mandó IKMA. Aquí SÍ va el texto en los dos
 * idiomas, y no en `messages/`, porque son datos de la persona y no rótulos de
 * la interfaz: partirlos en dos ficheros de idioma obligaría a mantener la misma
 * estructura duplicada y a que se separaran al primer cambio.
 *
 * AVISO SOBRE LA TRADUCCIÓN. IKMA las mandó solo en inglés; la versión española
 * la escribí yo, y está pendiente de que ellos la revisen. Dos decisiones que
 * conviene mirar:
 *   · En la de Victoria De León, el original repite "Based in Coro, Venezuela,"
 *     dos veces (una al principio de la segunda frase y otra al principio de la
 *     cuarta). Es un resto de copiar y pegar, así que dejé solo la primera; si
 *     prefieres el original tal cual, se repone en un segundo.
 *   · Los nombres de los hospitales y del libro van en su forma española
 *     (Hospital Universitario Dr. Alfredo Van Grieken, Hospital Dr. Rafael
 *     Gallardo, "Ser Hijo"), no traducidos del inglés.
 */
export interface Ponente {
  /** Identificador estable; se usa como `key` en el riel. */
  id: string
  /** Nombre tal y como se muestra en la tarjeta. */
  nombre: string
  /** Ruta pública de la foto recortada. */
  foto: string
  /** Biografía, en los dos idiomas. Ver el aviso de arriba sobre la traducción. */
  bio?: { en: string; es: string }
}

export const PONENTES: Ponente[] = [
  {
    id: "apostol",
    nombre: "Apostle Carlos De León",
    foto: "/images/conferencia/speakers/apostol.webp",
    bio: {
      en: "Apostle Carlos De León serves as the General Overseer of Ciudad de las Águilas (The Eagles Church) in Coro, Venezuela. He is the Latin America Director of IKMA and has played a pioneering role in the ministry alongside IKMA's founder and visionary leader, Apostle John Boney. Through his leadership, he has contributed significantly to the growth and advancement of the organization throughout the region. In addition to his ministerial responsibilities, he also serves as a member of the Board of Directors.",
      es: "El apóstol Carlos De León es Supervisor General de Ciudad de las Águilas en Coro, Venezuela. Es Director para Latinoamérica de IKMA y ha tenido un papel pionero en el ministerio junto al fundador y líder visionario de IKMA, el apóstol John Boney. A través de su liderazgo ha contribuido de manera significativa al crecimiento y al avance de la organización en toda la región. Además de sus responsabilidades ministeriales, es miembro de la Junta Directiva.",
    },
  },
  {
    id: "francisco",
    nombre: "Apostle Dr. Francisco Hernandez",
    foto: "/images/conferencia/speakers/francisco.webp",
    bio: {
      en: "Apostle Dr. Francisco Hernandez is an orthopedic surgeon specializing in hand surgery. He has been ordained as an Apostle in the medical field and is dedicated to integrating faith and healthcare. In addition to his medical practice and ministry, he serves as a board member, contributing his expertise and leadership to the organization.",
      es: "El apóstol Dr. Francisco Hernández es cirujano ortopeda especializado en cirugía de mano. Ha sido ordenado apóstol en el área médica y se dedica a integrar la fe y la atención de la salud. Además de su práctica médica y su ministerio, es miembro de la Junta Directiva, donde aporta su experiencia y su liderazgo a la organización.",
    },
  },
  {
    id: "joselin",
    nombre: "Pastor Jocelyn Gabillas",
    foto: "/images/conferencia/speakers/joselin.webp",
    bio: {
      en: "Pastor Jocelyn Gabillas is a registered nurse and ordained pastor with more than 18 years of experience in the healthcare sector in France. She is passionate about serving both the physical and spiritual needs of individuals and brings extensive professional and pastoral experience to her ministry.",
      es: "La pastora Jocelyn Gabillas es enfermera titulada y pastora ordenada, con más de 18 años de experiencia en el sector sanitario en Francia. Le apasiona atender las necesidades físicas y espirituales de las personas, y aporta a su ministerio una amplia experiencia profesional y pastoral.",
    },
  },
  {
    id: "deleon",
    nombre: "Psychologist Victoria De León",
    foto: "/images/conferencia/speakers/deleon.webp",
    bio: {
      en: "Victoria De León is a licensed psychologist with extensive experience working with children, adolescents, adults, and couples. Based in Coro, Venezuela, she has 19 years of professional experience in the healthcare sector, correctional institutions, and university teaching. She currently serves in the Department of Internal Medicine at Dr. Alfredo Van Grieken University Hospital in Coro, where she teaches postgraduate medical programs. She is also a respected speaker and author of the Spanish-language book Ser Hijo (Being a Son: Understanding the Process and Principles of Becoming a Good Son). Her work focuses on promoting emotional well-being, personal growth, and healthy relationships.",
      es: "Victoria De León es psicóloga licenciada, con amplia experiencia en el trabajo con niños, adolescentes, adultos y parejas. Radicada en Coro, Venezuela, cuenta con 19 años de experiencia profesional en el sector sanitario, en instituciones penitenciarias y en docencia universitaria. Actualmente presta servicio en el Departamento de Medicina Interna del Hospital Universitario Dr. Alfredo Van Grieken, en Coro, donde imparte docencia en programas de postgrado de medicina. Es además conferencista y autora del libro Ser Hijo (entender el proceso y los principios de llegar a ser un buen hijo). Su trabajo se centra en promover el bienestar emocional, el crecimiento personal y las relaciones sanas.",
    },
  },
  {
    id: "jeusali",
    nombre: "Dr. Jesualy Suárez",
    foto: "/images/conferencia/speakers/jeusali.webp",
    bio: {
      en: "Dr. Jesualy Suárez is a specialist in General Surgery with a subspecialty in Surgical Oncology. She currently serves as an Associate Surgeon in the Oncology Surgery Department at Dr. Rafael Gallardo Hospital and works within the Gynecologic Oncology Department at the University Hospital of Coro, Venezuela. Her expertise is dedicated to providing comprehensive surgical care for patients facing cancer-related conditions.",
      es: "La Dra. Jesualy Suárez es especialista en Cirugía General con subespecialidad en Oncología Quirúrgica. Actualmente se desempeña como cirujana adjunta en el Servicio de Cirugía Oncológica del Hospital Dr. Rafael Gallardo y trabaja en el Servicio de Ginecología Oncológica del Hospital Universitario de Coro, Venezuela. Su experiencia está dedicada a la atención quirúrgica integral de pacientes con enfermedades oncológicas.",
    },
  },
  {
    id: "amanda",
    nombre: "Dr. Amanda Majanen",
    foto: "/images/conferencia/speakers/amanda.webp",
    bio: {
      en: "Dr. Amanda Majanen is a medical doctor practicing Family Medicine in Finland. She is passionate about promoting holistic health and views herself as a Kingdom Ambassador and an agent of positive change within the medical field. Her mission is to help individuals experience wellness in spirit, soul, and body, while guiding those seeking healing toward Jehovah Rapha, whom she believes is the ultimate source of health and restoration.",
      es: "La Dra. Amanda Majanen es médica de Familia en Finlandia. Le apasiona promover la salud integral y se considera embajadora del Reino y agente de cambio positivo dentro del área médica. Su misión es ayudar a las personas a experimentar bienestar en espíritu, alma y cuerpo, y guiar a quienes buscan sanidad hacia Jehová Rapha, a quien considera la fuente última de salud y restauración.",
    },
  },
]
