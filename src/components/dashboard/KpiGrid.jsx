import { useTranslation } from 'react-i18next'
import { TrendingUp, Zap, Wallet, Users } from 'lucide-react'

import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import KpiCard from '../ui/KpiCard.jsx'
import Skeleton from '../ui/Skeleton.jsx'

const ICON_BY_KEY = {
  roi:        TrendingUp,
  engagement: Zap,
  cac:        Wallet,
  active:     Users,
}

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'

// Quantos placeholders exibir durante o carregamento — o back-end sempre
// devolve estes quatro indicadores.
const KPI_SLOTS = 4

export default function KpiGrid({ data, loading = false }) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className={GRID}>
        {Array.from({ length: KPI_SLOTS }, (_, i) => (
          <Skeleton key={i} className="h-28" rounded="rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!data?.length) {
    return (
      <Card glass>
        <EmptyState compact icon={TrendingUp} title={t('dashboard.empty')} />
      </Card>
    )
  }

  return (
    <div className={GRID}>
      {data.map((kpi) => (
        <KpiCard
          key={kpi.key}
          label={t(`dashboard.kpis.${kpi.key}`)}
          value={kpi.value}
          change={kpi.change}
          changeType={kpi.changeType}
          icon={ICON_BY_KEY[kpi.key]}
          hint={kpi.hint ? t('dashboard.kpis.cacOptimal') : undefined}
        />
      ))}
    </div>
  )
}
