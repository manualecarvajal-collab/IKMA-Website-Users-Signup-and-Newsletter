"use client"

import { useActionState, useState } from "react"
import { useTranslations } from "next-intl"
import { updateMembershipInfo } from "@/lib/supabase/profile-actions"
import { countries } from "@/app/membresia/data"
import Icon from "@/components/Icon"

export default function MembershipEditForm({ initial }: { initial: { tipoMiembro: number; region: string; pais: string } }) {
  const t = useTranslations("Perfil")
  const [editing, setEditing] = useState(false)
  const [state, action, pending] = useActionState<{ error?: string; success?: string } | undefined, FormData>(
    updateMembershipInfo,
    undefined
  )

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1.5 bg-white border border-primary text-primary font-label-bold text-label-bold py-2 px-4 rounded-lg hover:bg-primary hover:text-white transition-all cursor-pointer"
      >
        <Icon name="edit" size={16} />
        {t("editInfo")}
      </button>
    )
  }

  return (
    <form action={action} className="space-y-4 border-t border-outline-variant/20 pt-4">
      <div>
        <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="tipo_miembro">
          {t("memberType")}
        </label>
        <select
          id="tipo_miembro"
          name="tipo_miembro"
          defaultValue={initial.tipoMiembro}
          className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
        >
          {[1, 2, 3, 4].map((i) => (
            <option key={i} value={i}>{t(`type${i}`)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="region">
          {t("region")}
        </label>
        <select
          id="region"
          name="region"
          defaultValue={initial.region}
          className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
        >
          <option value="A">{t("regionA")}</option>
          <option value="B">{t("regionB")}</option>
        </select>
      </div>
      <div>
        <label className="block font-label-bold text-label-bold text-on-surface mb-2" htmlFor="pais">
          {t("country")}
        </label>
        <select
          id="pais"
          name="pais"
          defaultValue={initial.pais}
          className="w-full rounded-md bg-surface border border-outline-variant text-on-surface py-3 px-4 focus:border-primary focus:ring-0 transition-colors"
        >
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p className="font-body-md text-body-md text-error bg-error-container/20 rounded-md px-4 py-3">{state.error}</p>
      )}
      {state?.success && (
        <p className="font-body-md text-body-md text-on-primary-fixed-variant bg-tertiary-fixed-dim rounded-md px-4 py-3">{t("infoSaved")}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 bg-primary text-on-primary font-label-bold text-label-bold py-3 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
        >
          {pending ? t("saving") : t("save")}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="bg-white border border-outline-variant text-on-surface font-label-bold text-label-bold py-3 px-6 rounded-lg hover:bg-surface-container transition-all cursor-pointer"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  )
}