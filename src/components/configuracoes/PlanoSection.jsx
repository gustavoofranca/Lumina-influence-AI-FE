import { useTranslation } from 'react-i18next'
import { Sparkles, ArrowUp, Check, CreditCard } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import ApiErrorBanner from '../ui/ApiErrorBanner.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import { useApi } from '../../hooks/useApi.js'
import { getAgency, getAgencyUsage } from '../../services/agency.js'

const UNLIMITED = '∞'

function formatPrice(cents, locale) {
  return (cents / 100).toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

/**
 * Barra de consumo. `limit` nulo significa que o plano não impõe teto —
 * mostrar barra cheia ou vazia ali afirmaria um limite que não existe.
 */
function UsageRow({ label, used, limit }) {
  const semTeto = limit === null || limit === undefined
  const pct = semTeto ? 0 : Math.min(100, (used / Math.max(limit, 1)) * 100)
  const tone = pct >= 90 ? 'bg-tertiary-500' : pct >= 70 ? 'bg-amber-500' : 'bg-gradient-brand'

  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="text-sm">
          <span className="font-display font-bold tabular-nums text-neutral-100">{used}</span>
          <span className="text-text-muted"> / {semTeto ? UNLIMITED : limit}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-700/60">
        {!semTeto && (
          <div
            className={cn('h-full rounded-full transition-all duration-500', tone)}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  )
}

export default function PlanoSection() {
  const { t, i18n } = useTranslation()
  const { data: agencia, loading: agencyLoading, error: agencyError } = useApi(getAgency, [])
  const { data: usage, loading: usageLoading, error: usageError } = useApi(
    () => getAgencyUsage(agencia.id),
    [agencia?.id],
    { enabled: Boolean(agencia?.id) }
  )

  if (agencyLoading) return <Skeleton className="h-96" rounded="rounded-3xl" />

  const plano = agencia?.plan

  return (
    <div className="flex flex-col gap-6">
      <ApiErrorBanner error={agencyError || usageError} />

      <Card glass className={cn(
        'relative overflow-hidden border-2 border-primary-500/50',
        'shadow-glow-primary'
      )}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: 'radial-gradient(50% 60% at 100% 0%, rgba(124,58,237,0.25) 0%, transparent 65%)' }}
        />
        <div className="relative">
          {!plano ? (
            <EmptyState compact icon={CreditCard} title={t('configuracoes.plano.none')} />
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-label">{t('configuracoes.plano.current')}</span>
                  <CardTitle className="mt-2 text-2xl">{plano.name}</CardTitle>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="font-display text-4xl font-extrabold text-gradient-brand">
                      {formatPrice(plano.priceCents, i18n.language)}
                    </span>
                    <span className="mb-1 text-sm text-text-muted">
                      {t('configuracoes.plano.perMonth')}
                    </span>
                  </div>
                </div>

                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow-soft">
                  <Sparkles size={22} />
                </span>
              </div>

              {/* Só o que o plano de fato define. */}
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check size={14} className="shrink-0 text-primary-400" />
                  {t('configuracoes.plano.features.influencers', { count: plano.maxInfluencers })}
                </li>
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check size={14} className="shrink-0 text-primary-400" />
                  {t('configuracoes.plano.features.analyses', { count: plano.maxAnalysesPerMonth })}
                </li>
                {plano.allowBenchmarking && (
                  <li className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check size={14} className="shrink-0 text-primary-400" />
                    {t('configuracoes.plano.features.benchmarking')}
                  </li>
                )}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-primary/10 pt-5">
                <Button variant="primary" leftIcon={ArrowUp} disabled>
                  {t('configuracoes.plano.actions.upgrade')}
                </Button>
                <span className="text-xs text-text-muted">
                  {t('configuracoes.plano.billingSoon')}
                </span>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card glass className="flex flex-col gap-5">
        <div>
          <CardLabel>{t('configuracoes.plano.usage.title')}</CardLabel>
          <CardTitle className="mt-1.5">{t('configuracoes.plano.usage.title')}</CardTitle>
          <p className="mt-1 text-sm text-text-secondary">
            {t('configuracoes.plano.usage.subtitle')}
          </p>
        </div>

        {usageLoading || !usage ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-12" rounded="rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            <UsageRow
              label={t('configuracoes.plano.usage.influencers')}
              used={usage.influencers.used}
              limit={usage.influencers.limit}
            />
            <UsageRow
              label={t('configuracoes.plano.usage.analyses')}
              used={usage.analyses.used}
              limit={usage.analyses.limit}
            />
            <UsageRow
              label={t('configuracoes.plano.usage.reports')}
              used={usage.reports.used}
              limit={usage.reports.limit}
            />
          </div>
        )}
      </Card>
    </div>
  )
}
