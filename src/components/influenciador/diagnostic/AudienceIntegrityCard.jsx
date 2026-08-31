import { useTranslation } from 'react-i18next'
import { ShieldCheck, AlertTriangle, Bot } from 'lucide-react'

import { cn } from '../../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../../ui/Card.jsx'
import DonutChart from '../../charts/DonutChart.jsx'
import EmptyState from '../../ui/EmptyState.jsx'
import Skeleton from '../../ui/Skeleton.jsx'
import { formatFollowers } from '../../../lib/format.js'

const ROWS = [
  { key: 'verifiedHumans', icon: ShieldCheck,    color: 'text-positive', bg: 'bg-emerald-500/15', ring: 'ring-emerald-500/30' },
  { key: 'suspicious',     icon: AlertTriangle,  color: 'text-caution',   bg: 'bg-amber-500/15',   ring: 'ring-amber-500/30' },
  { key: 'bots',           icon: Bot,            color: 'text-tint-rose', bg: 'bg-tertiary-500/15', ring: 'ring-tertiary-500/30' },
]

export default function AudienceIntegrityCard({ data, loading = false }) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card glass className="flex flex-col gap-5">
        <CardLabel>{t('influenciador.audience.title')}</CardLabel>
        <Skeleton className="h-52" rounded="rounded-2xl" />
      </Card>
    )
  }

  if (!data) {
    return (
      <Card glass className="flex flex-col gap-5">
        <CardLabel>{t('influenciador.audience.title')}</CardLabel>
        <EmptyState icon={ShieldCheck} title={t('influenciador.audience.empty')} />
      </Card>
    )
  }

  const donutData = [
    { key: 'organic',    value: data.organic,    color: '#7C3AED' },
    { key: 'suspicious', value: data.suspicious, color: '#F59E0B' },
    { key: 'bots',       value: data.bots,       color: '#F43F5E' },
  ]

  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('influenciador.audience.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('influenciador.audience.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('influenciador.audience.subtitle')}</p>
      </div>

      {/* Donut centralizado */}
      <div className="flex items-center justify-center py-2">
        <DonutChart
          data={donutData}
          size={200}
          thickness={18}
          centerContent={
            <div>
              <span className="block font-display text-4xl font-extrabold text-gradient-brand tabular-nums">
                {data.organic}%
              </span>
              <span className="text-label">
                {t('influenciador.audience.organic')}
              </span>
            </div>
          }
        />
      </div>

      {/* Lista de breakdown */}
      <ul className="space-y-2">
        {ROWS.map((row) => {
          const Icon = row.icon
          return (
            <li
              key={row.key}
              className="flex items-center gap-3 rounded-xl bg-bg-base/40 px-3 py-2.5 ring-1 ring-inset ring-hairline"
            >
              <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset', row.bg, row.color, row.ring)}>
                <Icon size={14} />
              </span>
              <span className="flex-1 text-sm text-text-secondary">
                {t(`influenciador.audience.${row.key}`)}
              </span>
              <span className="font-semibold text-text-primary tabular-nums">
                {formatFollowers(data.totals[row.key])}
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
