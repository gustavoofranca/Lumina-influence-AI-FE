import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import DashboardHeader        from '../components/dashboard/DashboardHeader.jsx'
import KpiGrid                from '../components/dashboard/KpiGrid.jsx'
import GrowthCard             from '../components/dashboard/GrowthCard.jsx'
import DiagnosticHighlightCard from '../components/dashboard/DiagnosticHighlightCard.jsx'
import TopNetworksTable       from '../components/dashboard/TopNetworksTable.jsx'
import NetworkDensityCard     from '../components/dashboard/NetworkDensityCard.jsx'
import ApiErrorBanner         from '../components/ui/ApiErrorBanner.jsx'
import { useApi } from '../hooks/useApi.js'
import { getOverview, getNetworkDensity, getCampaignOptions } from '../services/dashboard.js'

export default function Dashboard() {
  const { t } = useTranslation()

  const [period, setPeriod]     = useState('30d')
  const [campaign, setCampaign] = useState('all')

  const { data: overview, loading, error, refetch} = useApi(
    () => getOverview({ period, campaignId: campaign }), [period, campaign])
  const { data: density, loading: loadingDensity } = useApi(getNetworkDensity, [])
  const { data: campaignOpts } = useApi(getCampaignOptions, [])

  const campaignOptions = (campaignOpts || [{ value: 'all', name: t('dashboard.filters.allCampaigns') }])
    .map((c) => (c.value === 'all' ? { ...c, name: t('dashboard.filters.allCampaigns') } : c))

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        period={period}
        onPeriodChange={setPeriod}
        campaign={campaign}
        onCampaignChange={setCampaign}
        campaigns={campaignOptions}
      />

      <ApiErrorBanner error={error} onRetry={refetch} />

      <KpiGrid data={overview?.kpis} loading={loading} />

      {/* Linha 1: Growth (2 cols) + Diagnostico em destaque (1 col) */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GrowthCard data={overview?.growth} loading={loading} />
        </div>
        <div>
          <DiagnosticHighlightCard data={overview?.featured} loading={loading} />
        </div>
      </section>

      {/* Linha 2: Top Networks (2 cols) + Network Density (1 col) */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopNetworksTable data={overview?.topNetworks} loading={loading} />
        </div>
        <div>
          <NetworkDensityCard data={density} loading={loadingDensity} />
        </div>
      </section>
    </div>
  )
}
