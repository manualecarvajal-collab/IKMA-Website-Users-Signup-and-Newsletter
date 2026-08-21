export function formatDate(
  dateStr: string | Date,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
): string {
  return new Date(dateStr).toLocaleDateString(locale, options)
}
