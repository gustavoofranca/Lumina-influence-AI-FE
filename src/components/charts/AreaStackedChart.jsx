import { useId } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/**
 * AreaStackedChart — wrapper Recharts com identidade Lumina.
 *
 * Props:
 *   data:    Array<{ x: string, [seriesKey]: number }>
 *   series:  Array<{ key, label, color }> (em ordem de empilhamento)
 *   height:  number (default 280)
 *   formatValue: (v) => string
 *   yMax:    teto do eixo Y (default 'auto'). `'dataMax'` termina a escala no
 *            maior valor empilhado, em vez de arredondar para cima.
 */
const COLOR_FALLBACK = ['#7C3AED', '#0EA5E9', '#F43F5E']

const formatNumber = (n) => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000)     return `${(n / 1_000).toFixed(0)}k`
  return new Intl.NumberFormat('pt-BR').format(n)
}

/**
 * Rótulos do eixo Y quando a escala termina no maior valor.
 *
 * Com o teto em `dataMax`, o Recharts escolhe marcas que incluem o próprio teto
 * — sai `0, 150k, 439k`, com o último intervalo duas vezes maior que o primeiro
 * e a grade mentindo sobre a proporção. Aqui o passo é redondo (1, 2, 2,5 ou 5
 * vezes uma potência de dez) e as marcas param antes do teto: a caixa termina
 * no valor real, os rótulos continuam equidistantes.
 */
function marcasAteOTeto(data, series) {
  const teto = Math.max(0, ...data.map((ponto) =>
    series.reduce((soma, s) => soma + (Number(ponto[s.key]) || 0), 0)))
  if (teto === 0) return undefined

  const bruto = teto / 5
  const potencia = 10 ** Math.floor(Math.log10(bruto))
  const fator = [1, 2, 2.5, 5, 10].find((f) => bruto / potencia <= f)
  const passo = fator * potencia

  const marcas = []
  for (let v = 0; v <= teto; v += passo) marcas.push(v)
  return marcas
}

function CustomTooltip({ active, payload, label, formatValue }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-controle border border-[color:var(--border-subtle)] bg-bg-base/95 px-3 py-2 shadow-2 backdrop-blur">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-label text-text-muted">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-text-secondary">{entry.name}:</span>
            <span className="ml-auto font-semibold text-text-primary">
              {formatValue(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AreaStackedChart({
  data = [],
  series = [],
  height = 280,
  formatValue = formatNumber,
  yMax = 'auto',
}) {
  const baseId = useId()
  const marcas = yMax === 'dataMax' ? marcasAteOTeto(data, series) : undefined

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <defs>
          {series.map((s, i) => {
            const color = s.color || COLOR_FALLBACK[i] || 'var(--primary-600)'
            return (
              <linearGradient key={s.key} id={`${baseId}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.5} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            )
          })}
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" vertical={false} />

        <XAxis
          dataKey="x"
          stroke="var(--chart-text)"
          tick={{ fill: 'var(--chart-text)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, yMax]}
          ticks={marcas}
          stroke="var(--chart-text)"
          tick={{ fill: 'var(--chart-text)', fontSize: 11 }}
          tickFormatter={formatValue}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          cursor={{ stroke: 'rgba(124,58,237,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }}
          content={<CustomTooltip formatValue={formatValue} />}
        />

        {series.map((s, i) => {
          const color = s.color || COLOR_FALLBACK[i] || 'var(--primary-600)'
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label || s.key}
              stackId="1"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${baseId}-${s.key})`}
              fillOpacity={1}
            />
          )
        })}
      </AreaChart>
    </ResponsiveContainer>
  )
}
