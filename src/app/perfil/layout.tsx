import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { noindexSeo } from "@/lib/seo"

/**
 * Ruta privada: no debe indexarse.
 * `noindex` va en la meta, no en robots.txt, para que Google pueda leerlo.
 */
export const metadata: Metadata = noindexSeo("My profile - IKMA")

export default async function PerfilLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return <>{children}</>
}