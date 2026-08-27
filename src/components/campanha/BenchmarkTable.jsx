import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Avatar from '../ui/Avatar.jsx'
import Table from '../ui/Table.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import { formatFollowers, formatBudget, formatPct } from '../../lib/format.js'

function PercentBar({ value, color }) {
  const medido = value != null
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1 w-12 overflow-hidden rounded-full bg-bg-elevated/60">
        {medido ? (
          <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
        ) : null}
      </div>
      <span className={cn('font-semibold tabular-nums', medido ? 'text-text-primary' : 'text-text-muted')}>
        {formatPct(value, 0)}
      </span>
    </div>
  )
}

export default function BenchmarkTable({ rows, loading = false }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const columns = [
    {
      key: 'creator',
      header: t('campanhas.detail.benchmark.columns.creator'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div className="min-w-0">
            <div className="truncate font-semibold text-text-primary">{row.name}</div>
            <div className="truncate text-xs text-text-muted">{row.handle}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'totalReach',
      header: t('campanhas.detail.benchmark.columns.totalReach'),
      align: 'right',
      render: (row) => (
        <span className="font-medium text-text-primary tabular-nums">
          {formatFollowers(row.totalReach)}
        </span>
      ),
    },
    {
      key: 'organicReach',
      header: t('campanhas.detail.benchmark.columns.organic'),
      align: 'right',
      render: (row) => <PercentBar value={row.organicReach} color="#7C3AED" />,
    },
    {
      key: 'paidReach',
      header: t('campanhas.detail.benchmark.columns.paid'),
      align: 'right',
      render: (row) => <PercentBar value={row.paidReach} color="#0EA5E9" />,
    },
    {
      key: 'engagement',
      header: t('campanhas.detail.benchmark.columns.engagement'),
      align: 'right',
      render: (row) => {
        if (row.engagement == null) {
          return <span className="tabular-nums text-text-muted">{formatPct(null)}</span>
        }
        const tone =
          row.engagement >= 8 ? 'text-positive'
          : row.engagement >= 5 ? 'text-accent'
          : 'text-caution'
        return <span className={cn('font-semibold tabular-nums', tone)}>{formatPct(row.engagement)}</span>
      },
    },
    {
      key: 'sentimentScore',
      header: t('campanhas.detail.benchmark.columns.sentiment'),
      align: 'right',
      render: (row) => {
        if (row.sentimentScore == null) {
          return <span className="tabular-nums text-text-muted">—</span>
        }
        const tone =
          row.sentimentScore >= 85 ? 'text-positive'
          : row.sentimentScore >= 70 ? 'text-accent'
          : 'text-caution'
        return <span className={cn('font-semibold tabular-nums', tone)}>{row.sentimentScore}%</span>
      },
    },
    {
      key: 'resonanceScore',
      header: t('campanhas.detail.benchmark.columns.score'),
      align: 'right',
      render: (row) => (
        <span className="font-display text-base font-bold text-gradient-brand tabular-nums">
          {row.resonanceScore ?? '—'}
        </span>
      ),
    },
    {
      key: 'cost',
      header: t('campanhas.detail.benchmark.columns.cost'),
      align: 'right',
      render: (row) => (
        <span className="font-semibold tabular-nums text-accent-strong">{formatBudget(row.cost)}</span>
      ),
    },
  ]

  return (
    <Card glass padding="md" className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('campanhas.detail.benchmark.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('campanhas.detail.benchmark.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('campanhas.detail.benchmark.subtitle')}</p>
      </div>

      {loading ? (
        <Skeleton className="h-72" rounded="rounded-2xl" />
      ) : !rows?.length ? (
        <EmptyState compact icon={BarChart3} title={t('campanhas.detail.benchmark.empty')} />
      ) : (
        <Table
          columns={columns}
          data={rows}
          getRowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/app/influenciadores/${row.id}`)}
          className="!border-0"
        />
      )}
    </Card>
  )
}
