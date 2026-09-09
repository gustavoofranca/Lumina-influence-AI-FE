import { TrendDown, TrendUp } from 'iconsax-reactjs'

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

  const ChangeIcon = resolvedType === 'negative' ? TrendDown : TrendUp
  const formattedChange =
    typeof change === 'number'
      ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
      : change

  return (
    <Card className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-label">{label}</span>
          {/* O valor é o que a pessoa veio ver: `tipo-tela` é o degrau mais
              alto da escala, e aqui ele não compete com nada — o rótulo acima
              é apoio e o cartão não tem título. */}
          <div className="numerico tipo-tela mt-2 text-text-primary">
            {value}
          </div>
        </div>

        {/* O ícone é decoração, e por isso perde o realce.
            Ele tinha fundo violeta, anel violeta e a cor de destaque — o mesmo
            tratamento dos controles que aceitam clique. Numa tela com quatro
            KPIs, isso punha quatro alvos falsos no campo de visão e gastava a
            cor que deveria significar "aqui se age". Em cinza ele continua
            distinguindo os cartões de relance, que é a única função que tem. */}
        {Icon ? (
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-controle bg-bg-elevated text-text-muted">
            <Icon size={18} />
          </span>
        ) : null}
      </div>

      {(change !== undefined || hint) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {change !== undefined ? (
            <span className={cn('numerico inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold', changeColor)}>
              <ChangeIcon size={12} />
              {formattedChange}
            </span>
          ) : null}
          {hint ? (
            <span className="tipo-apoio text-text-muted">
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
