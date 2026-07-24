import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Without middleware, requestLocale is undefined — read cookie directly
  if (!locale || !routing.locales.includes(locale as "en" | "es")) {
    const cookieStore = await cookies()
    locale = cookieStore.get("NEXT_LOCALE")?.value
  }

  if (!locale || !routing.locales.includes(locale as "en" | "es")) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
