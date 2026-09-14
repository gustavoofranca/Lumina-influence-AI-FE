import { useTranslation } from 'react-i18next'
import { TrendingUp } from 'lucide-react'
import { TrendDown, TrendUp } from 'iconsax-reactjs'

import { cn } from '../../lib/cn.js'
import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'

// Quantos indicadores a faixa tem — o back-end sempre devolve estes quatro.
const KPI_SLOTS = 4

/**
 * Faixa de indicadores do painel.
 *
 * Eram quatro cartões de 157px para um número cada, com ícone decorativo no
 * canto. Agora é uma faixa só, dividida em quatro: o número ocupa o espaço que
 * precisa e o resto da tela sobe.
 *
 * A cor diz se o valor existe. Medido sai em `medido`; o que o sistema não sabe
 * no período sai em `nao-medido` — o travessão apagado é a mensagem, e por isso
 * o valor é texto grande (24px), onde o tom apagado ainda passa em contraste.
 *
 * A variação não usa verde nem rosa: rosa fica reservado para risco, e uma
 * queda de engajamento não é risco. A direção vem da seta e do sinal.
 *
 * Não reaproveita o `KpiCard` de propósito: ele segue servindo as abas do
 * criador, que ainda não passaram pela repaginação.
 */
export default function KpiGrid({ data, loading = false }) {
  const { t } = useTranslation()

  if (loading) {
    return <Skeleton className="h-[5.5rem]" rounded="rounded-superficie" />
  }

  if (!data?.length) {
    return (
      <Card>
        <EmptyState compact icon={TrendingUp} title={t('dashboard.empty')} />
      </Card>
    )
  }

  return (
    <Card as="dl" padding="none" className="grid grid-cols-2 xl:grid-cols-4">
      {data.slice(0, KPI_SLOTS).map((kpi, i) => (
        <Indicador
          key={kpi.key}
          label={t(`dashboard.kpis.${kpi.key}`)}
          kpi={kpi}
          hint={kpi.hint ? t('dashboard.kpis.cacOptimal') : undefined}
          className={divisorias(i)}
        />
      ))}
    </Card>
  )
}

/**
 * Fios entre as células. Em duas colunas a divisória vertical fica só na
 * coluna da direita e a horizontal só na segunda linha; em quatro, só a
 * vertical, e em todas menos a primeira.
 */
function divisorias(i) {
  return cn(
    'border-[color:var(--border-subtle)]',
    i % 2 === 1 && 'border-l',
    i >= 2 && 'border-t xl:border-t-0',
    i > 0 && 'xl:border-l'
  )
}

function Indicador({ label, kpi, hint, className }) {
  return (
    <div className={cn('min-w-0 px-5 py-4', className)}>
      <dt className="text-label">{label}</dt>
      <dd className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className={cn(
            'numerico font-display text-2xl font-bold leading-none',
            kpi.measured ? 'text-medido' : 'text-nao-medido'
          )}
        >
          {kpi.value}
        </span>
        <Variacao change={kpi.change} changeType={kpi.changeType} />
      </dd>
      {hint ? <dd className="tipo-apoio mt-1 text-text-muted">{hint}</dd> : null}
    </div>
  )
}

function Variacao({ change, changeType }) {
  if (change === undefined) return null

  const negativa = changeType ? changeType === 'negative' : typeof change === 'number' && change < 0
  const Seta = negativa ? TrendDown : TrendUp
  const texto = typeof change === 'number' ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : change

  return (
    <span className="numerico inline-flex items-center gap-1 text-xs font-semibold text-text-secondary">
      <Seta size={12} aria-hidden />
      {texto}
    </span>
  )
}
