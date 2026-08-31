import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, Users } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import { PlatformBadgeList } from '../icons/PlatformIcons.jsx'
import { formatFollowers, formatBudget, formatPct } from '../../lib/format.js'

const STATUS_VARIANT = {
  active:     'success',
  monitoring: 'warning',
  risk:       'danger',
}

const GRID = 'grid gap-4 md:grid-cols-2 xl:grid-cols-4'

// Placeholders durante o carregamento — não sabemos quantos são ainda.
const LOADING_SLOTS = 4

function MiniKpi({ label, children }) {
  return (
    <div>
      <span className="block text-label">
        {label}
      </span>
      <span className="mt-1 block font-display text-lg font-bold tabular-nums">{children}</span>
    </div>
  )
}

function ParticipantCard({ participant, t }) {
  const p = participant

  return (
    <Link
      to={`/app/influenciadores/${p.id}`}
      className={cn(
        'group flex flex-col gap-4 rounded-2xl border border-hairline/60 bg-bg-base/40 p-5',
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/30 hover:bg-bg-surface/60 hover:shadow-glow-soft'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={p.name} size="md" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-primary">{p.name}</p>
            <p className="truncate text-xs text-text-muted">{p.handle}</p>
          </div>
        </div>
        <ArrowUpRight
          size={14}
          className="shrink-0 text-text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
        />
      </div>

      <div className="flex items-center justify-between">
        <PlatformBadgeList platforms={p.platforms} size={14} />
        <Badge variant={STATUS_VARIANT[p.status]}>
          {t(`influenciadores.status.${p.status}`)}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-hairline pt-4">
        <MiniKpi label={t('campanha.participantes.score')}>
          <span className="text-gradient-brand">{p.resonanceScore ?? '—'}</span>
        </MiniKpi>
        <MiniKpi label={t('campanha.participantes.engagement')}>
          <span className="text-text-primary">{formatPct(p.engagement)}</span>
        </MiniKpi>
        <MiniKpi label={t('campanha.participantes.followers')}>
          <span className="text-text-primary">{formatFollowers(p.followers)}</span>
        </MiniKpi>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-primary-600/10 px-3 py-2 ring-1 ring-inset ring-primary-500/20">
        <span className="text-[10px] font-semibold uppercase tracking-label text-accent">
          {p.posts} {t('campanhas.detail.participants.posts')}
        </span>
        <span className="text-sm font-bold text-accent-strong tabular-nums">
          {formatBudget(p.cost)}
        </span>
      </div>
    </Link>
  )
}

export default function ParticipantesGrid({ participants, loading = false }) {
  const { t } = useTranslation()

  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('campanhas.detail.participants.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('campanhas.detail.participants.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('campanhas.detail.participants.subtitle')}</p>
      </div>

      {loading ? (
        <div className={GRID}>
          {Array.from({ length: LOADING_SLOTS }, (_, i) => (
            <Skeleton key={i} className="h-64" rounded="rounded-2xl" />
          ))}
        </div>
      ) : !participants?.length ? (
        <EmptyState compact icon={Users} title={t('campanhas.detail.participants.empty')} />
      ) : (
        <div className={GRID}>
          {participants.map((p) => (
            <ParticipantCard key={p.id} participant={p} t={t} />
          ))}
        </div>
      )}
    </Card>
  )
}
