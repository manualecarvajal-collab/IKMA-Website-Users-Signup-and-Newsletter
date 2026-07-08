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
    }

    link.onload = () => {
      link.media = "all"
      document.fonts.ready.then(reveal)
    }

    document.head.appendChild(link)

    setTimeout(reveal, 2000)
  }, [])

  return null
}
