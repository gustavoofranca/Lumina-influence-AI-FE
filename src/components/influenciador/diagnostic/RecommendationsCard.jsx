import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, Check, X, Lightbulb } from 'lucide-react'

import { cn } from '../../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../../ui/Card.jsx'
import Button from '../../ui/Button.jsx'
import EmptyState from '../../ui/EmptyState.jsx'
import Skeleton from '../../ui/Skeleton.jsx'

const PRIORITY_STYLES = {
  high:   'bg-tertiary-500/15 text-tertiary-300 ring-tertiary-500/30',
  medium: 'bg-amber-500/15    text-amber-300    ring-amber-500/30',
  low:    'bg-primary-600/15  text-primary-300  ring-primary-500/25',
}

const STATE_STYLES = {
  accepted: { ring: 'ring-emerald-500/30 bg-emerald-500/5',   icon: Check, label: 'accepted', color: 'text-emerald-300' },
  ignored:  { ring: 'ring-tertiary-500/25 bg-tertiary-500/5', icon: X,     label: 'ignored',  color: 'text-tertiary-300' },
}

function RecommendationItem({ rec, status, onAccept, onIgnore, t }) {
  const stateStyle = status && STATE_STYLES[status]

  return (
    <li className={cn(
      'rounded-2xl border border-neutral-700/60 bg-neutral-900/40 p-5 transition-all duration-200',
      stateStyle && `ring-1 ${stateStyle.ring}`,
    )}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600/20 text-primary-300 ring-1 ring-inset ring-primary-500/30">
            <Sparkles size={14} />
          </span>
          <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset',
            PRIORITY_STYLES[rec.priority]
          )}>
            {t(`influenciador.recommendations.priority.${rec.priority}`)}
          </span>
        </div>

        {/* Estado quando ja agiu */}
        {stateStyle && (
          <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', stateStyle.color)}>
            <stateStyle.icon size={13} />
            {t(`influenciador.recommendations.${stateStyle.label}`)}
          </span>
        )}
      </div>

      <h4 className="mt-3 font-display text-base font-bold text-neutral-100">
        {rec.title}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {rec.description}
      </p>

      {/* Acoes — somente se ainda nao foi decidida */}
      {!status && (
        <div className="mt-4 flex items-center gap-2">
          <Button variant="primary" size="sm" leftIcon={Check} onClick={onAccept}>
            {t('influenciador.recommendations.accept')}
          </Button>
          <Button variant="secondary" size="sm" leftIcon={X} onClick={onIgnore}>
            {t('influenciador.recommendations.ignore')}
          </Button>
        </div>
      )}
    </li>
  )
}

export default function RecommendationsCard({ data, loading = false }) {
  const { t } = useTranslation()
  const [decisions, setDecisions] = useState({}) // { [recId]: 'accepted' | 'ignored' }

  if (loading) {
    return (
      <Card glass className="flex flex-col gap-5">
        <CardLabel>{t('influenciador.recommendations.title')}</CardLabel>
        <Skeleton className="h-40" rounded="rounded-xl" />
      </Card>
    )
  }

  if (!data?.length) {
    return (
      <Card glass className="flex flex-col gap-5">
        <CardLabel>{t('influenciador.recommendations.title')}</CardLabel>
        <EmptyState icon={Lightbulb} title={t('influenciador.recommendations.empty')} />
      </Card>
    )
  }

  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('influenciador.recommendations.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('influenciador.recommendations.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('influenciador.recommendations.subtitle')}</p>
      </div>

      <ul className="space-y-3">
        {data.map((rec) => (
          <RecommendationItem
            key={rec.id}
            rec={rec}
            status={decisions[rec.id]}
            onAccept={() => setDecisions((p) => ({ ...p, [rec.id]: 'accepted' }))}
            onIgnore={() => setDecisions((p) => ({ ...p, [rec.id]: 'ignored' }))}
            t={t}
          />
        ))}
      </ul>
    </Card>
  )
}
