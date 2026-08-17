export type Audience = "registrados" | "estudiantes" | "residentes" | "licenciados" | "no_medicos"

export const AUDIENCE_TIPOS: Record<Exclude<Audience, "registrados">, number> = {
  estudiantes: 3,
  residentes: 2,
  licenciados: 1,
  no_medicos: 4,
}

export const AUDIENCE_OPTIONS: { value: Audience; labelKey: string }[] = [
  { value: "registrados", labelKey: "audienciaRegistrados" },
  { value: "estudiantes", labelKey: "audienciaEstudiantes" },
  { value: "residentes", labelKey: "audienciaResidentes" },
  { value: "licenciados", labelKey: "audienciaLicenciados" },
  { value: "no_medicos", labelKey: "audienciaNoMedicos" },
]

export interface Recipient {
  id: string
  nombre: string
  email: string
  tipo_miembro: number | null
}

// "registrados" (or an empty selection) = everyone. The type audiences map to
// solicitudes_membresia.tipo_miembro (1 Licensed, 2 Resident, 3 Student, 4 Associate).
export function filterByAudiences(recipients: Recipient[], audiences: Audience[]): Recipient[] {
  if (audiences.length === 0) return []
  if (audiences.includes("registrados")) return recipients
  const tipos = new Set(
    audiences.map((a) => AUDIENCE_TIPOS[a as Exclude<Audience, "registrados">])
  )
  return recipients.filter((r) => r.tipo_miembro !== null && tipos.has(r.tipo_miembro))
}