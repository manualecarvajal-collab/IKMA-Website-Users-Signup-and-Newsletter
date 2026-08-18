export const memberLabels: Record<number, string> = {
  1: "Licensed Health Professional",
  2: "Resident (Post-graduate)",
  3: "Student",
  4: "Associate (Non-health)",
}

export const statusColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  pagada: "bg-blue-100 text-blue-800",
  incompleta: "bg-orange-100 text-orange-800",
}

export const statusLabels: Record<string, string> = {
  pendiente: "Pending",
  aprobada: "Approved",
  rechazada: "Rejected",
  pagada: "Paid",
  incompleta: "Incomplete",
}