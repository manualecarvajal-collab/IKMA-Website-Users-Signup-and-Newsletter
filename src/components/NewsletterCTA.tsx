import { getTranslations } from "next-intl/server"
import Icon from "@/components/Icon"
import NewsletterCTAForm from "./NewsletterCTAForm"

export default async function NewsletterCTA({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (isAuthenticated) return null

  const t = await getTranslations("NewsletterCTA")

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-container">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-on-primary/5 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-container-max px-margin-mobile py-14 md:px-margin-desktop md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-label-bold text-label-sm uppercase tracking-[0.2em] text-on-primary backdrop-blur-sm">
            <Icon name="mail" size={14} />
            {t("eyebrow")}
          </span>
          <h2 className="mt-5 mb-3 font-headline-lg text-headline-lg leading-tight text-on-primary">
            {t("title")}
          </h2>
          <p className="mx-auto mb-8 max-w-xl font-body-lg text-body-lg text-on-primary/90">
            {t("description")}
          </p>
          <NewsletterCTAForm />
          <p className="mt-5 flex flex-wrap items-center justify-center gap-2 font-body-md text-body-md text-on-primary/75">
            <Icon name="verified" size={16} />
            {t("microcopy")}
          </p>
        </div>
      </div>
    </section>
  )
}
