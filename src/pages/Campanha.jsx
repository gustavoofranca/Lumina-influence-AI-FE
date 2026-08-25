import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Megaphone } from 'lucide-react'

import Button from '../components/ui/Button.jsx'
import CampanhaHeader     from '../components/campanha/CampanhaHeader.jsx'
import ParticipantesGrid  from '../components/campanha/ParticipantesGrid.jsx'
import BenchmarkTable     from '../components/campanha/BenchmarkTable.jsx'
import RadarComparison    from '../components/campanha/RadarComparison.jsx'
import { useApi } from '../hooks/useApi.js'
import { getCampaign, getCampaignBenchmarking } from '../services/campaigns.js'

export default function Campanha() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { data: campanha, loading } = useApi(() => getCampaign(id), [id])
  const { data: bench, loading: benchLoading } = useApi(() => getCampaignBenchmarking(id), [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!campanha) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-text-muted">
          <Megaphone size={22} />
        </span>
        <h2 className="font-display text-xl font-bold text-neutral-100">
          {t('campanhas.list.empty.title')}
        </h2>
        <Link to="/app/campanhas">
          <Button variant="primary" leftIcon={ArrowLeft}>
            {t('campanhas.detail.back')}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <CampanhaHeader campanha={campanha} metrics={bench?.totals} />

      <ParticipantesGrid participants={bench?.rows} loading={benchLoading} />

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BenchmarkTable rows={bench?.rows} loading={benchLoading} />
        </div>
        <div>
          <RadarComparison radar={bench?.radar} loading={benchLoading} />
        </div>
      </section>
    </div>
  )
}
