import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Avatar from '../ui/Avatar.jsx'
import Table from '../ui/Table.jsx'
import { findInfluenciador } from '../../mocks/influenciadores.js'
import { formatFollowers, formatBudget } from '../../lib/format.js'

function PercentBar({ value, color }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1 w-12 overflow-hidden rounded-full bg-neutral-700/60">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-semibold tabular-nums text-neutral-200">{value}%</span>
    </div>
  )
}

export default function BenchmarkTable({ campanha, rows: rowsProp }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Usa as linhas reais (vindas do benchmarking da API) se fornecidas;
  // senão constrói do mock (participations + findInfluenciador).
  const rows = rowsProp || (campanha?.participations || []).map((p) => {
    const inf = findInfluenciador(p.influenciadorId)
    if (!inf) return null
    const totalReach = Math.round(inf.followers * (inf.engagement / 100) * 0.85)
    return {
      id: inf.id,
      name: inf.name,
      handle: inf.handle,
      totalReach,
      organicReach: inf.organicReach,
      paidReach:    inf.paidReach,
      engagement:   inf.engagement,
      sentimentScore: inf.sentimentScore,
      resonanceScore: inf.resonanceScore,
      cost: p.cost,
    }
  }).filter(Boolean)

  const columns = [
    {
      key: 'creator',
      header: t('campanhas.detail.benchmark.columns.creator'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div className="min-w-0">
            <div className="truncate font-semibold text-neutral-100">{row.name}</div>
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
        <span className="font-medium text-neutral-200 tabular-nums">
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
        const tone =
          row.engagement >= 8 ? 'text-emerald-300'
          : row.engagement >= 5 ? 'text-primary-300'
          : 'text-amber-300'
        return <span className={cn('font-semibold tabular-nums', tone)}>{row.engagement.toFixed(1)}%</span>
      },
    },
    {
      key: 'sentimentScore',
      header: t('campanhas.detail.benchmark.columns.sentiment'),
      align: 'right',
      render: (row) => {
        const tone =
          row.sentimentScore >= 85 ? 'text-emerald-300'
          : row.sentimentScore >= 70 ? 'text-primary-300'
          : 'text-amber-300'
        return <span className={cn('font-semibold tabular-nums', tone)}>{row.sentimentScore}%</span>
      },
    },
    {
      key: 'resonanceScore',
      header: t('campanhas.detail.benchmark.columns.score'),
      align: 'right',
      render: (row) => (
        <span className="font-display text-base font-bold text-gradient-brand tabular-nums">
          {row.resonanceScore}
        </span>
      ),
    },
    {
      key: 'cost',
      header: t('campanhas.detail.benchmark.columns.cost'),
      align: 'right',
      render: (row) => (
        <span className="font-semibold tabular-nums text-primary-200">{formatBudget(row.cost)}</span>
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

      <Table
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/app/influenciadores/${row.id}`)}
        className="!border-0"
      />
    </Card>
  )
}
