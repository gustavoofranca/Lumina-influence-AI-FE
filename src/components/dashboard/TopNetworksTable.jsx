import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Flame, Activity, Snowflake } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import Table from '../ui/Table.jsx'
import { formatFollowers } from '../../lib/format.js'

const VIRAL_CONFIG = {
  high:   { icon: Flame,     color: 'text-tertiary-300' },
  medium: { icon: Activity,  color: 'text-amber-300' },
  low:    { icon: Snowflake, color: 'text-secondary-300' },
}

const STATUS_VARIANT = {
  active:     'success',
  monitoring: 'warning',
  risk:       'danger',
}

function ScoreCell({ value }) {
  if (value == null) {
    return <div className="text-right tabular-nums text-text-muted">—</div>
  }
  const tone =
    value >= 85 ? 'text-emerald-300'
    : value >= 70 ? 'text-primary-300'
    : value >= 55 ? 'text-amber-300'
    : 'text-tertiary-300'

  return (
    <div className="flex items-center justify-end gap-3">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-neutral-700/60">
        <div
          className="h-full rounded-full bg-gradient-brand"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn('font-display text-sm font-bold tabular-nums', tone)}>{value}</span>
    </div>
  )
}

export default function TopNetworksTable({ data, loading = false }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rows = loading ? [] : data || []

  const columns = [
    {
      key: 'creator',
      header: t('dashboard.topNetworks.columns.creator'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div className="min-w-0">
            <div className="truncate font-semibold text-neutral-100">{row.name}</div>
            <div className="truncate text-xs text-text-muted">
              {row.handle} · {formatFollowers(row.followers)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'resonanceScore',
      header: t('dashboard.topNetworks.columns.score'),
      align: 'right',
      render: (row) => <ScoreCell value={row.resonanceScore} />,
    },
    {
      key: 'viralPotential',
      header: t('dashboard.topNetworks.columns.viralPotential'),
      render: (row) => {
        // A faixa deriva da ressonância. Sem ressonância medida o back-end
        // manda null, e antes o adaptador inventava "medium" aqui.
        const cfg = VIRAL_CONFIG[row.viralPotential]
        if (!cfg) return <span className="text-text-muted">—</span>
        const Icon = cfg.icon
        return (
          <div className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', cfg.color)}>
            <Icon size={13} />
            {t(`dashboard.topNetworks.viral${row.viralPotential.charAt(0).toUpperCase() + row.viralPotential.slice(1)}`)}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: t('dashboard.topNetworks.columns.status'),
      align: 'right',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]}>
          {t(`dashboard.topNetworks.status${row.status.charAt(0).toUpperCase() + row.status.slice(1)}`)}
        </Badge>
      ),
    },
  ]

  return (
    <Card glass padding="md" className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('dashboard.label')}</CardLabel>
        <CardTitle className="mt-1.5">{t('dashboard.topNetworks.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">
          {t('dashboard.topNetworks.subtitle')}
        </p>
      </div>

      <Table
        columns={columns}
        data={rows}
        onRowClick={(row) => navigate(`/app/influenciadores/${row.id}`)}
        getRowKey={(row) => row.id}
        emptyState={loading ? t('common.loading') : t('dashboard.topNetworks.empty')}
        className="!border-0"
      />
    </Card>
  )
}
