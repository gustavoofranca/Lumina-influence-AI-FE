import { useTranslation } from 'react-i18next'
import { Network } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel } from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'

/**
 * NodeMapPreview — visualização decorativa de nós conectados.
 * Renderizado em SVG, sem dados reais — só dá a sensação do que viria depois.
 */
function NodeMapPreview() {
  // Posições dos nós (em %)
  const NODES = [
    { cx: 50, cy: 50, r: 5, primary: true },        // centro
    { cx: 22, cy: 30, r: 3 },
    { cx: 80, cy: 28, r: 3.5 },
    { cx: 78, cy: 70, r: 4 },
    { cx: 24, cy: 76, r: 3 },
    { cx: 12, cy: 52, r: 2.5 },
    { cx: 88, cy: 50, r: 3 },
    { cx: 50, cy: 12, r: 2.5 },
    { cx: 50, cy: 88, r: 3 },
  ]

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/15 bg-bg-base/60 aspect-[4/3]">
      {/* Glow radial atrás */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.25) 0%, transparent 60%)' }}
      />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* Conexões (linhas do centro até cada nó) */}
        {NODES.slice(1).map((n, i) => (
          <line
            key={`line-${i}`}
            x1={50} y1={50}
            x2={n.cx} y2={n.cy}
            stroke="rgba(124,58,237,0.35)"
            strokeWidth="0.4"
            strokeDasharray="1.5 1.5"
          />
        ))}
        {/* Nós */}
        {NODES.map((n, i) => (
          <g key={`node-${i}`}>
            {n.primary && (
              <circle
                cx={n.cx} cy={n.cy} r={n.r * 2}
                fill="rgba(124,58,237,0.25)"
                className="animate-pulse-dot"
              />
            )}
            <circle
              cx={n.cx} cy={n.cy} r={n.r}
              fill={n.primary ? '#A78BFA' : '#7C3AED'}
              opacity={n.primary ? 1 : 0.85}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}

export default function NetworkDensityCard({ data, loading = false }) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card glass className="flex flex-col gap-5">
        <CardLabel>{t('dashboard.networkDensity.label')}</CardLabel>
        <Skeleton className="h-16 w-40" rounded="rounded-xl" />
        <Skeleton className="h-48" rounded="rounded-2xl" />
      </Card>
    )
  }

  if (!data) {
    return (
      <Card glass>
        <CardLabel>{t('dashboard.networkDensity.label')}</CardLabel>
        <EmptyState icon={Network} title={t('dashboard.networkDensity.empty')} />
      </Card>
    )
  }

  const { value, total, connected } = data

  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('dashboard.networkDensity.label')}</CardLabel>
        <div className="mt-3 flex items-end gap-2">
          <span className="font-display text-6xl font-extrabold leading-none text-gradient-brand tabular-nums">
            {value}
          </span>
          <span className="mb-1 font-display text-xl font-bold text-text-muted">
            /100
          </span>
        </div>
        <p className={cn('mt-2 text-sm text-text-secondary')}>
          {t('dashboard.networkDensity.subtitle', { connected, total })}
        </p>
      </div>

      <NodeMapPreview />
    </Card>
  )
}
