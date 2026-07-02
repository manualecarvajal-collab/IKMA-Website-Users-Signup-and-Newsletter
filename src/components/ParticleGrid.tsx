'use client'

import { useRef, useEffect, useCallback } from 'react'

function hash(x: number, y: number) {
  let h = x * 374761393 + y * 668265263
  h = (h ^ (h >> 13)) * 1274126177
  return (h ^ (h >> 16)) / 2147483647
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

function dot2(g: number[], x: number, y: number) {
  return g[0] * x + g[1] * y
}

function noise2D(x: number, y: number) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy

  const g00 = [hash(ix, iy) * 2 - 1, hash(ix + 1, iy) * 2 - 1]
  const g10 = [hash(ix + 1, iy) * 2 - 1, hash(ix + 2, iy) * 2 - 1]
  const g01 = [hash(ix, iy + 1) * 2 - 1, hash(ix + 1, iy + 1) * 2 - 1]
  const g11 = [hash(ix + 1, iy + 1) * 2 - 1, hash(ix + 2, iy + 1) * 2 - 1]

  const ux = smoothstep(fx)
  const uy = smoothstep(fy)

  const v00 = dot2(g00, fx, fy)
  const v10 = dot2(g10, fx - 1, fy)
  const v01 = dot2(g01, fx, fy - 1)
  const v11 = dot2(g11, fx - 1, fy - 1)

  return lerp(lerp(v00, v10, ux), lerp(v01, v11, ux), uy)
}

function fbm(x: number, y: number, octaves = 2) {
  let value = 0
  let amplitude = 0.5
  let frequency = 1
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency)
    amplitude *= 0.5
    frequency *= 2
  }
  return value
}

interface Particle {
  ox: number
  oy: number
  vx: number
  vy: number
}

interface ParticleGridProps {
  particleColor?: string
  particleRadius?: number
  gridSpacing?: number
  mouseInfluence?: number
  floatAmplitude?: number
  floatSpeed?: number
}

export default function ParticleGrid({
  particleColor = '#cbd5e1',
  particleRadius = 1.2,
  gridSpacing = 40,
  mouseInfluence = 60,
  floatAmplitude = 1.8,
  floatSpeed = 0.4,
}: ParticleGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const frameRef = useRef(0)

  const initParticles = useCallback(
    (w: number, h: number) => {
      const cols = Math.ceil(w / gridSpacing) + 2
      const rows = Math.ceil(h / gridSpacing) + 2
      const particles: Particle[] = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          particles.push({
            ox: c * gridSpacing,
            oy: r * gridSpacing,
            vx: 0,
            vy: 0,
          })
        }
      }
      particlesRef.current = particles
    },
    [gridSpacing]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = window.innerWidth
      const h = canvas.parentElement?.clientHeight || window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.scale(dpr, dpr)
      initParticles(w, h)
    }

    resize()
    window.addEventListener('resize', resize)

    const onMouse = (e: MouseEvent | TouchEvent) => {
      let clientX: number, clientY: number
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else if ('clientX' in e) {
        clientX = e.clientX
        clientY = e.clientY
      } else {
        return
      }
      mouseRef.current = { x: clientX, y: clientY }
    }

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', onMouse, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave)

    let animId = 0

    const draw = (time: number) => {
      const t = time * 0.001 * floatSpeed
      const w = canvas!.width / (window.devicePixelRatio || 1)
      const h = canvas!.height / (window.devicePixelRatio || 1)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx!.clearRect(0, 0, w, h)

      for (const p of particlesRef.current) {
        const noiseX = fbm(p.ox * 0.008, p.oy * 0.008 + t, 2)
        const noiseY = fbm(p.ox * 0.008 + 100, p.oy * 0.008 + t + 100, 2)

        let dx = noiseX * floatAmplitude
        let dy = noiseY * floatAmplitude

        const dist = Math.hypot(p.ox + dx - mx, p.oy + dy - my)
        if (dist < mouseInfluence && dist > 0) {
          const force = (1 - dist / mouseInfluence) * 1.2
          const angle = Math.atan2(p.oy + dy - my, p.ox + dx - mx)
          dx += Math.cos(angle) * force * 8
          dy += Math.sin(angle) * force * 8
        }

        const x = p.ox + dx
        const y = p.oy + dy

        if (x >= -10 && x <= w + 10 && y >= -10 && y <= h + 10) {
          ctx!.beginPath()
          ctx!.arc(x, y, particleRadius, 0, Math.PI * 2)
          ctx!.fillStyle = particleColor
          ctx!.fill()
        }
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onMouse)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [particleColor, particleRadius, gridSpacing, mouseInfluence, floatAmplitude, floatSpeed, initParticles])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ background: '#ffffff' }}
    />
  )
}
