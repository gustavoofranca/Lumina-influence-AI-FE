import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import { PlatformBadgeList } from '../icons/PlatformIcons.jsx'
import { findInfluenciador } from '../../mocks/influenciadores.js'
import { formatFollowers, formatBudget } from '../../lib/format.js'

const STATUS_VARIANT = {
  active:     'success',
  monitoring: 'warning',
  risk:       'danger',
}

function ParticipantCard({ participation, t }) {
  const inf = findInfluenciador(participation.influenciadorId)
  if (!inf) return null

  return (
    <Link
      to={`/app/influenciadores/${inf.id}`}
      className={cn(
        'group flex flex-col gap-4 rounded-2xl border border-neutral-700/60 bg-neutral-900/40 p-5',
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/30 hover:bg-neutral-800/60 hover:shadow-glow-soft'
      )}
    >
      {/* Header: avatar + arrow */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={inf.name} size="md" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-neutral-100">{inf.name}</p>
            <p className="truncate text-xs text-text-muted">{inf.handle}</p>
          </div>
        </div>
        <ArrowUpRight
          size={14}
          className="shrink-0 text-text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-300"
        />
      </div>

      {/* Plataformas */}
      <div className="flex items-center justify-between">
        <PlatformBadgeList platforms={inf.platforms} size={14} />
        <Badge variant={STATUS_VARIANT[inf.status]}>
          {t(`influenciadores.status.${inf.status}`)}
        </Badge>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-3 gap-2 border-t border-neutral-800 pt-4">
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-label text-text-muted">
            Score
          </span>
          <span className="mt-1 block font-display text-lg font-bold text-gradient-brand tabular-nums">
            {inf.resonanceScore}
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-label text-text-muted">
            Eng.
          </span>
          <span className="mt-1 block font-display text-lg font-bold text-neutral-100 tabular-nums">
            {inf.engagement.toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-label text-text-muted">
            Followers
          </span>
          <span className="mt-1 block font-display text-lg font-bold text-neutral-100 tabular-nums">
            {formatFollowers(inf.followers)}
          </span>
        </div>
      </div>

      {/* Investimento */}
      <div className="flex items-center justify-between rounded-lg bg-primary-600/10 px-3 py-2 ring-1 ring-inset ring-primary-500/20">
        <span className="text-[10px] font-semibold uppercase tracking-label text-primary-300">
          {participation.posts} {t('campanhas.detail.participants.posts')}
        </span>
        <span className="text-sm font-bold text-primary-200 tabular-nums">
          {formatBudget(participation.cost)}
        </span>
      </div>
    </Link>
  )
}

export default function ParticipantesGrid({ campanha }) {
  const { t } = useTranslation()

  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('campanhas.detail.participants.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('campanhas.detail.participants.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('campanhas.detail.participants.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {campanha.participations.map((p) => (
          <ParticipantCard key={p.influenciadorId} participation={p} t={t} />
        ))}
      </div>
    </Card>
  )
}
