"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

const HIDDEN_PATHS = [
  "/login",
  "/registro",
  "/verificar-codigo",
  "/membresia",
  "/recuperar",
  "/actualizar-password",
  "/crear-contrasena",
  "/auth",
]

export default function NewsletterCTAVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null
  return <>{children}</>
}
