'use client'

import { useState, useEffect, useCallback, Children, type ReactNode } from 'react'
import Link from 'next/link'
import { useTranslations } from "next-intl"
import ParticleGrid from './ParticleGrid'
import { useSession } from "@/lib/supabase/use-session"

interface HeroCarouselProps {
  children: ReactNode
  interval?: number
  hideCtas?: boolean
}

export default function HeroCarousel({
  children,
  interval = 6000,
  hideCtas = false,
}: HeroCarouselProps) {
  const t = useTranslations("Hero")
  const user = useSession()
  const slides = Children.toArray(children)
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [next, interval, slides.length])

  return (
    <section className="relative overflow-hidden h-[100dvh] md:min-h-[clamp(450px,55vh,650px)] md:h-auto">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ParticleGrid />
      </div>
      {slides.map((slide, index) => (
        <div
          key={index}
          role="group"
          aria-hidden={index !== current}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {slide}
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-28 md:bottom-6 left-0 right-0 z-30 pointer-events-none flex items-center justify-center md:justify-end px-margin-mobile md:px-margin-desktop">
          <div className="pointer-events-auto hidden md:flex items-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                aria-label={`Banner ${index + 1}`}
                className={`h-4 flex items-center justify-center transition-all ${
                  index === current ? "w-6" : "w-4"
                }`}
              >
                <span
                  className={`h-2.5 rounded-full transition-all ${
                    index === current
                      ? "w-6 bg-primary"
                      : "w-2.5 bg-primary/30 hover:bg-primary/60"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {!hideCtas && (
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none bg-white md:bg-transparent md:bg-gradient-to-t md:from-background/60 md:to-transparent py-6 md:py-0">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-0 md:pb-8">
            <div className="md:hidden pointer-events-auto flex flex-row gap-3 w-full">
              <Link
                href="/donate"
                className="flex-1 bg-primary text-on-primary font-bold text-sm py-3 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-sm"
              >
                {t("give")}
              </Link>
              <Link
                href="/membresia"
                className="flex-1 border-2 border-primary text-primary font-bold text-sm py-3 rounded-xl text-center active:scale-95 transition-all"
              >
                {user ? t("changeMembership") : t("newsletter")}
              </Link>
            </div>
            <div className="pointer-events-auto hidden md:flex md:flex-row md:flex-wrap items-center justify-start gap-2 sm:gap-3 mb-[2.5vh]">
              <Link
                href="/donate"
                className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all active:scale-95 text-center"
              >
                {t("supportMission")}
              </Link>
              <Link
                href="/membresia"
                className="border-2 border-primary text-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary/5 transition-all active:scale-95 text-center"
              >
                {user ? t("changeMembership") : t("subscribeNewsletter")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export function Slide({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative w-full h-full flex flex-col items-center ${className}`}>
      {children}
    </div>
  )
}
