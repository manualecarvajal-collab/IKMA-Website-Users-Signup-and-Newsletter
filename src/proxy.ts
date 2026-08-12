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
  // Redirect users who have NOT started the membership process to /membresia
  // instead — but never trap users who are already mid-process: they can browse
  // the homepage freely and the CTA banner reminds them to finish (incompleta),
  // students wait for review, and paid users await approval.
  if (user && request.nextUrl.pathname === "/") {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("suscripcion_activa")
      .eq("id", user.id)
      .single()
    const esFree = await esMembresiaGratisUsuario(supabase, user.id)

    // Any existing application means the user is "in the process" — let them
    // browse the homepage instead of bouncing them back to the form.
    const { data: solicitud } = await supabase
      .from("solicitudes_membresia")
      .select("estado")
      .eq("usuario_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    const enProceso = !!solicitud

    // Only redirect users with no active subscription, no free membership and no
    // application at all (e.g. just confirmed their email address).
    if (perfil && !perfil.suscripcion_activa && !esFree && !enProceso) {
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
