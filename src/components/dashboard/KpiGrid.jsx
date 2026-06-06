import { useTranslation } from 'react-i18next'
import { TrendingUp, Zap, Wallet, Users } from 'lucide-react'

import KpiCard from '../ui/KpiCard.jsx'
import { KPIS } from '../../mocks/dashboard.js'

const ICON_BY_KEY = {
  roi:        TrendingUp,
  engagement: Zap,
  cac:        Wallet,
  active:     Users,
}

export default function KpiGrid({ data }) {
  const { t } = useTranslation()
  const kpis = data || KPIS

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
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
