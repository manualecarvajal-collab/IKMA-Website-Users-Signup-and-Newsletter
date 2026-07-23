import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale already reads NEXT_LOCALE cookie + Accept-Language header
  let locale = await requestLocale

  // Backward compat: check googtrans cookie for legacy users
  if (!locale || !routing.locales.includes(locale as "en" | "es")) {
    try {
      const cookieStore = await cookies()
      const googtrans = cookieStore.get("googtrans")?.value
      const match = googtrans?.match(/\/[a-z-]+\/([a-z-]{2,5})/)
      if (match && (match[1] === "en" || match[1] === "es")) {
        locale = match[1]
      }
    } catch {
      // cookies() not available during static generation
    }
  }

  if (!locale || !routing.locales.includes(locale as "en" | "es")) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
