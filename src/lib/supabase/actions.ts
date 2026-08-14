"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signup(
  prevState: { error?: string; success?: string; next?: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient()

  const nombre_completo = formData.get("nombre_completo") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const tipo = (formData.get("tipo") as string) ?? ""
  const region = (formData.get("region") as string) ?? ""

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return { error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const redirectParams = new URLSearchParams({ step: "2" })
  if (tipo) redirectParams.set("tipo", tipo)
  if (region) redirectParams.set("region", region)
  const studentNext = tipo === "3" ? "/membresia/estudiante" : null

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre_completo },
      emailRedirectTo: studentNext
        ? `${siteUrl}${studentNext}`
        : `${siteUrl}/membresia?${redirectParams.toString()}`,
    },
  })

  if (error) {
    if (error.code === "user_already_exists" || /already registered|email taken/i.test(error.message)) {
      return { error: "This email is already registered. Please sign in." }
    }
    return { error: error.message }
  }

  // Supabase returns a user with no identities when the email already exists
  if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
    return { error: "This email is already registered. Please sign in." }
  }

  if (data.user && !data.session) {
    const params = new URLSearchParams({ flow: "signup", email })
    if (tipo) params.set("tipo", tipo)
    if (region) params.set("region", region)
    redirect(`/verificar-codigo?${params.toString()}`)
  }

  revalidatePath("/", "layout")
  return {
    success: "ok",
    next: studentNext ?? `/membresia?step=2&tipo=${tipo}&region=${region || "A"}`,
  }
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

export async function resetPassword(prevState: { error?: string; success?: string } | undefined, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/actualizar-password?flow=recovery`,
  })

  if (error) return { error: error.message }
  redirect(`/verificar-codigo?email=${encodeURIComponent(email)}`)
}

export async function solicitarCodigoNewsletter(prevState: { error?: string } | undefined, formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get("email") as string)?.trim()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })

  if (error) {
    console.error("[solicitarCodigoNewsletter] signInWithOtp error:", error.message)
    return { error: error.message }
  }

  redirect(`/verificar-codigo?email=${encodeURIComponent(email)}&flow=newsletter`)
}

export async function verificarCodigo(prevState: { error?: string } | undefined, formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get("email") as string)?.trim().toLowerCase()
  // Sanitize: strip any non-digit characters (emails sometimes wrap/pad the code)
  const token = (formData.get("token") as string)?.replace(/[^0-9]/g, "")
  const flow = (formData.get("flow") as string) || "recovery"
  const tipo = (formData.get("tipo") as string) ?? ""
  const region = (formData.get("region") as string) ?? ""

  if (!email || !token) {
    return { error: "Enter your email and the code from the email." }
  }

  // OTP flows that use signInWithOtp may be verified as type "email" or "signup"
  const verifyOtp = async (): Promise<string | null> => {
    const { error: emailError } = await supabase.auth.verifyOtp({ email, token, type: "email" })
    if (!emailError) return null
    const { error: signupError } = await supabase.auth.verifyOtp({ email, token, type: "signup" })
    if (signupError) {
      console.error("[verificarCodigo] verifyOtp error:", emailError.message, signupError.message)
      return emailError.message
    }
    return null
  }

  if (flow === "signup") {
    const error = await verifyOtp()
    if (error) return { error }

    // Student applications go straight to the student form (manual review)
    if (tipo === "3") redirect("/membresia/estudiante")

    const params = new URLSearchParams({ step: "2" })
    if (tipo) params.set("tipo", tipo)
    if (region) params.set("region", region)
    redirect(`/membresia?${params.toString()}`)
  }

  if (flow === "newsletter") {
    const error = await verifyOtp()
    if (error) return { error }

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error("[verificarCodigo] getUser error:", userError.message)
      return { error: userError.message }
    }

    const justCreated =
      userData.user && Date.now() - new Date(userData.user.created_at).getTime() < 30 * 60 * 1000

    if (justCreated) {
      redirect(`/crear-contrasena?email=${encodeURIComponent(email)}`)
    }
    redirect("/newsletter")
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "recovery",
  })

  if (error) {
    console.error("[verificarCodigo] verifyOtp error:", error.message)
    return { error: error.message }
  }

  redirect("/actualizar-password")
}

export async function updatePassword(prevState: { error?: string; success?: string } | undefined, formData: FormData) {
  const supabase = await createClient()
  const password = formData.get("password") as string

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return { error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return { success: "Password updated successfully." }
}

export async function crearContrasena(prevState: { error?: string } | undefined, formData: FormData) {
  const supabase = await createClient()

  const password = formData.get("password") as string

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return { error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    console.error("[crearContrasena] updateUser error:", error.message)
    return { error: error.message }
  }

  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login?creada=1")
}
