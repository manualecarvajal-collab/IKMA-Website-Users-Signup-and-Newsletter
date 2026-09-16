"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { cancelMembership, resumeMembership } from "@/lib/supabase/profile-actions"
import Icon from "@/components/Icon"

type ActionState = { error?: string; success?: string } | undefined

// Membership billing controls: stop the renewal, undo it, or hand the member to
// the Stripe portal to update their card / pay an open invoice.
export default function MembershipBillingActions({
  cancelAtPeriodEnd,
  periodEnd,
  hasCustomer,
}: {
  cancelAtPeriodEnd: boolean
  periodEnd: string | null
  hasCustomer: boolean
}) {
  const t = useTranslations("Perfil")
  const [cancelState, cancelAction, cancelPending] = useActionState<ActionState, FormData>(cancelMembership, undefined)
  const [resumeState, resumeAction, resumePending] = useActionState<ActionState, FormData>(resumeMembership, undefined)

  const error = cancelState?.error ?? resumeState?.error
  const errorMessage =
    error === "no_subscription" ? t("noSubscription") : error ? t("cancelError") : null

  return (
    <div className="space-y-4 pt-3">
      {cancelAtPeriodEnd ? (
        <>
          <p className="font-body-md text-body-md text-on-surface-variant bg-surface-container-low border border-outline-variant/30 rounded-md px-4 py-3">
            {t("renewalOff")}
            {periodEnd && <strong className="block mt-1">{t("cancelsOn")}: {periodEnd}</strong>}
          </p>
          <form action={resumeAction}>
            <button
              type="submit"
              disabled={resumePending}
              className="bg-primary text-on-primary font-label-bold text-label-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
            >
              {resumePending ? t("saving") : t("resumeMembership")}
            </button>
          </form>
        </>
      ) : (
        <form action={cancelAction}>
          <button
            type="submit"
            disabled={cancelPending}
            className="bg-white border border-error text-error font-label-bold text-label-bold py-3 px-6 rounded-lg hover:bg-error hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelPending ? t("saving") : t("cancelMembership")}
          </button>
          <p className="font-body-md text-body-sm text-on-surface-variant mt-2">{t("cancelNote")}</p>
        </form>
      )}

      {resumeState?.success && (
        <p className="font-body-md text-body-md text-on-primary-fixed-variant bg-tertiary-fixed-dim rounded-md px-4 py-3">
          {t("resumeOk")}
        </p>
      )}
      {cancelState?.success && (
        <p className="font-body-md text-body-md text-on-primary-fixed-variant bg-tertiary-fixed-dim rounded-md px-4 py-3">
          {t("cancelOk")}
        </p>
      )}
      {errorMessage && (
        <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3">{errorMessage}</p>
      )}

      {hasCustomer && (
        <a
          href="/api/stripe/portal"
          className="inline-flex items-center gap-2 font-label-bold text-label-bold text-primary hover:underline"
        >
          <Icon name="credit_card" size={18} />
          {t("manageBilling")}
        </a>
      )}
    </div>
  )
}
