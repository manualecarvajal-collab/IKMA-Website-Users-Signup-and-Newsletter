export const countriesByRegion: Record<string, string[]> = {
  A: [
    "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Costa Rica", "Ecuador", "El Salvador",
    "Guatemala", "Honduras", "Mexico", "Nicaragua", "Panama", "Paraguay", "Peru", "Dominican Republic",
    "Uruguay", "Venezuela", "South Africa", "Egypt", "Kenya", "Morocco", "Nigeria", "India", "Philippines",
    "Thailand", "Vietnam", "Indonesia",
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
  2: { label: "Resident / Specialist", desc: "Graduates completing residency or specialization programs." },
  3: { label: "Student", desc: "Students in health-related degrees or careers." },
  4: { label: "Non-Medical Professional", desc: "Support the health mission from other professional fields." },
}

export const paymentOptions = [
  { value: 1, label: "Annual", desc: "One payment per year" },
  { value: 2, label: "2 installments", desc: "Every 6 months" },
  { value: 3, label: "3 installments", desc: "Every 4 months" },
]

export const PRICE_IDS: Record<number, Record<string, Record<number, string>>> = {
  1: {
    A: { 1: "price_1Tw6uS4088hCzJhb8Km3UZET", 2: "price_1Tw6uS4088hCzJhbZFfQsn3u", 3: "price_1Tw6uS4088hCzJhbU2piafJZ" },
    B: { 1: "price_1Tw6uS4088hCzJhbsh7vKoLF", 2: "price_1Tw6uS4088hCzJhb2EYvrgte", 3: "price_1Tw6uS4088hCzJhbUWoLYgIE" },
  },
  2: {
    A: { 1: "price_1Tw6lT4088hCzJhbFMlRWj9H", 2: "price_1Tw6lT4088hCzJhbmWIRHXNA", 3: "price_1Tw6lT4088hCzJhbqAcBA8Lc" },
    B: { 1: "price_1Tw6lT4088hCzJhbBLLVvi60", 2: "price_1Tw6lT4088hCzJhbuZDLwlSP", 3: "price_1Tw6lT4088hCzJhbaTq27lxI" },
  },
  4: {
    A: { 1: "price_1Tw6yh4088hCzJhb3LNRbUHU", 2: "price_1Tw6yh4088hCzJhbCZB9OSDd", 3: "price_1Tw6yh4088hCzJhby1TeSE3g" },
    B: { 1: "price_1Tw6yh4088hCzJhbUoSnexEC", 2: "price_1Tw6yh4088hCzJhbANZMuprM", 3: "price_1Tw6yh4088hCzJhbfNF3RaJT" },
  },
}
