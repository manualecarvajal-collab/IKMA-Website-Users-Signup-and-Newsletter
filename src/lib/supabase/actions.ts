"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signup(prevState: { error?: string; success?: string } | undefined, formData: FormData) {
  const supabase = await createClient()

  const nombre_completo = formData.get("nombre_completo") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return { error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre_completo },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user && !data.session) {
    return {
      success: "Account created! Check your email for a confirmation link before signing in.",
    }
  }

  revalidatePath("/", "layout")
  return { success: "ok" }
}

export async function login(prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  return { success: true }
}
