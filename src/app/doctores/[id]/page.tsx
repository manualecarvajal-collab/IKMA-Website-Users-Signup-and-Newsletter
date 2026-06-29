import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

const BASE = "https://lh3.googleusercontent.com/aida-public/"

interface Doctor {
  id: number
  nombre: string
  especialidad_principal: string
  frase: string | null
  acerca_de: string | null
  imagen_url: string | null
  estadisticas: Record<string, string> | null
  rating: number | null
  num_resenas: number | null
  especialidades: string[] | null
  idiomas: string[] | null
  disponibilidad: string | null
  hospital: string | null
  direccion: string | null
  experiencia: { period: string; title: string; org: string; icon: string }[] | null
  educacion: { degree: string; school: string }[] | null
  certificaciones: { cert: string; issuer: string }[] | null
  premios: { title: string; org: string; year: string }[] | null
  testimonios: { name: string; type: string; text: string }[] | null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const doc = await getDoctor(id)
  return {
    title: `${doc?.nombre ?? "Doctor"} - IKMA`,
    description: doc?.acerca_de?.slice(0, 160) ?? "",
  }
}

async function getDoctor(id: string): Promise<Doctor | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("doctores").select("*").eq("id", id).single()
  if (data) return data as Doctor
  return staticDoctors[id as keyof typeof staticDoctors] ?? null
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`material-symbols-outlined text-lg ${i < Math.floor(rating) ? "text-amber-600" : "text-outline-variant"}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      ))}
    </div>
  )
}

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doc = await getDoctor(id)

  if (!doc) return (
    <section className="py-section-padding">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center"><h1 className="font-headline-lg text-headline-lg text-primary">Doctor not found</h1>
      <Link href="/doctores" className="text-primary hover:underline mt-4 inline-block">&larr; Back to Doctors</Link></div>
    </section>
  )

  const icons = ["business", "local_hospital", "school"]
  const stats = doc.estadisticas ?? {}
  const experiencia = doc.experiencia ?? []
  const educacion = doc.educacion ?? []
  const certificaciones = doc.certificaciones ?? []
  const premios = doc.premios ?? []
  const testimonios = doc.testimonios ?? []

  return (
    <main>
      {/* Hero Profile */}
      <section className="py-section-padding bg-surface-container-low border-b border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row gap-gutter md:gap-12 items-start">
            <div className="w-full md:w-80 shrink-0">
              <div className="relative rounded-lg overflow-hidden bg-surface-container-high aspect-[3/4] shadow-[0_0_20px_0_rgba(7,68,105,0.04)]">
                <img src={doc.imagen_url?.startsWith("http") ? doc.imagen_url : BASE + doc.imagen_url} alt={doc.nombre} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 right-3 bg-surface-container-lowest rounded-full p-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>
            </div>
            <div className="flex-1 pt-2">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="font-label-bold text-label-bold text-tertiary-container bg-tertiary-fixed inline-block px-3 py-1 rounded-sm">{doc.especialidad_principal}</span>
                <span className="flex items-center gap-1 font-label-bold text-label-bold text-primary">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified Professional
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md text-primary mb-2">{doc.nombre}</h1>
              {doc.rating && (
                <div className="flex items-center gap-1 mb-3">
                  <Stars rating={doc.rating} />
                  <span className="font-body-md text-body-md text-on-surface-variant ml-1">{doc.rating} ({doc.num_resenas ?? 0} reviews)</span>
                </div>
              )}
              {doc.frase && (
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-6 leading-relaxed">{doc.frase}</p>
              )}
              <div className="flex flex-wrap gap-4">
                <button className="bg-secondary-container text-primary font-label-bold text-label-bold px-8 py-3 rounded-md hover:bg-secondary-fixed transition-all inline-flex items-center gap-2 cursor-pointer">
                  <span className="material-symbols-outlined text-sm">mail</span> Email Consult
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      {Object.keys(stats).length > 0 && (
        <section className="bg-primary">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: stats.experience, label: "Years Experience" },
                { value: stats.patients, label: "Patients Treated" },
                { value: stats.awards, label: "Awards & Honors" },
                { value: stats.publications, label: "Publications" },
              ].map((s, i) => (
                <div key={i}>
                  <p className="font-headline-lg text-headline-lg text-primary-fixed font-bold">{s.value || "—"}</p>
                  <p className="font-label-bold text-label-bold text-primary-fixed/70 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About + Experience + Awards */}
      <section className="py-section-padding">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-12">
          {doc.acerca_de && (
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">person</span> About
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">{doc.acerca_de}</p>
            </div>
          )}

          {experiencia.length > 0 && (
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">work_history</span> Professional Experience
              </h2>
              <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/50">
                {experiencia.map((e, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center shrink-0 z-10">
                      <span className="material-symbols-outlined text-primary text-lg">{e.icon || icons[i] || "business"}</span>
                    </div>
                    <div className="bg-surface-container-low rounded-md p-8 flex-1">
                      <p className="font-label-bold text-label-bold text-tertiary-container">{e.period}</p>
                      <p className="font-headline-md text-headline-md text-primary mt-1">{e.title}</p>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1">{e.org}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {premios.length > 0 && (
            <div className="bg-surface-container-low rounded-md p-8 md:p-8">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">award_star</span> Awards & Recognition
              </h2>
              <div className="space-y-4">
                {premios.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600 text-xl">emoji_events</span>
                    <div>
                      <p className="font-headline-md text-headline-md text-on-surface">{a.title}</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">{a.org} — {a.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Education & Certifications */}
      {(educacion.length > 0 || certificaciones.length > 0) && (
        <section className="py-section-padding bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-8 text-center flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-primary">school</span> Education & Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter max-w-3xl mx-auto">
              {educacion.length > 0 && (
                <div className="bg-surface-container-lowest rounded-md p-8 shadow-[0_0_20px_0_rgba(7,68,105,0.04)]">
                  <h3 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">school</span> Education
                  </h3>
                  <ul className="space-y-4">
                    {educacion.map((e, i) => (
                      <li key={i} className="flex items-start gap-3 font-body-md text-body-md text-on-surface-variant">
                        <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-primary text-sm">school</span>
                        </div>
                        <div>
                          <p className="font-body-md text-body-md text-on-surface font-semibold">{e.degree}</p>
                          <p className="text-on-surface-variant">{e.school}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {certificaciones.length > 0 && (
                <div className="bg-surface-container-lowest rounded-md p-8 shadow-[0_0_20px_0_rgba(7,68,105,0.04)]">
                  <h3 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">verified</span> Certifications
                  </h3>
                  <ul className="space-y-4">
                    {certificaciones.map((c, i) => (
                      <li key={i} className="flex items-start gap-3 font-body-md text-body-md text-on-surface-variant">
                        <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                        <div>
                          <p className="font-body-md text-body-md text-on-surface font-semibold">{c.cert}</p>
                          <p className="text-on-surface-variant">{c.issuer}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonios.length > 0 && (
        <section className="py-section-padding">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2 text-center">What Patients Say</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant text-center mb-10 max-w-xl mx-auto">Hear from those who have experienced care firsthand.</p>
          </div>
          <div className="bg-secondary-container py-16 md:py-20">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {testimonios.map((t, i) => (
                  <div key={i} className="text-center px-4 md:px-8 py-8">
                    <span className="material-symbols-outlined text-primary/15 text-5xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                    <div className="flex items-center justify-center gap-1 text-amber-600 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="font-headline-md text-headline-md text-primary leading-snug mb-6">&ldquo;{t.text}&rdquo;</p>
                    <p className="font-label-bold text-label-bold text-on-primary-fixed-variant">— {t.name}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{t.type}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-section-padding">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="bg-primary rounded-xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary-fixed font-bold mb-4 relative z-10">Want to make a donation?</h2>
            <p className="font-body-lg text-body-lg text-primary-fixed/80 mb-8 max-w-lg mx-auto relative z-10">Your generosity brings expert medical care to communities that need it most.</p>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <a className="inline-flex items-center gap-2 bg-white text-primary font-label-bold text-label-bold px-6 py-3 rounded-xl hover:bg-primary-fixed transition-all shadow-[0_0_20px_0_rgba(7,68,105,0.04)]" href="#">Support Now</a>
              <Link className="inline-flex items-center gap-2 bg-primary-container text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-xl hover:bg-primary transition-all" href="/doctores">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Back to All Doctors
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

const staticDoctors: Record<string, Doctor> = {
  "1": {
    id: 1, nombre: "Dr. Sarah Jenkins", especialidad_principal: "Cardiology",
    frase: "\"Healing the physical heart is my medical duty, but bringing peace to the anxious soul is my true calling.\"",
    acerca_de: "Dr. Sarah Jenkins is a board-certified cardiologist with over 15 years of experience in interventional cardiology. She completed her medical degree at Johns Hopkins University and her fellowship at the Mayo Clinic. Dr. Jenkins is dedicated to combining cutting-edge cardiac care with compassionate patient relationships.",
    imagen_url: "AB6AXuAEVoMDLvTzpuk46GOo8lj9JgBORU1iZwCf4sWnvtHUko5w8etAQWu5K9UGeKaueOECOKjZGhwHwnEpPpIHJJLppbhavNhCqkN7uDZxfmFzV8wfw2lg2cJLm82aF8qjSvvbZ19gJ6STAhCWjNekq-qGbWm1Lyw6ZL5rowp3w0rek9Mgj1PikNrhA8odQVp9fHNkiUBXDIR6Sugo_HbcjEm-OKFs-8t5lhAWUu-vE18I4afS_Uo-quEmNLDcLO_nba5UlyyaArZp-Wc",
    estadisticas: { experience: "15+", patients: "10,000+", awards: "12", publications: "45+" },
    rating: 4.8, num_resenas: 128,
    especialidades: ["Cardiology", "Interventional Cardiology", "Preventive Cardiology"],
    idiomas: ["English", "Spanish"],
    disponibilidad: "Monday — Friday, 8:00 AM — 4:00 PM",
    hospital: "IKMA Heart Institute",
    direccion: "123 Healing Way, Suite 400, New York, NY 10001",
    experiencia: [{ period: "2018 — Present", title: "Chief of Cardiology", org: "IKMA Heart Institute", icon: "business" }, { period: "2012 — 2018", title: "Senior Cardiologist", org: "Mercy Medical Center", icon: "local_hospital" }, { period: "2008 — 2012", title: "Resident Physician", org: "University Teaching Hospital", icon: "school" }],
    educacion: [{ degree: "Doctor of Medicine", school: "Johns Hopkins University" }, { degree: "Internal Medicine Residency", school: "Mayo Clinic" }, { degree: "Cardiology Fellowship", school: "Cleveland Clinic" }],
    certificaciones: [{ cert: "Board Certified — Cardiology", issuer: "American Board of Internal Medicine" }, { cert: "Advanced Cardiac Life Support", issuer: "American Heart Association" }, { cert: "Medical License", issuer: "State Medical Board of New York" }],
    premios: [{ title: "Excellence in Cardiac Care Award", org: "International Medical Association", year: "2023" }, { title: "Top Physician Honor", org: "Healthcare Leadership Forum", year: "2021" }, { title: "Compassionate Care Recognition", org: "IKMA Foundation", year: "2020" }],
    testimonios: [{ name: "Maria G.", type: "Cardiology Patient", text: "Dr. Jenkins transformed my life with her care. She took the time to explain every step of my treatment plan." }, { name: "Robert K.", type: "Heart Surgery Patient", text: "The team at IKMA is exceptional. Dr. Jenkins brought both expertise and genuine compassion to my care." }, { name: "Sarah T.", type: "Preventive Care Patient", text: "From the first consultation to follow-up, every interaction was professional, warm, and thorough." }],
  },
  "2": {
    id: 2, nombre: "Dr. Marcus Chen", especialidad_principal: "Pediatrics",
    frase: "\"Every child holds a promise for the future. We provide the care they need to realize that promise fully.\"",
    acerca_de: "Dr. Marcus Chen is a compassionate pediatrician specializing in adolescent medicine and developmental pediatrics. He earned his medical degree from Stanford University and completed his residency at Boston Children's Hospital.",
    imagen_url: "AB6AXuAfGdBCg-iG913EqelruRwaNM-8HyF5Nxj2n9txUYVU0Irx_FUOLiq7_taCXGqo_7iO_NsXe8cKZv_l1EPb58JKfou2LswTqY0_wnvRE_CD0q9YRuZnj9gq_ThAppsyO7rXeYXbs3urywmvmiqBMlhpYL2FnHq1yforqQvuR_b-qnvu-0mP5kHyA2xnRC7GbIqYm5MwkcOPe5iTeePAWTwx9zwNkelV0wkYgxLbVYb1S3P8kBdjkd5wnU6eyz2bxhwn66h4785Sz4k",
    estadisticas: { experience: "12+", patients: "8,000+", awards: "8", publications: "20+" },
    rating: 4.9, num_resenas: 156,
    especialidades: ["Pediatrics", "Adolescent Medicine", "Developmental Pediatrics"],
    idiomas: ["English", "Mandarin"],
    disponibilidad: "Monday — Friday, 9:00 AM — 5:00 PM",
    hospital: "IKMA Children's Center",
    direccion: "456 Wellness Ave, Suite 200, New York, NY 10002",
    experiencia: [{ period: "2019 — Present", title: "Lead Pediatrician", org: "IKMA Children's Center", icon: "business" }, { period: "2013 — 2019", title: "Staff Pediatrician", org: "Boston Children's Hospital", icon: "local_hospital" }, { period: "2009 — 2013", title: "Pediatric Resident", org: "Boston Children's Hospital", icon: "school" }],
    educacion: [{ degree: "Doctor of Medicine", school: "Stanford University" }, { degree: "Pediatric Residency", school: "Boston Children's Hospital" }, { degree: "Adolescent Medicine Fellowship", school: "UCSF Benioff Children's Hospital" }],
    certificaciones: [{ cert: "Board Certified — Pediatrics", issuer: "American Board of Pediatrics" }, { cert: "Neonatal Resuscitation Program", issuer: "American Academy of Pediatrics" }, { cert: "Pediatric Advanced Life Support", issuer: "American Heart Association" }],
    premios: [{ title: "Excellence in Pediatric Care Award", org: "American Academy of Pediatrics", year: "2023" }, { title: "Community Health Champion", org: "IKMA Foundation", year: "2021" }, { title: "Outstanding Educator Award", org: "Medical Teachers Association", year: "2019" }],
    testimonios: [{ name: "Lisa M.", type: "Parent", text: "Dr. Chen is amazing with kids. My daughter actually looks forward to her checkups now!" }, { name: "James P.", type: "Adolescent Patient", text: "Dr. Chen made me feel comfortable talking about things I was nervous about." }, { name: "Amanda R.", type: "Parent", text: "The care and patience Dr. Chen shows is remarkable. Highly recommend." }],
  },
  "3": {
    id: 3, nombre: "Dr. Elena Rodriguez", especialidad_principal: "Oncology",
    frase: "\"Walking alongside families during their toughest battles is a profound privilege. We fight with science and support with faith.\"",
    acerca_de: "Dr. Elena Rodriguez is a medical oncologist specializing in breast cancer and hematologic malignancies. She received her training at MD Anderson Cancer Center and is committed to holistic, patient-centered cancer care.",
    imagen_url: "AB6AXuBvJ_sDLH8kRg-mitYacKkeltAoQ0a1YB1jm2GNDwKcS4quE4CCwkirBnlIXfs-M_A1vAJYGQzmMlSON4VVL9zXuzy2KMj5kTVtWS2DbePBei-wBKDWD4EK35XS1ypWFfvVvp9p_tBwK-AnSZvY7EutSunVCIPMqzJcEXwYPZFHyJCa7PWMHCqI5iuom1cr5ocN9InU_JvTMgAQbfc6oFK9q0Vkp7j-avr7yS6ZGw4IIgwLcnmrXsXRgK2ylFJOxc5GcDP5BwzNbYo",
    estadisticas: { experience: "18+", patients: "7,500+", awards: "15", publications: "60+" },
    rating: 4.9, num_resenas: 198,
    especialidades: ["Oncology", "Hematology", "Breast Cancer"],
    idiomas: ["English", "Portuguese", "Spanish"],
    disponibilidad: "Monday — Friday, 8:30 AM — 4:30 PM",
    hospital: "IKMA Cancer Center",
    direccion: "789 Hope Boulevard, New York, NY 10003",
    experiencia: [{ period: "2017 — Present", title: "Senior Oncologist", org: "IKMA Cancer Center", icon: "business" }, { period: "2011 — 2017", title: "Staff Oncologist", org: "MD Anderson Cancer Center", icon: "local_hospital" }, { period: "2007 — 2011", title: "Oncology Fellow", org: "MD Anderson Cancer Center", icon: "school" }],
    educacion: [{ degree: "Doctor of Medicine", school: "University of Texas Southwestern" }, { degree: "Internal Medicine Residency", school: "Brigham and Women's Hospital" }, { degree: "Hematology-Oncology Fellowship", school: "MD Anderson Cancer Center" }],
    certificaciones: [{ cert: "Board Certified — Oncology", issuer: "American Board of Internal Medicine" }, { cert: "Hematology Certification", issuer: "American Board of Pathology" }, { cert: "Chemotherapy Provider", issuer: "ASCO" }],
    premios: [{ title: "Women in Medicine Leadership Award", org: "Healthcare Women's Alliance", year: "2023" }, { title: "Excellence in Clinical Research", org: "ASCO", year: "2021" }, { title: "Compassionate Caregiver Award", org: "IKMA Foundation", year: "2020" }],
    testimonios: [{ name: "Patricia L.", type: "Breast Cancer Survivor", text: "Dr. Rodriguez gave me hope when I needed it most. Her expertise and warmth carried me through treatment." }, { name: "Michael D.", type: "Lymphoma Patient", text: "She explained everything clearly and involved me in every decision. Truly exceptional care." }, { name: "Carmen V.", type: "Family Caregiver", text: "Dr. Rodriguez supported not just my mother, but our entire family. We are forever grateful." }],
  },
  "4": {
    id: 4, nombre: "Dr. David Osei", especialidad_principal: "Neurology",
    frase: "\"The complexity of the human mind is a testament to divine design. I seek to restore balance through rigorous care.\"",
    acerca_de: "Dr. David Osei is a neurologist with expertise in epilepsy and neurodegenerative disorders. He completed his medical training at the University of Ghana and his fellowship at the Cleveland Clinic.",
    imagen_url: "AB6AXuDaielhLpt8F5ZpHLyNvjXoLQ61P7zmx6A9EmmTvVxBepzlBSul6EywbHpcEKNe96UBHgQKKRbO2IKWvbOvJ_6-4ScK2E9qxAk2O3QK4usubN69vWlEpxbfPbHwKkD6PzwmlHzzCQYHTivRGLJpzn4Z2ynMjM3st4XLteasVZtH7VQMQ6ZzbXJnwvp8jwuXkl811SNs-E6Ov7B3_nKzS9azeZyI_SFz9f7aIpx4EkplIpcJQI3oYOrs838yvNs81yHObkG7OAxZEeU",
    estadisticas: { experience: "20+", patients: "12,000+", awards: "10", publications: "35+" },
    rating: 4.7, num_resenas: 142,
    especialidades: ["Neurology", "Epilepsy", "Neurodegenerative Disorders"],
    idiomas: ["English", "Twi", "French"],
    disponibilidad: "Monday — Friday, 9:00 AM — 5:00 PM",
    hospital: "IKMA Neuroscience Institute",
    direccion: "321 Brain Science Drive, New York, NY 10004",
    experiencia: [{ period: "2016 — Present", title: "Chief of Neurology", org: "IKMA Neuroscience Institute", icon: "business" }, { period: "2010 — 2016", title: "Neurologist", org: "Cleveland Clinic", icon: "local_hospital" }, { period: "2006 — 2010", title: "Neurology Resident", org: "Cleveland Clinic", icon: "school" }],
    educacion: [{ degree: "Doctor of Medicine", school: "University of Ghana" }, { degree: "Internal Medicine Residency", school: "Korle Bu Teaching Hospital" }, { degree: "Neurology Fellowship", school: "Cleveland Clinic" }],
    certificaciones: [{ cert: "Board Certified — Neurology", issuer: "American Board of Psychiatry and Neurology" }, { cert: "Epilepsy Specialist", issuer: "National Association of Epilepsy Centers" }, { cert: "Neurocritical Care", issuer: "United Council for Neurologic Subspecialties" }],
    premios: [{ title: "Global Health Impact Award", org: "World Neurology Foundation", year: "2023" }, { title: "Excellence in Epilepsy Care", org: "Epilepsy Foundation", year: "2021" }, { title: "Humanitarian Service Award", org: "IKMA Foundation", year: "2019" }],
    testimonios: [{ name: "David A.", type: "Epilepsy Patient", text: "Dr. Osei helped me gain control of my seizures when other doctors had given up. A true gift." }, { name: "Grace N.", type: "Parkinson's Caregiver", text: "His patience and deep knowledge made such a difference for my husband's quality of life." }, { name: "Samuel K.", type: "Neurology Patient", text: "Dr. Osei takes time to listen and truly understands. Best neurologist I've ever seen." }],
  },
}
