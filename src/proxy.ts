import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { esMembresiaGratisUsuario } from "@/lib/supabase/free-membership"

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // After email confirmation, Supabase redirects to homepage.
  // Redirect new users to /membresia instead.
  if (user && request.nextUrl.pathname === "/") {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("suscripcion_activa")
      .eq("id", user.id)
      .single()
    const esFree = await esMembresiaGratisUsuario(supabase, user.id)

    // If user has no active subscription and no free membership, send them to membership page
    if (perfil && !perfil.suscripcion_activa && !esFree) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/membresia"
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
