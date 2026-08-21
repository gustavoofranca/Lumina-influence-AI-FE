import { useTranslation } from 'react-i18next'
import { Users, Zap, Sparkles, Wallet } from 'lucide-react'

import KpiCard from '../ui/KpiCard.jsx'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import AreaStackedChart from '../charts/AreaStackedChart.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { GROWTH_SERIES } from '../../mocks/dashboard.js'
import { formatFollowers } from '../../lib/format.js'

export default function VisaoGeralTab({ influenciador: inf }) {
  const { t } = useTranslation()

  const series = [
    { key: 'organic', label: t('dashboard.growth.organic'), color: '#7C3AED' },
    { key: 'paid',    label: t('dashboard.growth.paid'),    color: '#0EA5E9' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs principais do influenciador */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t('influenciador.overview.metrics.followers')}
          value={formatFollowers(inf.followers)}
          icon={Users}
        />
        <KpiCard
          label={t('influenciador.overview.metrics.engagement')}
          value={`${inf.engagement.toFixed(1)}%`}
          icon={Zap}
          progress={Math.min(100, inf.engagement * 10)}
        />
        <KpiCard
          label={t('influenciador.overview.metrics.organicReach')}
          value={`${inf.organicReach}%`}
          icon={Sparkles}
          progress={inf.organicReach}
        />
        <KpiCard
          label={t('influenciador.overview.metrics.paidReach')}
          value={`${inf.paidReach}%`}
          icon={Wallet}
          progress={inf.paidReach}
          progressVariant="warning"
        />
      </div>

      {/* Crescimento + integridade resumida */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card glass className="lg:col-span-2">
          <CardLabel>{t('dashboard.growth.title')}</CardLabel>
          <CardTitle className="mt-1.5">{t('dashboard.growth.title')}</CardTitle>
          <p className="mt-1 text-sm text-text-secondary">{t('dashboard.growth.subtitle')}</p>
          <div className="-mx-2 mt-5">
            <AreaStackedChart data={GROWTH_SERIES['30d']} series={series} height={260} />
          </div>
        </Card>

        <Card glass className="flex flex-col gap-5">
          <div>
            <CardLabel>{t('influenciador.kpis.brandCoherence')}</CardLabel>
            <CardTitle className="mt-1.5">{t('influenciador.kpis.brandCoherence')}</CardTitle>
          </div>
          <div className="space-y-5">
            <ProgressBar label={t('influenciador.kpis.brandCoherence')} value={inf.brandCoherence} showValue />
            <ProgressBar label={t('influenciador.kpis.sentimentIndex')} value={inf.sentimentScore} showValue variant="success" />
            <ProgressBar label={t('influenciador.kpis.botProbability')} value={inf.botProbability} showValue variant="danger" />
          </div>
          <div className="mt-auto rounded-xl border border-primary/15 bg-neutral-900/40 p-4">
            <span className="text-label">{t('influenciador.kpis.safetyRating')}</span>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-5xl font-extrabold text-gradient-brand">{inf.safetyRating}</span>
              <span className="mb-1 text-xs text-text-muted">/A+</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
