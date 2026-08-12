"use client"

import { useCallback, useState } from "react"
import { useTranslations } from "next-intl"
import { getMemberMessages } from "@/lib/supabase/email-actions"
import MemberEmailForm from "./form"
import Icon from "@/components/Icon"

export interface MemberMessage {
  id: string
  direccion: "enviado"
  asunto: string
  contenido: string | null
  es_html: boolean
  de: string | null
  para: string | null
  created_at: string
}

export default function MemberEmailHistory({
  solicitudId,
  nombre,
  lang,
  initialEnviados,
}: {
  solicitudId: string
  nombre: string
  lang: "en" | "es"
  initialEnviados: MemberMessage[]
}) {
  const t = useTranslations("Admin")
  const [view, setView] = useState<"history" | "compose">("history")
  const [enviados, setEnviados] = useState(initialEnviados)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const data = await getMemberMessages(solicitudId)
    setEnviados(data.filter((m) => m.direccion === "enviado"))
  }, [solicitudId])

  if (view === "compose") {
    return (
      <MemberEmailForm
        solicitudId={solicitudId}
        nombre={nombre}
        lang={lang}
        onSent={() => {
          setView("history")
          refresh()
        }}
        onCancel={() => setView("history")}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-headline-lg text-headline-lg text-primary">{t("memberEmailHistoryTitle")}</h1>
        <button
          onClick={() => setView("compose")}
          className="shrink-0 inline-flex items-center gap-2 bg-primary text-on-primary font-label-bold text-label-bold px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
        >
          <Icon name="mail" size={18} />
          {t("memberEmailNew")}
        </button>
      </div>

      {enviados.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <Icon name="send" size={40} className="text-on-surface-variant/40 mx-auto mb-3" />
          <p className="font-body-md text-body-md text-on-surface-variant">{t("memberEmailEmptySent")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enviados.map((m) => (
            <MessageCard
              key={m.id}
              m={m}
              t={t}
              expanded={expandedId === m.id}
              onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MessageCard({
  m,
  t,
  expanded,
  onToggle,
}: {
  m: MemberMessage
  t: (key: string) => string
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-surface-container-low transition"
      >
        <span className="mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-700">
          <Icon name="send" size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-sm text-on-surface truncate">{m.asunto || t("memberEmailNoSubject")}</p>
            <span className="shrink-0 text-xs text-on-surface-variant">
              {new Date(m.created_at).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5 truncate">
            {t("memberEmailTo")}: <span className="notranslate">{m.para}</span>
          </p>
        </div>
        <Icon
          name="expand_more"
          size={18}
          className={`shrink-0 text-on-surface-variant mt-1 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div className="px-4 pb-4 pl-[3.75rem]">
          <div className="bg-surface-container-low rounded-lg p-4 text-sm text-on-surface leading-relaxed">
            {m.es_html ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: m.contenido || "" }} />
            ) : (
              <div className="whitespace-pre-wrap break-words">{m.contenido || ""}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
