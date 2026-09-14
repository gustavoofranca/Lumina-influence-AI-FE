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

  // Orgânico na cor de medido; o pago leva o azul que fica reservado para a
  // segunda série de gráfico. As duas trocam de tom com o tema pela variável.
  const series = [
    { key: 'organic', label: t('dashboard.growth.organic'), color: 'var(--medido)' },
    { key: 'paid',    label: t('dashboard.growth.paid'),    color: 'var(--serie-2)' },
  ]

  return (
    <Card className="flex flex-col gap-5 p-[18px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardLabel>{t('dashboard.label')}</CardLabel>
          <CardTitle className="mt-1.5">{t('dashboard.growth.title')}</CardTitle>
          <p className="tipo-corpo mt-1 text-text-secondary">{t('dashboard.growth.subtitle')}</p>
        </div>
        <div className="hidden flex-col items-end gap-2 sm:flex">
          <LegendItem color={series[0].color} label={series[0].label} />
          <LegendItem color={series[1].color} label={series[1].label} />
        </div>
      </div>

      {/* O poço: a área do gráfico é chapada, sem a aurora passando por trás
          da linha. A escala termina no maior valor empilhado — arredondar para
          cima deixava o quarto de cima da caixa vazio. */}
      <div className="poco rounded-controle px-1 pb-1 pt-3">
        {loading ? (
          <Skeleton className="h-[280px]" rounded="rounded-xl" />
        ) : data?.length ? (
          <AreaStackedChart data={data} series={series} height={280} yMax="dataMax" />
        ) : (
          <EmptyState icon={TrendingUp} title={t('dashboard.growth.empty')} />
        )}
      </div>
    </Card>
  )
}
