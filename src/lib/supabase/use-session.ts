"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface SessionUser {
  email: string
  role: string
}

// Lightweight client-side session hook. Reads the session from local storage
// (no server roundtrip) and keeps the UI in sync via onAuthStateChange.
export function useSession(): SessionUser | null {
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    const loadUser = (userId: string, email: string) => {
      supabase
        .from("perfiles")
        .select("rol")
        .eq("id", userId)
        .single()
        .then(({ data }) => {
          if (active) setUser({ email, role: data?.rol ?? "lector" })
        })
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (session) loadUser(session.user.id, session.user.email ?? "")
      else setUser(null)
    })

    // ponytail: no await inside this callback. supabase-js awaits every
    // onAuthStateChange handler during client init (_recoverAndRefresh ->
    // _notifyAllSubscribers), and a query here calls getSession() which waits
    // on the same pending initializePromise -> circular deadlock that poisons
    // the shared client (login page stuck on "checking session" after signout).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadUser(session.user.id, session.user.email ?? "")
      else setUser(null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return user
}
