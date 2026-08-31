import { useTranslation } from 'react-i18next'
import { FileSearch } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'

function formatDate(iso, locale) {
  try {
    return new Date(iso).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

function ScoreBar({ value, label }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-label">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-1 w-20 overflow-hidden rounded-full bg-bg-elevated/60">
          {value == null ? null : (
            <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${value}%` }} />
          )}
        </div>
        <span className="font-display text-sm font-bold tabular-nums text-text-primary">{value ?? '—'}</span>
      </div>
    </div>
  )
}

export default function HistoricoTab({ data, loading = false }) {
  const { t, i18n } = useTranslation()

  if (loading) {
    return (
      <Card glass>
        <CardLabel>{t('influenciador.history.title')}</CardLabel>
        <Skeleton className="mt-4 h-48" rounded="rounded-xl" />
      </Card>
    )
  }

  if (!data?.length) {
    return (
      <Card glass>
        <CardLabel>{t('influenciador.history.title')}</CardLabel>
        <EmptyState icon={FileSearch} title={t('influenciador.history.empty')} />
      </Card>
    )
  }

  return (
    <Card glass>
      <div className="mb-6">
        <CardLabel>{t('influenciador.history.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('influenciador.history.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('influenciador.history.subtitle')}</p>
      </div>

      {/* Timeline vertical */}
      <ol className="relative space-y-4 pl-6">
        {/* Linha vertical da timeline */}
        <span aria-hidden className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-primary-500/40 via-primary-500/20 to-transparent" />

        {(data || []).map((item, i) => (
          <li key={item.id} className="relative">
            {/* Bolinha da timeline */}
            <span
              aria-hidden
              className={cn(
                'absolute -left-6 top-4 inline-flex h-3 w-3 items-center justify-center rounded-full',
                i === 0 ? 'bg-primary-500 shadow-[0_0_10px_rgba(124,58,237,0.7)]' : 'bg-neutral-600 ring-2 ring-neutral-900'
              )}
            />

            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-hairline/60 bg-bg-base/40 p-4 transition-colors hover:bg-bg-surface/40">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600/15 text-accent ring-1 ring-inset ring-primary-500/20">
                <FileSearch size={16} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-accent">#{item.id}</span>
                  {i === 0 && (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-positive ring-1 ring-inset ring-emerald-500/30">
                      {t('influenciador.history.latest')}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-sm font-medium text-text-primary">
                  {formatDate(item.data, i18n.language)} · {t('influenciador.history.scope')}: {item.escopo}
                </div>
              </div>

              <div className="hidden items-center gap-6 sm:flex">
                <ScoreBar label={t('influenciador.kpis.brandCoherence')} value={item.brandCoherence} />
                <ScoreBar label={t('influenciador.kpis.sentimentIndex')} value={item.sentimentScore} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}
