import { useTranslation } from 'react-i18next'
import { Sparkles, Heart, ShieldCheck, Bot } from 'lucide-react'

import KpiCard from '../ui/KpiCard.jsx'
import SentimentHeatmap        from './diagnostic/SentimentHeatmap.jsx'
import AudienceIntegrityCard   from './diagnostic/AudienceIntegrityCard.jsx'
import VideoAuditCard          from './diagnostic/VideoAuditCard.jsx'
import NeuralConfidenceCard    from './diagnostic/NeuralConfidenceCard.jsx'
import TranscriptHighlight     from './diagnostic/TranscriptHighlight.jsx'
import RecommendationsCard     from './diagnostic/RecommendationsCard.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import {
  adaptAudienceIntegrity,
  adaptDiagnosticKpis,
  adaptKeywords,
  adaptNeuralConfidence,
  adaptRecommendations,
  adaptSentimentClusters,
} from '../../services/influencers.js'

const KPI_ICONS = {
  brandCoherence: Sparkles,
  sentimentIndex: Heart,
  safetyRating:   ShieldCheck,
  botProbability: Bot,
}

// O back-end devolve sempre os mesmos quatro indicadores de diagnostico.
const KPI_SLOTS = 4

export default function DiagnosticoTab({ analysis, loading = false }) {
  const { t } = useTranslation()
  const kpis = adaptDiagnosticKpis(analysis?.diagnostic_kpis)

  return (
    <div className="flex flex-col gap-6">
      {/* 4 KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading && Array.from({ length: KPI_SLOTS }, (_, i) => (
          <Skeleton key={i} className="h-28" rounded="rounded-2xl" />
        ))}
        {!loading && !kpis && (
          <div className="sm:col-span-2 xl:col-span-4">
            <EmptyState compact icon={Sparkles} title={t('influenciador.kpis.empty')} />
          </div>
        )}
        {!loading && kpis?.map((kpi) => (
          <KpiCard
            key={kpi.key}
            label={t(`influenciador.kpis.${kpi.key}`)}
            value={kpi.value + (kpi.suffix || '')}
            change={kpi.change}
            changeType={kpi.changeType}
            hint={kpi.hint}
            icon={KPI_ICONS[kpi.key]}
          />
        ))}
      </div>

      {/* Linha: Sentiment Heatmap (2 cols) + Audience (1 col) */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SentimentHeatmap
            clusters={adaptSentimentClusters(analysis?.sentiment_clusters)}
            keywords={adaptKeywords(analysis?.keywords)}
            loading={loading}
          />
        </div>
        <div>
          <AudienceIntegrityCard
            data={adaptAudienceIntegrity(analysis?.audience_integrity)}
            loading={loading}
          />
        </div>
      </section>

      {/* Linha: Video Audit (1 col) + Neural Confidence (2 cols) */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div><VideoAuditCard /></div>
        <div className="lg:col-span-2">
          <NeuralConfidenceCard
            data={adaptNeuralConfidence(analysis?.neural_confidence)}
            loading={loading}
          />
        </div>
      </section>

      {/* Transcript — a API ainda nao devolve os segmentos por tempo */}
      <TranscriptHighlight loading={loading} />

      {/* Recomendacoes */}
      <RecommendationsCard
        data={adaptRecommendations(analysis?.recommendations)}
        loading={loading}
      />
    </div>
  )
}
