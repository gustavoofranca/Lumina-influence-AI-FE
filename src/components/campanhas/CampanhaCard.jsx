import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, Wallet, Users, ArrowUpRight } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { formatBudget, formatDateRange } from '../../lib/format.js'

const STATUS_VARIANT = {
  active:    'success',
  planning:  'info',
  paused:    'warning',
  completed: 'neutral',
}

function StackedAvatars({ participants, max = 4 }) {
  const visible = participants.slice(0, max)
  const extra   = Math.max(0, participants.length - max)
  return (
    <div className="flex items-center">
      {visible.map((p, i) => (
        <span
          key={p.influenciadorId}
          className={cn('inline-block', i > 0 && '-ml-2', 'ring-2 ring-bg-surface rounded-full')}
          style={{ zIndex: visible.length - i }}
        >
          <Avatar name={p.name} size="sm" />
        </span>
      ))}
      {extra > 0 && (
        <span className="-ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-bg-surface text-[10px] font-bold text-text-secondary ring-2 ring-bg-surface">
          +{extra}
        </span>
      )}
    </div>
  )
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-label">
        <Icon size={11} />
        {label}
      </div>
      <div className="mt-1 font-semibold text-text-primary truncate">{value}</div>
    </div>
  )
}

export default function CampanhaCard({ campanha }) {
  const { t, i18n } = useTranslation()
  const c = campanha
  const participants = c.participations || []

  return (
    <Link
      to={`/app/campanhas/${c.id}`}
      className={cn(
        // min-w-0: o intervalo de datas usa `truncate`, que implica
        // white-space:nowrap — sem isso a largura mínima do card é a linha
        // inteira, e num celular ele empurra a página.
        'group block min-w-0 rounded-2xl border border-primary/10 bg-bg-surface/60 p-5 backdrop-blur-md',
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-glow-soft'
      )}
    >
      {/* Header: marca + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* `block truncate` mantém a marca em uma linha: com o rótulo em 12px,
              "LUMIÈRE COSMÉTICOS" quebrava em duas e desalinhava o cartão em
              relação aos vizinhos da grade. */}
          <span className="block truncate text-label">
            {c.brand}
          </span>
          <h2 className="mt-1 truncate font-display text-lg font-bold text-text-primary group-hover:text-accent-strong">
            {c.name}
          </h2>
        </div>
        <Badge variant={STATUS_VARIANT[c.status]}>
          {t(`campanhas.status.${c.status}`)}
        </Badge>
      </div>

      {/* Meta grid: período + orçamento */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <MetaRow
          icon={Calendar}
          label={t('campanhas.list.card.period')}
          value={formatDateRange(c.startDate, c.endDate, i18n.language)}
        />
        <MetaRow
          icon={Wallet}
          label={t('campanhas.list.card.budget')}
          value={formatBudget(c.budget)}
        />
      </div>

      {/* Footer: avatars + progresso */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-hairline/60 pt-4">
        <div className="flex items-center gap-3">
          <StackedAvatars participants={participants} />
          <span className="text-xs text-text-muted">
            <Users size={11} className="mr-1 inline" />
            {t('campanhas.list.card.influencers', { count: participants.length })}
          </span>
        </div>
        <ArrowUpRight
          size={16}
          className="shrink-0 text-text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
        />
      </div>

      {/* Mini progresso */}
      {c.status !== 'planning' && (
        <div className="mt-3">
          <ProgressBar value={c.progress} size="sm" variant={c.status === 'paused' ? 'warning' : 'primary'} />
        </div>
      )}
    </Link>
  )
}
