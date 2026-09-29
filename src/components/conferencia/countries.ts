/**
 * Lista de países para el select de inscripción.
 *
 * Se guardan códigos ISO 3166-1 alpha-2 (estables e independientes del
 * idioma) y los nombres para mostrar se resuelven con `Intl.DisplayNames`,
 * así que se traducen solos según el locale activo y no hay que mantener
 * un listado de nombres en i18n.
 */

export const COUNTRY_CODES: string[] = [
  "AF","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BH","BD","BB","BY",
  "BE","BZ","BJ","BT","BO","BA","BW","BR","BN","BG","BF","BI","CV","KH","CM","CA",
  "CF","TD","CL","CN","CO","KM","CG","CD","CR","CI","HR","CU","CY","CZ","DK","DJ",
  "DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FJ","FI","FR","GA","GM","GE",
  "DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IR","IQ",
  "IE","IL","IT","JM","JP","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB",
  "LS","LR","LY","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX",
  "FM","MD","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG",
  "MK","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PL","PT","QA","RO","RU",
  "RW","KN","LC","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SK","SI","SB",
  "SO","ZA","SS","ES","LK","SD","SR","SE","CH","SY","TW","TJ","TZ","TH","TL","TG",
  "TO","TT","TN","TR","TM","TV","UG","UA","AE","GB","US","UY","UZ","VU","VA","VE",
  "VN","YE","ZM","ZW",
]

const nameCache = new Map<string, Intl.DisplayNames>()

function displayNames(locale: string): Intl.DisplayNames | null {
  const cached = nameCache.get(locale)
  if (cached) return cached
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" })
    nameCache.set(locale, dn)
    return dn
  } catch {
    return null
  }
}

/** Nombre del país en el idioma pedido; cae al código si no hay datos. */
export function countryName(code: string, locale: string): string {
  return displayNames(locale)?.of(code) ?? code
}

/** Lista de { code, name } ordenada alfabéticamente por nombre. */
export function countryOptions(locale: string): { code: string; name: string }[] {
  return COUNTRY_CODES.map((code) => ({ code, name: countryName(code, locale) })).sort(
    (a, b) => a.name.localeCompare(b.name, locale)
  )
}
