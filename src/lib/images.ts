export function resizeImg(url: string | null, w: number): string {
  if (!url) return ""
  if (!url.includes("supabase.co")) return url
  try {
    const u = new URL(url)
    return u.origin + u.pathname.replace("/object/public/", "/render/image/public/") +
      `?width=${w}&quality=80`
  } catch {
    return url
  }
}
