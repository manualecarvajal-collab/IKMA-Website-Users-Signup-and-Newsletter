import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import Icon from "@/components/Icon"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Application Received - IKMA",
}

export default async function GraciasPage() {
  const t = await getTranslations("StudentMembership")
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <section className="py-section-padding">
      <div className="max-w-xl mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <div className="bg-surface rounded-3xl border border-outline-variant/30 shadow-md p-8 md:p-12">
          <Icon name="hourglass_empty" size={60} className="text-amber-600 mb-4" />
          <h1 className="font-headline-lg text-headline-lg text-primary mb-3">{t("thanksTitle")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-2 leading-relaxed">
            {t("thanksDesc")}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant/70">{t("emailSent")}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/"
              className="bg-primary text-on-primary font-label-bold text-label-bold px-8 py-3.5 rounded-lg hover:bg-primary/90 transition-all"
            >
              {t("backHome")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
