"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Icon from "@/components/Icon"

const REGION_IMGS: Record<string, string> = {
  "latin-america":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBqqSt3_kIThjkIxJ0twfBl5Dcl5wUjys9wVmNNFQNQgeoYGUreG6TK0jflIXY2xucEsxnr6Y9VJJagD_hF_uT3M1VL3kRVu6p4JZRwDpm6aeF7GOIc4JYlEVW8hgxcxhI3bMNyUnfQ9C-N4MsT7-R-eITOKDCM6WjkuoKHuJgyM8G5EbNM_rSfRAyWWIbPSuFR88M2wevMHXtGKXwSGys_cKNNW8TXeQeVSXZkVpRC8lI99CqCrnA",
  "north-america":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC0qiz6rzB5MNoHyW0P4B8ujiwN03vpfXJiSTLq2BXePBBgZFfJ-5AgmthX1bJPXujTowSsEcBJ0c7hJ9DzaCC71vJw9HqTtZ0iBougVWtawSfCw_wcFOhorw2qxOXuL7BbJJqUM5Wb6sMdtdY8C3L99wlqMr84M-7a4FgLPsOXHcInU6drL8XKiKoWuoMNrEnsncPzSX0xRfxtzuf12bBdnZMaoo1-BFlcdKub2irqYpleJOyYyk8",
  africa:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCMYfmZotchEiEgva3M9goi3LYk69qAmyePwoq93CpclB1HJ1g0hrsoRVC-p50ZPAuSTd-3cKNzZXwtUElg2mCWaeiAnqmOFrVM5tUpCSHzdcRAuBCoEl119WAGwg1E7mQ9tdbuLl1fGs-VZ0nAZVxdt9M5ZeoelqiOMewmNOcsdXj6HZ8IXInY1wF8q_FIAtUJwVjpaIduaFlaxp6j1B_KKApkr4YSM-cZvUi6sefQRuZ7FUZ6JkY",
  europe:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDRZC1Dg-oJaYtBSZnQqANgR-WtkYZeaIYOlNqzgYwfPnFVflheExxP-Wov9Y6zRcZKmsCC1i0QLkT-Pi39atXEG8Gn58o4R2hWdMvQsuF-MYXIYitpmHJzPc93oo-MK722BoCIpFJAr_mBpB-4zS_rzSO36Pi_92cHkAicFe4-iJc1PYMgCQ12LaS5h72EqhF3UeBnvBjUkzrRTrW8s4NcLqALtqJFpxrEKleXWYae-_yU-hXqFro",
}

const REGION_LABELS: Record<string, "latinAmerica" | "northAmerica" | "africa" | "europe"> = {
  "latin-america": "latinAmerica",
  "north-america": "northAmerica",
  africa: "africa",
  europe: "europe",
}

type Region = keyof typeof REGION_LABELS
export interface Testimonial {
  name: string
  role: string
  quote: string
  region: Region
  image?: string | null
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

export default function TestimonialsExplorer({ testimonials }: { testimonials: Testimonial[] }) {
  const t = useTranslations("Testimonials")
  const order: Region[] = ["latin-america", "north-america", "africa", "europe"]
  const firstWithData = order.find((r) => testimonials.some((x) => x.region === r))
  const [selected, setSelected] = useState<Region>(firstWithData ?? "latin-america")

  const visible = testimonials.filter((x) => x.region === selected)
  const selectedLabel = t(REGION_LABELS[selected])

  return (
    <section className="w-full py-section-padding px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
      <div className="max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {order.map((id) => {
            const active = id === selected
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                className={
                  "group relative h-64 w-full rounded-lg overflow-hidden focus:outline-none ring-2 transition-all shadow-[0_4px_24px_rgba(26,77,109,0.06)] " +
                  (active ? "ring-primary" : "ring-transparent")
                }
              >
                <div
                  className="absolute inset-0 bg-cover bg-center w-full h-full transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${REGION_IMGS[id]}')` }}
                />
                <div className={"absolute inset-0 transition-colors " + (active ? "bg-primary/10" : "bg-primary/40 group-hover:bg-primary/20")} />
                <div className="absolute inset-x-0 bottom-0 p-margin-mobile bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <span className="font-headline-md text-headline-md text-white font-bold drop-shadow-md">
                    {t(REGION_LABELS[id])}
                  </span>
                </div>
                {active && <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full shadow-sm ring-2 ring-primary" />}
              </button>
            )
          })}
        </div>

        <div className="mt-gutter mb-gutter flex items-center justify-between">
          <h2 className="font-headline-lg text-headline-lg text-primary">{t("storiesFrom", { region: selectedLabel })}</h2>
          <div className="h-px bg-outline-variant flex-grow ml-gutter hidden md:block" />
        </div>

        {visible.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="volunteer_activism" size={60} className="text-on-surface-variant/30 mb-4" />
            <p className="font-body-lg text-body-lg text-on-surface-variant">{t("empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {visible.map((x, i) => (
              <div
                key={`${x.name}-${i}`}
                className="bg-surface-container-lowest rounded-lg p-margin-desktop shadow-[0_4px_24px_rgba(26,77,109,0.06)] relative overflow-hidden flex flex-col h-full border border-surface-container"
              >
                <Icon
                  name="format_quote"
                  size={120}
                  aria-hidden="true"
                  className="absolute top-4 right-4 text-surface-dim opacity-20 -mr-8 -mt-8 select-none"
                />
                <div className="flex-grow z-10">
                  <p className="font-body-lg text-body-lg text-on-surface-variant italic mb-margin-desktop">{x.quote}</p>
                </div>
                <div className="flex items-center mt-auto z-10 pt-gutter border-t border-surface-container-highest">
                  {x.image ? (
                    <img src={x.image} alt={x.name} loading="lazy" className="w-12 h-12 rounded-full object-cover mr-4" />
                  ) : (
                    <span className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container font-label-bold text-label-bold flex items-center justify-center mr-4">
                      {initials(x.name)}
                    </span>
                  )}
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-semibold">{x.name}</h4>
                    <p className="font-label-sm text-label-sm text-secondary">{x.role}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="inline-block px-3 py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm border border-outline-variant">
                      {selectedLabel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
