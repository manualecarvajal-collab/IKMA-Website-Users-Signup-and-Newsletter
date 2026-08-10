export const countriesByRegion: Record<string, string[]> = {
  A: [
    "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Costa Rica", "Ecuador", "El Salvador",
    "Guatemala", "Honduras", "Mexico", "Nicaragua", "Panama", "Paraguay", "Peru", "Dominican Republic",
    "Uruguay", "Venezuela", "South Africa", "Egypt", "Kenya", "Morocco", "Nigeria", "India", "Philippines",
    "Thailand", "Vietnam", "Indonesia", "Uganda", "Rwanda", "Burundi", "Tanzania", "Ethiopia",
    "Democratic Republic of Congo", "Cuba", "Haiti",
  ],
  B: [
    "Spain", "United States", "Canada", "Germany", "France", "Italy", "United Kingdom", "Switzerland",
    "Sweden", "Norway", "Belgium", "Netherlands", "Australia", "New Zealand", "Japan", "South Korea",
  ],
}

export const pricingMatrix: Record<string, Record<number, number>> = {
  A: { 1: 60, 2: 50, 3: 0, 4: 50 },
  B: { 1: 150, 2: 100, 3: 0, 4: 100 },
}

export const professionSubgroups: Record<number, string[]> = {
  1: [
    "General Practitioner / Family Medicine", "Cardiologist", "Pediatrician", "Surgeon",
    "Gynecologist / Obstetrician", "Registered Nurse", "Dentist", "Psychologist", "Other...",
  ],
  2: [
    "Internal Medicine Resident", "General Surgery Resident",
    "Pediatrics Resident", "Gynecology Resident", "Family Medicine Specialization", "Other...",
  ],
  3: [
    "Medical Student", "Nursing Student", "Dentistry Student",
    "Psychology Student", "Other...",
  ],
  4: [
    "Healthcare Administration", "Social Work / Chaplain",
    "Scientific Researcher", "Medical Technology", "Other...",
  ],
}

export const memberTypeLabels: Record<number, { label: string; desc: string }> = {
  1: { label: "Licensed Health Professional", desc: "Physicians, nurses, specialists with an active license." },
  2: { label: "Resident / Post graduate", desc: "Graduates completing residency or specialization programs." },
  3: { label: "Student", desc: "Access the latest articles and join our newsletter — completely free." },
  4: { label: "Non-Medical Professional", desc: "Support the health mission from other professional fields." },
}

export const paymentOptions = [
  { value: 1, label: "Annual", desc: "One payment per year" },
  { value: 2, label: "2 installments", desc: "Every 6 months" },
  { value: 3, label: "3 installments", desc: "Every 4 months" },
]

// Live mode prices (2026-08)
export const PRICE_IDS: Record<number, Record<string, Record<number, string>>> = {
  1: {
    A: { 1: "price_1U2YE33HQOpcbsNlNYb30VGy", 2: "price_1U2YE33HQOpcbsNls2Swc7Tk", 3: "price_1U2YE33HQOpcbsNlYK0QlEeb" },
    B: { 1: "price_1U2YE23HQOpcbsNlQHpyh4ej", 2: "price_1U2YE23HQOpcbsNlHxSReaDp", 3: "price_1U2YE13HQOpcbsNlLW3WbPik" },
  },
  2: {
    A: { 1: "price_1U2YE33HQOpcbsNlhR9qhVW3", 2: "price_1U2YE23HQOpcbsNlHrHBgQ5v", 3: "price_1U2YE33HQOpcbsNlqZytAmTI" },
    B: { 1: "price_1U2YE23HQOpcbsNlo7FiZUIK", 2: "price_1U2YE13HQOpcbsNli1FBeuoz", 3: "price_1U2YE13HQOpcbsNlNUeGjbUM" },
  },
  4: {
    A: { 1: "price_1U2YE33HQOpcbsNl7d2azGNv", 2: "price_1U2YE33HQOpcbsNlxyYHHuQe", 3: "price_1U2YE23HQOpcbsNlJRLR46qI" },
    B: { 1: "price_1U2YE23HQOpcbsNl2EZNRUIt", 2: "price_1U2YE13HQOpcbsNlIBDasmIL", 3: "price_1U2YE13HQOpcbsNlSROVZhKq" },
  },
}
