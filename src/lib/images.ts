export function resizeImg(url: string | null, w: number): string {
  if (!url) return ""
  if (!url.includes("supabase.co")) return url
  try {
    const u = new URL(url)
    // replace /object/public/ with /render/image/public/ for Supabase's
    // built-in resizing (requires Image Transformations add-on; falls
    // through to the original URL if the endpoint returns a 404/error)
    return u.origin + u.pathname.replace("/object/public/", "/render/image/public/") +
      `?width=${w}&quality=80`
  } catch {
    return url
  }
}
