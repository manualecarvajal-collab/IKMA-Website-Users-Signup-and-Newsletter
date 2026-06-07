import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Our Doctors - IKMA",
  description: "Meet the dedicated medical professionals combining clinical excellence with deep compassion to serve our community.",
}

const BASE = "https://lh3.googleusercontent.com/aida-public/"

export default async function DoctorsPage() {
  const supabase = await createClient()

  // Fallback to static data if DB not available
  const { data: dbDoctors } = await supabase
    .from("doctores")
    .select("*")
    .eq("publicado", true)
    .order("nombre")

  const doctors = dbDoctors && dbDoctors.length > 0 ? dbDoctors : staticDoctors
  const specialties = ["All", ...new Set(doctors.map((d) => d.especialidad_principal))]

  return (
    <>
      <section className="py-section-padding bg-surface-container-low border-b border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h1 className="font-headline-xl text-headline-xl text-primary mb-6">Our Doctors</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Meet the dedicated medical professionals combining clinical excellence with deep compassion to serve our community.
          </p>
        </div>
      </section>

      <section className="py-8 bg-surface border-b border-outline-variant/20 top-20 z-40 shadow-sm">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-wrap gap-4 items-center justify-center md:justify-start">
          <span className="font-label-bold text-label-bold text-on-surface-variant mr-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">filter_list</span>
            Filter by Specialty:
          </span>
          {specialties.map((s) => (
            <button
              key={s}
              className={
                s === "All"
                  ? "bg-primary text-on-primary font-label-bold text-label-bold px-4 py-2 rounded-full shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] transition-all cursor-pointer"
                  : "bg-surface-container text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container font-label-bold text-label-bold px-4 py-2 rounded-full transition-all border border-outline-variant/50 cursor-pointer"
              }
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="py-section-padding">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {doctors.map((doc) => (
              <article
                key={doc.id}
                className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_0_rgba(7,68,105,0.03)] border border-outline-variant/10 hover:-translate-y-1 transition-transform duration-300 flex flex-col group"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container-high relative">
                    <img src={BASE + doc.imagen_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-surface-container-lowest rounded-full p-0.5 shadow-sm">
                      <span className="material-symbols-outlined text-primary text-sm">verified</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-1 group-hover:text-primary transition-colors">
                      {doc.nombre}
                    </h3>
                    <span className="font-label-bold text-label-bold text-tertiary-container bg-tertiary-fixed inline-block px-2 py-0.5 rounded-sm">
                      {doc.especialidad_principal}
                    </span>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-lg mt-auto relative">
                  <span className="material-symbols-outlined text-outline-variant absolute top-3 left-3 opacity-30 text-3xl">
                    format_quote
                  </span>
                  <p className="font-body-md text-body-md text-on-surface-variant italic relative z-10 pl-6">{doc.frase}</p>
                </div>
                <Link
                  href={`/doctores/${doc.id}`}
                  className="mt-6 w-full bg-surface text-primary border border-primary/20 font-label-bold text-label-bold py-3 rounded-lg hover:bg-secondary-container transition-colors group-hover:border-primary block text-center"
                >
                  View Full Profile
                </Link>
              </article>
            ))}
          </div>
          <div className="mt-16 text-center">
            <button className="bg-surface-container-high text-on-surface-variant font-label-bold text-label-bold px-8 py-3 rounded-lg hover:bg-outline-variant/30 transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer">
              Load More Professionals <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

const staticDoctors = [
  { id: 1, nombre: "Dr. Sarah Jenkins", especialidad_principal: "Cardiology", frase: "Healing the physical heart is my medical duty, but bringing peace to the anxious soul is my true calling.", imagen_url: "AB6AXuAEVoMDLvTzpuk46GOo8lj9JgBORU1iZwCf4sWnvtHUko5w8etAQWu5K9UGeKaueOECOKjZGhwHwnEpPpIHJJLppbhavNhCqkN7uDZxfmFzV8wfw2lg2cJLm82aF8qjSvvbZ19gJ6STAhCWjNekq-qGbWm1Lyw6ZL5rowp3w0rek9Mgj1PikNrhA8odQVp9fHNkiUBXDIR6Sugo_HbcjEm-OKFs-8t5lhAWUu-vE18I4afS_Uo-quEmNLDcLO_nba5UlyyaArZp-Wc" },
  { id: 2, nombre: "Dr. Marcus Chen", especialidad_principal: "Pediatrics", frase: "Every child holds a promise for the future. We provide the care they need to realize that promise fully.", imagen_url: "AB6AXuAfGdBCg-iG913EqelruRwaNM-8HyF5Nxj2n9txUYVU0Irx_FUOLiq7_taCXGqo_7iO_NsXe8cKZv_l1EPb58JKfou2LswTqY0_wnvRE_CD0q9YRuZnj9gq_ThAppsyO7rXeYXbs3urywmvmiqBMlhpYL2FnHq1yforqQvuR_b-qnvu-0mP5kHyA2xnRC7GbIqYm5MwkcOPe5iTeePAWTwx9zwNkelV0wkYgxLbVYb1S3P8kBdjkd5wnU6eyz2bxhwn66h4785Sz4k" },
  { id: 3, nombre: "Dr. Elena Rodriguez", especialidad_principal: "Oncology", frase: "Walking alongside families during their toughest battles is a profound privilege. We fight with science and support with faith.", imagen_url: "AB6AXuBvJ_sDLH8kRg-mitYacKkeltAoQ0a1YB1jm2GNDwKcS4quE4CCwkirBnlIXfs-M_A1vAJYGQzmMlSON4VVL9zXuzy2KMj5kTVtWS2DbePBei-wBKDWD4EK35XS1ypWFfvVvp9p_tBwK-AnSZvY7EutSunVCIPMqzJcEXwYPZFHyJCa7PWMHCqI5iuom1cr5ocN9InU_JvTMgAQbfc6oFK9q0Vkp7j-avr7yS6ZGw4IIgwLcnmrXsXRgK2ylFJOxc5GcDP5BwzNbYo" },
  { id: 4, nombre: "Dr. David Osei", especialidad_principal: "Neurology", frase: "The complexity of the human mind is a testament to divine design. I seek to restore balance through rigorous care.", imagen_url: "AB6AXuDaielhLpt8F5ZpHLyNvjXoLQ61P7zmx6A9EmmTvVxBepzlBSul6EywbHpcEKNe96UBHgQKKRbO2IKWvbOvJ_6-4ScK2E9qxAk2O3QK4usubN69vWlEpxbfPbHwKkD6PzwmlHzzCQYHTivRGLJpzn4Z2ynMjM3st4XLteasVZtH7VQMQ6ZzbXJnwvp8jwuXkl811SNs-E6Ov7B3_nKzS9azeZyI_SFz9f7aIpx4EkplIpcJQI3oYOrs838yvNs81yHObkG7OAxZEeU" },
]
