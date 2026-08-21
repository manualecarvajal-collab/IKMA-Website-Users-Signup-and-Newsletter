export function slugify(text: string | null | undefined): string {
  if (!text) return `articulo-${Date.now()}`
  return (
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove diacritics (á → a)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || `articulo-${Date.now()}`
  )
}
