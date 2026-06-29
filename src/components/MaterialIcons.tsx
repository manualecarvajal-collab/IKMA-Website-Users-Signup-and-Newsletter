"use client"

import { useEffect } from "react"

export default function MaterialIcons() {
  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
    link.media = "print"

    const reveal = () => {
      document.documentElement.classList.add("fonts-ready")
      link.media = "all"
    }

    link.onload = reveal
    document.head.appendChild(link)

    document.fonts.ready.then(reveal)

    setTimeout(reveal, 3000)
  }, [])

  return null
}
