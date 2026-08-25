import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileText, Edit3 } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { formatBudget, formatDateRange, formatFollowers } from '../../lib/format.js'

// Marcador de ausência de dado — melhor que zero, que seria uma afirmação.
const EMPTY = '—'

const STATUS_VARIANT = {
  active:    'success',
  planning:  'info',
  paused:    'warning',
  completed: 'neutral',
}

function MetaCell({ label, value, accent = false }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-label text-text-muted">{label}</span>
      <span className={cn(
        'font-display font-bold',
        accent ? 'text-2xl text-gradient-brand' : 'text-base text-neutral-100'
      )}>
        {value}
      </span>
    </div>
  )
}

export default function CampanhaHeader({ campanha, metrics }) {
  const { t, i18n } = useTranslation()
  const c = campanha
  // Os totais vêm do benchmarking, que carrega depois da campanha.
  const m = metrics

  return (
    <header className={cn(
      'card-glass relative overflow-hidden rounded-3xl p-6 lg:p-8'
    )}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{ background: 'radial-gradient(50% 50% at 100% 0%, rgba(124,58,237,0.18) 0%, transparent 65%)' }}
      />

      {/* Voltar */}
      <Link
        to="/app/campanhas"
        className="relative inline-flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-neutral-100"
      >
        <ArrowLeft size={13} />
        {t('campanhas.detail.back')}
      </Link>

      <div className="relative mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-label">{c.brand}</span>
            <Badge variant={STATUS_VARIANT[c.status]}>{t(`campanhas.status.${c.status}`)}</Badge>
          </div>

          <h1 className="font-display text-3xl font-bold text-neutral-100 lg:text-4xl">
            {c.name}
          </h1>
        </div>

        <div className="flex items-center gap-2 lg:shrink-0">
          <Button variant="primary" leftIcon={FileText}>
            {t('campanhas.detail.actions.generateReport')}
          </Button>
          <Button variant="secondary" leftIcon={Edit3}>
            {t('campanhas.detail.actions.edit')}
          </Button>
        </div>
      </div>

      {/* Grid de metas */}
      <div className="relative mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        <MetaCell
          label={t('campanhas.detail.header.period')}
          value={formatDateRange(c.startDate, c.endDate, i18n.language)}
        />
        <MetaCell
          label={t('campanhas.detail.header.budget')}
          value={formatBudget(c.budget)}
          accent
        />
        <MetaCell
          label={t('campanhas.detail.header.posts')}
          value={m?.posts ?? EMPTY}
        />
        <MetaCell
          label={t('campanhas.detail.header.reach')}
          value={m?.totalReach ? formatFollowers(m.totalReach) : EMPTY}
        />
        <MetaCell
          label={t('campanhas.detail.header.sentiment')}
          value={m?.avgSentiment ? `${m.avgSentiment}%` : EMPTY}
        />
      </div>

      {/* Progresso */}
      {c.status !== 'planning' && (
        <div className="relative mt-6">
          <ProgressBar
            label={t('campanhas.list.card.progress')}
            value={c.progress}
            showValue
            variant={c.status === 'paused' ? 'warning' : c.status === 'completed' ? 'success' : 'primary'}
          />
        </div>
      )}
    </header>
  )
}
