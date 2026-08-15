"use client"

import { useActionState, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { updateProfileName, updateProfileEmail, updateProfilePassword } from "@/lib/supabase/profile-actions"
import { createClient } from "@/lib/supabase/client"
import PasswordInput from "@/components/PasswordInput"

type ActionState = { error?: string; success?: string } | undefined

export default function PerfilForms({ initialNombre, email }: { initialNombre: string; email: string }) {
  const t = useTranslations("Perfil")
  const [nameState, nameAction, namePending] = useActionState<ActionState, FormData>(updateProfileName, undefined)
  const [emailState, emailAction, emailPending] = useActionState<ActionState, FormData>(updateProfileEmail, undefined)
  const [passwordState, passwordAction, passwordPending] = useActionState<ActionState, FormData>(updateProfilePassword, undefined)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [mismatch, setMismatch] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // Sign out with the browser client: it clears the client-side session state,
  // deletes the auth cookie and revokes the token in one place. A server-side
  // signOut alone can't clear the browser singleton, whose auto-refresh (with
  // an expired access token) resurrects the session right after signout.
  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="space-y-8">
      {/* Name */}
      <div className="bg-surface rounded-xl p-8 md:p-10 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
        <h2 className="font-headline-lg text-headline-sm text-primary mb-4">{t("fullName")}</h2>
        <form action={nameAction} className="space-y-4">
          <input
            className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
            name="nombre_completo"
            defaultValue={initialNombre}
            required
          />
          {nameState?.error && (
            <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3">{nameState.error}</p>
          )}
          {nameState?.success && (
            <p className="font-body-md text-body-md text-on-primary-fixed-variant bg-tertiary-fixed-dim rounded-md px-4 py-3">{t("nameSaved")}</p>
          )}
          <button
            type="submit"
            disabled={namePending}
            className="bg-primary text-on-primary font-label-bold text-label-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {namePending ? t("saving") : t("save")}
          </button>
        </form>
      </div>

      {/* Email */}
      <div className="bg-surface rounded-xl p-8 md:p-10 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
        <h2 className="font-headline-lg text-headline-sm text-primary mb-1">{t("email")}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-4">{t("emailNote")}</p>
        <form action={emailAction} className="space-y-4">
          <input
            type="email"
            className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
            name="email"
            defaultValue={email}
            required
          />
          {emailState?.error && (
            <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3">{emailState.error}</p>
          )}
          {emailState?.success && (
            <p className="font-body-md text-body-md text-on-primary-fixed-variant bg-tertiary-fixed-dim rounded-md px-4 py-3">{t("emailSaved")}</p>
          )}
          <button
            type="submit"
            disabled={emailPending}
            className="bg-primary text-on-primary font-label-bold text-label-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {emailPending ? t("saving") : t("save")}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-surface rounded-xl p-8 md:p-10 shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] border border-outline-variant/20">
        <h2 className="font-headline-lg text-headline-sm text-primary mb-4">{t("password")}</h2>
        <form
          action={passwordAction}
          onSubmit={(e) => {
            const pwd = new FormData(e.currentTarget).get("password") as string
            if (pwd !== confirmPassword) {
              e.preventDefault()
              setMismatch(true)
              return
            }
            setMismatch(false)
          }}
          className="space-y-4"
        >
          <div>
            <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="current-password">
              {t("currentPassword")}
            </label>
            <PasswordInput
              id="current-password"
              name="current_password"
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="password">
              {t("newPassword")}
            </label>
            <PasswordInput
              id="password"
              name="password"
              required
              minLength={8}
              onChange={() => setMismatch(false)}
            />
          </div>
          <div>
            <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="confirm-password">
              {t("confirmPassword")}
            </label>
            <PasswordInput
              className={`${mismatch ? "border-error" : "border-outline-variant focus:border-primary"}`}
              id="confirm-password"
              name="confirm-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (mismatch) setMismatch(false)
              }}
            />
            {mismatch && <p className="font-body-md text-body-md text-error mt-1.5">{t("mismatch")}</p>}
          </div>
          {passwordState?.error && (
            <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3">{passwordState.error}</p>
          )}
          {passwordState?.success && (
            <p className="font-body-md text-body-md text-on-primary-fixed-variant bg-tertiary-fixed-dim rounded-md px-4 py-3">{t("passwordSaved")}</p>
          )}
          <button
            type="submit"
            disabled={passwordPending}
            className="bg-primary text-on-primary font-label-bold text-label-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {passwordPending ? t("saving") : t("save")}
          </button>
          <Link
            href="/recuperar"
            className="block text-center text-primary font-label-bold text-label-bold hover:underline transition-all"
          >
            {t("forgotPassword")}
          </Link>
        </form>
      </div>

      {/* Sign out */}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="w-full bg-white border border-outline-variant text-on-surface font-label-bold text-label-bold py-3.5 rounded-lg hover:bg-surface-container transition-all disabled:opacity-50 cursor-pointer"
      >
        {signingOut ? t("signingOut") : t("signOut")}
      </button>
    </div>
  )
}