import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { esMembresiaGratisUsuario } from "@/lib/supabase/free-membership"

export async function proxy(request: NextRequest) {
  // Salida temprana para tráfico anónimo.
  //
  // El cliente de Supabase se construía y `auth.getUser()` se llamaba en CADA
  // petición, incluidas las de visitantes sin sesión y las de los crawlers. Eso
  // añadía un round-trip de red a Supabase al camino crítico de páginas
  // públicas que no necesitan saber nada del usuario.
  //
  // Sin cookie de sesión, `getUser()` en servidor devuelve null de todos modos,
  // y la única rama que depende del usuario exige `user`, así que salir aquí no
  // cambia el comportamiento. Con cookie presente se sigue refrescando el token
  // como antes.
  const hasSessionCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"))

  if (!hasSessionCookie) {
    return NextResponse.next()
  }

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
  // Funnel brand-new users to /membresia once — but never trap them: a user who
  // abandons the form without submitting has no solicitud row, so without the
  // cookie every Home click would bounce back to the form start.
  if (user && request.nextUrl.pathname === "/" && !request.cookies.has("membresia_funnel_done")) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("suscripcion_activa, rol")
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

    // Only funnel users with no active subscription, no free membership, no
    // application at all and no admin role (e.g. just confirmed their email).
    if (perfil && perfil.rol !== "administrador" && !perfil.suscripcion_activa && !esFree && !enProceso) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/membresia"
      const response = NextResponse.redirect(redirectUrl)
      response.cookies.set("membresia_funnel_done", "1", {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
      })
      return response
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
