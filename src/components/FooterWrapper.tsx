"use client"

import { usePathname } from "next/navigation"
import { ReactNode } from "react"

export default function FooterWrapper({ children }: { children: ReactNode }) {
  const hidden = usePathname().startsWith("/admin")
  return <div className={hidden ? "hidden" : ""}>{children}</div>
}
