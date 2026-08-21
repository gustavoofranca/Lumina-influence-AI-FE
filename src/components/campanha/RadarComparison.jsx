import { useTranslation } from 'react-i18next'
import { Radar as RadarIcon } from 'lucide-react'

import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import RadarChart from '../charts/RadarChart.jsx'

const RADAR_COLORS = ['#7C3AED', '#0EA5E9', '#22C55E', '#F43F5E']

// Acima de 4 séries o radar deixa de ser legível.
const MAX_ENTITIES = 4

export default function RadarComparison({ radar, loading = false }) {
  const { t } = useTranslation()

  // As dimensões vêm da API; aqui só traduzimos o rótulo do eixo.
  const data = (radar?.data || []).map((row) => ({
    ...row,
    axis: t(`campanhas.detail.radar.axes.${row.axis}`, row.axis),
  }))

  const entities = (radar?.entities || [])
    .slice(0, MAX_ENTITIES)
    .map((e, i) => ({ ...e, color: RADAR_COLORS[i] }))

  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('campanhas.detail.radar.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('campanhas.detail.radar.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('campanhas.detail.radar.subtitle')}</p>
      </div>

      {loading ? (
        <Skeleton className="h-[360px]" rounded="rounded-2xl" />
      ) : entities.length === 0 ? (
        <EmptyState compact icon={RadarIcon} title={t('campanhas.detail.radar.empty')} />
      ) : (
        <RadarChart data={data} entities={entities} height={360} />
      )}
    </Card>
  )
}
