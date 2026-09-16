import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import DashboardHeader        from '../components/dashboard/DashboardHeader.jsx'
import KpiGrid                from '../components/dashboard/KpiGrid.jsx'
import GrowthCard             from '../components/dashboard/GrowthCard.jsx'
import DiagnosticHighlightCard from '../components/dashboard/DiagnosticHighlightCard.jsx'
import TopNetworksTable       from '../components/dashboard/TopNetworksTable.jsx'
import NetworkDensityCard     from '../components/dashboard/NetworkDensityCard.jsx'
import ProcedenciaCard        from '../components/dashboard/ProcedenciaCard.jsx'
import ApiErrorBanner         from '../components/ui/ApiErrorBanner.jsx'
import { useApi } from '../hooks/useApi.js'
import { getOverview, getNetworkDensity, getCampaignOptions, getProcedencia } from '../services/dashboard.js'

export default function Dashboard() {
  const { t } = useTranslation()

  const [period, setPeriod]     = useState('30d')
  const [campaign, setCampaign] = useState('all')

  const { data: overview, loading, error, refetch} = useApi(
    () => getOverview({ period, campaignId: campaign }), [period, campaign])
  const { data: density, loading: loadingDensity, error: erroDensity,
          refetch: recarregarDensity } = useApi(getNetworkDensity, [])
  // Procedencia: fica ao lado dos KPIs de propósito. É o cartão que diz o que
  // os outros números não dizem — quanto do que está na tela foi medido.
  const { data: procedencia, loading: loadingProcedencia,
          error: erroProcedencia, refetch: recarregarProcedencia } =
    useApi(getProcedencia, [])
  // Sem o erro na mão, a lista que falhou cai calada no rótulo "Todas as
  // campanhas" e o usuário filtra — ou deixa de filtrar — sobre um seletor que
  // não carregou.
  const { data: campaignOpts, error: erroCampanhas,
          refetch: recarregarCampanhas } = useApi(getCampaignOptions, [])

  const campaignOptions = (campaignOpts || [{ value: 'all', name: t('dashboard.filters.allCampaigns') }])
    .map((c) => (c.value === 'all' ? { ...c, name: t('dashboard.filters.allCampaigns') } : c))

  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader
        period={period}
        onPeriodChange={setPeriod}
        campaign={campaign}
        onCampaignChange={setCampaign}
        campaigns={campaignOptions}
      />

      <ApiErrorBanner error={error} onRetry={refetch} />
      <ApiErrorBanner error={erroCampanhas} onRetry={recarregarCampanhas} />

      <KpiGrid data={overview?.kpis} loading={loading} />

      {/* Duas colunas contínuas, e não duas linhas. Em linhas, cada uma se
          alinhava pelo cartão mais alto e o mais baixo deixava buraco — 151px
          sob o gráfico numa, 197px sob a densidade na outra, 22% da página
          (medido a 1440px). Em colunas cada lado flui na própria altura e
          nada precisa se alinhar com nada.

          No celular a ordem é a do código: gráfico, tabela, destaque,
          densidade. Reordenar só visualmente separaria o que se vê do que o
          leitor de tela lê. */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          <GrowthCard data={overview?.growth} loading={loading} />
          <TopNetworksTable data={overview?.topNetworks} loading={loading} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          {/* Procedência vem antes do destaque de IA de propósito: é a
              resposta para "posso confiar nestes números?", e essa pergunta
              precede qualquer leitura do que os números dizem. */}
          {erroProcedencia ? (
            <ApiErrorBanner error={erroProcedencia} onRetry={recarregarProcedencia} />
          ) : (
            <ProcedenciaCard data={procedencia} loading={loadingProcedencia} />
          )}
          <DiagnosticHighlightCard data={overview?.featured} loading={loading} />
          {erroDensity ? (
            <ApiErrorBanner error={erroDensity} onRetry={recarregarDensity} />
          ) : (
            <NetworkDensityCard data={density} loading={loadingDensity} />
          )}
        </div>
      </section>
    </div>
  )
}
