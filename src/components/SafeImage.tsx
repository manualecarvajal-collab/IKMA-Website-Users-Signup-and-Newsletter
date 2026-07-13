'use client'

import { useState } from 'react'

export function SafeImage({ src, fallback, alt, className }: { src: string; fallback?: string; alt: string; className?: string }) {
  const [imgSrc, setImgSrc] = useState(src)
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => { if (fallback && imgSrc !== fallback) setImgSrc(fallback) }}
    />
  )
}
