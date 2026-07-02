'use client'

import { useState, useEffect, useCallback, Children, type ReactNode } from 'react'
import Link from 'next/link'
import ParticleGrid from './ParticleGrid'

interface HeroCarouselProps {
  children: ReactNode
  interval?: number
  isAuthenticated?: boolean
  hideCtas?: boolean
}

export default function HeroCarousel({
  children,
  interval = 10000,
  isAuthenticated = false,
  hideCtas = false,
}: HeroCarouselProps) {
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
    <section className="relative overflow-hidden min-h-[400px] md:min-h-[clamp(450px,55vh,650px)]">
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

      {!hideCtas && (
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none bg-gradient-to-t from-background/60 to-transparent pt-12">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-6 md:pb-8">
            <div className="pointer-events-auto flex flex-row flex-wrap items-center justify-start gap-2 sm:gap-3 mb-[5vh]">
              <Link
                href={isAuthenticated ? '/suscripcion-exito' : '/registro'}
                className="bg-[#334D96] text-white font-[600] text-xs px-6 py-3 rounded-xl hover:bg-[#334D96]/90 transition-all active:scale-95 text-center"
              >
                Support our Mission
              </Link>
              <Link
                href={isAuthenticated ? '/suscripcion-exito' : '/registro'}
                className="border-2 border-[#334D96] text-[#334D96] font-[600] text-xs px-6 py-3 rounded-xl hover:bg-[#334D96]/5 transition-all active:scale-95 text-center"
              >
                Subscribe to our Newsletter
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
