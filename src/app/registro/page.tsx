"use client"

import { useActionState, useEffect } from "react"
import { signup } from "@/lib/supabase/actions"
import { createBrowserClient } from "@supabase/ssr"
import { useLanguage } from "@/lib/useLanguage"
import Link from "next/link"

export default function RegistroPage() {
  const lang = useLanguage()
  const t = (en: string, es: string) => lang === "es" ? es : en
  const [state, action, pending] = useActionState(signup, undefined)

  useEffect(() => {
    if (state?.success === "ok") {
      window.location.href = "/"
    }
  }, [state])

  return (
    <section className="py-section-padding">
      <div className="max-w-lg mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="bg-surface rounded-xl p-8 md:p-12 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
          <h1 className="font-headline-lg text-headline-md text-primary mb-2">{t("Create Account", "Crear Cuenta")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            {t("Join the IKMA community. Registration is free.", "Únete a la comunidad IKMA. El registro es gratuito.")}
          </p>

          <form action={action} className="space-y-6">
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="nombre_completo">
                {t("Full Name", "Nombre completo")}
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                id="nombre_completo"
                name="nombre_completo"
                type="text"
                placeholder={t("Dr. Jane Doe", "Dr. Juan Pérez")}
                required
              />
            </div>
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="email">
                {t("Email Address", "Correo electrónico")}
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                id="email"
                name="email"
                type="email"
                placeholder={t("jane@example.com", "ana@ejemplo.com")}
                required
              />
            </div>
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="password">
                {t("Password", "Contraseña")}
              </label>
              <input
                className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
                id="password"
                name="password"
                type="password"
                placeholder={t("Create a strong password", "Crea una contraseña segura")}
                required
                minLength={6}
              />
            </div>

            {state?.error && (
              <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3">{state.error}</p>
            )}
            {state?.success && (
              <p className="font-body-md text-body-md text-on-primary-fixed-variant bg-tertiary-fixed-dim rounded-md px-4 py-3">{state.success}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-3.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {pending ? t("Creating account...", "Creando cuenta...") : t("Create Account", "Crear Cuenta")}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-4 font-body-md text-body-md text-on-surface-variant">or</span>
            </div>
          </div>

          <button
            onClick={() => {
              const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
              )
              supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${location.origin}/auth/callback` },
              })
            }}
            className="w-full flex items-center justify-center gap-3 bg-surface border border-outline-variant/50 text-on-surface font-label-bold text-label-bold py-3 rounded-lg hover:bg-surface-container transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t("Sign up with Google", "Registrarse con Google")}
          </button>

          <p className="font-body-md text-body-md text-on-surface-variant text-center mt-6">
            {t("Already have an account?", "¿Ya tienes cuenta?")}{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              {t("Sign in", "Iniciar sesión")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
