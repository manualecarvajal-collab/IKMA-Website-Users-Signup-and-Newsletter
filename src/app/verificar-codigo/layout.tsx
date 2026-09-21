import type { Metadata } from "next"
import { noindexSeo } from "@/lib/seo"

/**
 * Ruta de auth: no debe indexarse.
 * `noindex` va en la meta, no en robots.txt, para que Google pueda leerlo.
 */
export const metadata: Metadata = noindexSeo("Verify code - IKMA")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
