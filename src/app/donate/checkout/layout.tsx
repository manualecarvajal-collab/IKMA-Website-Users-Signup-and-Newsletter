import type { Metadata } from "next"
import { noindexSeo } from "@/lib/seo"

/**
 * Ruta de transactional: no debe indexarse.
 * `noindex` va en la meta, no en robots.txt, para que Google pueda leerlo.
 */
export const metadata: Metadata = noindexSeo("Secure checkout - IKMA")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
