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
 */
const COLOR_FALLBACK = ['#7C3AED', '#0EA5E9', '#F43F5E']

const formatNumber = (n) => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000)     return `${(n / 1_000).toFixed(0)}k`
  return new Intl.NumberFormat('pt-BR').format(n)
}

function CustomTooltip({ active, payload, label, formatValue }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-primary/20 bg-bg-base/95 px-3 py-2 shadow-glow-soft backdrop-blur">
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
}) {
  const baseId = useId()

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
