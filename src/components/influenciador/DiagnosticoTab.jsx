import { useTranslation } from 'react-i18next'
import { Sparkles, Heart, ShieldCheck, Bot } from 'lucide-react'

import KpiCard from '../ui/KpiCard.jsx'
import SentimentHeatmap        from './diagnostic/SentimentHeatmap.jsx'
import AudienceIntegrityCard   from './diagnostic/AudienceIntegrityCard.jsx'
import VideoAuditCard          from './diagnostic/VideoAuditCard.jsx'
import NeuralConfidenceCard    from './diagnostic/NeuralConfidenceCard.jsx'
import TranscriptHighlight     from './diagnostic/TranscriptHighlight.jsx'
import RecommendationsCard     from './diagnostic/RecommendationsCard.jsx'
import { DIAGNOSTIC_KPIS } from '../../mocks/analise.js'
import { adaptDiagnosticKpis } from '../../services/influencers.js'

const KPI_ICONS = {
  brandCoherence: Sparkles,
  sentimentIndex: Heart,
  safetyRating:   ShieldCheck,
  botProbability: Bot,
}

export default function DiagnosticoTab({ analysis }) {
  const { t } = useTranslation()
  const kpis = adaptDiagnosticKpis(analysis?.diagnostic_kpis) || DIAGNOSTIC_KPIS

  return (
    <div className="flex flex-col gap-6">
      {/* 4 KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
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
        <div className="lg:col-span-2"><SentimentHeatmap /></div>
        <div><AudienceIntegrityCard /></div>
      </section>

      {/* Linha: Video Audit (1 col) + Neural Confidence (2 cols) */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div><VideoAuditCard /></div>
        <div className="lg:col-span-2"><NeuralConfidenceCard /></div>
      </section>

      {/* Transcript */}
      <TranscriptHighlight />

      {/* Recomendacoes */}
      <RecommendationsCard />
    </div>
  )
}
