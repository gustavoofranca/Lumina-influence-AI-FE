import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity } from 'lucide-react'

import { cn } from '../../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../../ui/Card.jsx'
import EmptyState from '../../ui/EmptyState.jsx'
import Skeleton from '../../ui/Skeleton.jsx'
import Tabs from '../../ui/Tabs.jsx'

/**
 * Mapeia uma intensidade [0..1] para uma cor no gradiente brand
 * (tertiary -> primary -> secondary), criando o efeito de heatmap.
 */
function intensityToColor(value) {
  if (value < 0.3)  return { bg: 'rgba(244,63,94,0.85)',  glow: 'rgba(244,63,94,0.4)' }
  if (value < 0.55) return { bg: 'rgba(245,158,11,0.85)', glow: 'rgba(245,158,11,0.35)' }
  if (value < 0.75) return { bg: 'rgba(124,58,237,0.95)', glow: 'rgba(124,58,237,0.45)' }
  return { bg: 'rgba(14,165,233,0.95)', glow: 'rgba(14,165,233,0.5)' }
}

function HeatmapBars({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((d, i) => {
        const { bg, glow } = intensityToColor(d.value)
        const heightPct = Math.max(8, (d.value / max) * 100)
        return (
          <div
            key={i}
            className="group relative flex flex-1 flex-col items-center justify-end gap-2"
            title={`${d.x} · ${(d.value * 100).toFixed(0)}%`}
          >
            <div
              className="w-full rounded-t-md transition-all duration-200 group-hover:opacity-100"
              style={{
                height: `${heightPct}%`,
                background: `linear-gradient(to top, ${bg} 0%, ${bg.replace('0.95', '0.7').replace('0.85', '0.6')} 100%)`,
                boxShadow: `0 0 10px ${glow}`,
                opacity: 0.9,
              }}
            />
            <span className="text-[9px] font-medium uppercase tracking-wide text-text-muted">
              {d.x}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ClusterRow({ cluster, t }) {
  const colors = {
    technical:  'bg-primary-500',
    purchase:   'bg-secondary-500',
    neutral:    'bg-neutral-500',
    skepticism: 'bg-tertiary-500',
  }
  return (
    <li className="flex items-center gap-3">
      <span className={cn('h-1.5 w-1.5 rounded-full', colors[cluster.key])} />
      <span className="flex-1 text-sm text-text-secondary">
        {t(`influenciador.sentiment.clusters.${cluster.key}`)}
      </span>
      <span className="font-display text-sm font-bold text-text-primary tabular-nums">
        {cluster.value}%
      </span>
    </li>
  )
}

function KeywordPill({ word, weight, sentiment }) {
  const variant = {
    positive: 'bg-emerald-500/15 text-positive ring-emerald-500/25',
    neutral:  'bg-bg-elevated/60 text-text-primary ring-hairline/40',
    negative: 'bg-tertiary-500/15 text-tint-rose ring-tertiary-500/25',
  }[sentiment]

  // Tamanho proporcional ao peso (0.4 - 0.95) -> classes
  const size =
    weight >= 0.85 ? 'text-sm px-3 py-1.5'
    : weight >= 0.7 ? 'text-xs px-2.5 py-1.5'
    : weight >= 0.5 ? 'text-xs px-2.5 py-1'
    : 'text-[10px] px-2 py-0.5'

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-semibold ring-1 ring-inset',
      size, variant,
    )}>
      {word}
    </span>
  )
}

export default function SentimentHeatmap({ clusters, keywords, timeline, loading = false }) {
  const { t } = useTranslation()
  const [scope, setScope] = useState('24h')

  // A API ainda nao expoe serie temporal de sentimento. Sem ela, as abas de
  // 24h/7d nao tem o que alternar, entao nem sao renderizadas.
  const data = timeline?.[scope]

  const scopeTabs = [
    { value: '24h', label: t('influenciador.sentiment.tab24h') },
    { value: '7d',  label: t('influenciador.sentiment.tab7d') },
  ]

  return (
    <Card glass className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardLabel>{t('influenciador.sentiment.title')}</CardLabel>
          <CardTitle className="mt-1.5">{t('influenciador.sentiment.title')}</CardTitle>
          <p className="mt-1 text-sm text-text-secondary">{t('influenciador.sentiment.subtitle')}</p>
        </div>
        {data && <Tabs variant="pills" items={scopeTabs} value={scope} onChange={setScope} size="sm" />}
      </div>

      {/* Heatmap principal */}
      {loading ? (
        <Skeleton className="h-40" rounded="rounded-xl" />
      ) : data ? (
        <HeatmapBars data={data} />
      ) : (
        <EmptyState compact icon={Activity} title={t('influenciador.sentiment.timelineEmpty')} />
      )}

      {/* Clusters + keywords lado a lado */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <CardLabel>{t('influenciador.sentiment.clustersTitle')}</CardLabel>
          <ul className="mt-3 space-y-2.5">
            {(clusters || []).map((c) => (
              <ClusterRow key={c.key} cluster={c} t={t} />
            ))}
          </ul>
        </div>

        <div>
          <CardLabel>{t('influenciador.sentiment.keywordsTitle')}</CardLabel>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {(keywords || []).map((k) => (
              <KeywordPill key={k.word} {...k} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
