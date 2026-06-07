"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signup(prevState: { error?: string; success?: string } | undefined, formData: FormData) {
  const supabase = await createClient()

  const nombre_completo = formData.get("nombre_completo") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

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

  // If user was created but not automatically signed in (email confirmation required)
  if (data.user && !data.session) {
    return {
      success: "Account created! Check your email for a confirmation link before signing in.",
    }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function login(prevState: { error?: string } | undefined, formData: FormData) {
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
  redirect("/")
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
