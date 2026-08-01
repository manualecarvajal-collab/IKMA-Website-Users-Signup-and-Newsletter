import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const isDelete = (options.maxAge ?? 0) <= 0 || value === ""
            cookieStore.set(name, value, {
              ...options,
              ...(isDelete ? {} : { maxAge: SESSION_MAX_AGE }),
              sameSite: "lax",
            })
          })
        },
      },
    }
  )
}

export async function createAdminClient() {
  const { createClient } = await import("@supabase/supabase-js")
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
