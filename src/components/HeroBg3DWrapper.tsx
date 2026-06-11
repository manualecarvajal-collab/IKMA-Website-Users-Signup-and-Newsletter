'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const HeroBg3D = dynamic(() => import('@/components/HeroBg3D'), { ssr: false })

function LoadingFallback() {
  return <div className="absolute inset-0 z-0 pointer-events-none" />
}

export default function HeroBg3DWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HeroBg3D />
    </Suspense>
  )
}
