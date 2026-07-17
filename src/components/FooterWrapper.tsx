"use client"

import { usePathname } from "next/navigation"
import Footer from "./Footer"

export default function FooterWrapper() {
  const hidden = usePathname().startsWith("/admin")
  return <div className={hidden ? "hidden" : ""}><Footer /></div>
}
