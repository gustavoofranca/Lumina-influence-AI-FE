import { useTranslation } from 'react-i18next'
import { TrendingUp } from 'lucide-react'

import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import AreaStackedChart from '../charts/AreaStackedChart.jsx'

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-xs text-text-secondary">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  )
}

export default function GrowthCard({ data, loading = false }) {
  const { t } = useTranslation()

  const series = [
    { key: 'organic', label: t('dashboard.growth.organic'), color: '#7C3AED' },
    { key: 'paid',    label: t('dashboard.growth.paid'),    color: '#0EA5E9' },
  ]

  return (
    <Card glass className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardLabel>{t('dashboard.label')}</CardLabel>
          <CardTitle className="mt-1.5">{t('dashboard.growth.title')}</CardTitle>
          <p className="mt-1 text-sm text-text-secondary">{t('dashboard.growth.subtitle')}</p>
        </div>
        <div className="hidden flex-col items-end gap-2 sm:flex">
          <LegendItem color="#7C3AED" label={t('dashboard.growth.organic')} />
          <LegendItem color="#0EA5E9" label={t('dashboard.growth.paid')} />
        </div>
      </div>

      <div className="-mx-2">
        {loading ? (
          <Skeleton className="h-[280px]" rounded="rounded-xl" />
        ) : data?.length ? (
          <AreaStackedChart data={data} series={series} height={280} />
        ) : (
          <EmptyState icon={TrendingUp} title={t('dashboard.growth.empty')} />
        )}
      </div>
    </Card>
  )
}
