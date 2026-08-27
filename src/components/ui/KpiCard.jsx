import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card from './Card.jsx'
import ProgressBar from './ProgressBar.jsx'

/**
 * KpiCard — card de indicador (Visao Geral, Diagnostico).
 *
 * Estrutura:
 *  - label uppercase (text-label)
 *  - valor grande em font-display 700
 *  - variacao % colorida (verde positivo / rosa negativo)
 *  - icone a direita (lucide)
 *  - barra de progresso opcional na base
 */
export default function KpiCard({
  label,
  value,
  change,
  changeType,         // 'positive' | 'negative' | 'neutral' | undefined (auto-detecta pelo sinal de change)
  changeSuffix = '',  // ex: ' vs ult. periodo'
  icon: Icon = null,
  progress,           // 0..100 (opcional)
  progressVariant = 'primary',
  hint,               // texto curto auxiliar
  className = '',
  glass = true,
}) {
  const resolvedType =
    changeType ||
    (typeof change === 'number'
      ? change > 0
        ? 'positive'
        : change < 0
        ? 'negative'
        : 'neutral'
      : undefined)

  const changeColor =
    resolvedType === 'positive'
      ? 'text-positive bg-emerald-500/10'
      : resolvedType === 'negative'
      ? 'text-tint-rose bg-tertiary-500/10'
      : 'text-text-secondary bg-bg-elevated/40'

  const ChangeIcon = resolvedType === 'negative' ? ArrowDownRight : ArrowUpRight
  const formattedChange =
    typeof change === 'number'
      ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
      : change

  return (
    <Card glass={glass} hoverable className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-label">{label}</span>
          <div className="mt-2 font-display text-3xl font-bold leading-none text-text-primary">
            {value}
          </div>
        </div>

        {Icon ? (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600/15 text-accent ring-1 ring-inset ring-primary-500/20">
            <Icon size={18} />
          </span>
        ) : null}
      </div>

      {(change !== undefined || hint) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {change !== undefined ? (
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold', changeColor)}>
              <ChangeIcon size={12} />
              {formattedChange}
            </span>
          ) : null}
          {hint ? (
            <span className="text-text-muted">
              {changeSuffix || hint}
            </span>
          ) : null}
        </div>
      )}

      {typeof progress === 'number' ? (
        <ProgressBar value={progress} variant={progressVariant} size="sm" />
      ) : null}
    </Card>
  )
}
