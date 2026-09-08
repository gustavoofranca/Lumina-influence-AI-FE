import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

const COLORS = ['#7C3AED', '#0EA5E9', '#22C55E', '#F43F5E']

/**
 * RadarChart — comparacao multidimensional de N entidades.
 *
 * Props:
 *   data:    Array<{ axis: string, [entityKey]: number }>
 *   entities: Array<{ key, label, color? }>
 *   height:  number (default 320)
 */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-controle border border-[color:var(--border-subtle)] bg-bg-base/95 px-3 py-2 shadow-2 backdrop-blur">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-label text-text-muted">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-text-secondary">{entry.name}</span>
            <span className="ml-auto font-semibold text-text-primary tabular-nums">
              {Math.round(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RadarChart({ data, entities, height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadar data={data} outerRadius="75%">
        <PolarGrid stroke="var(--chart-grid)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: 'var(--chart-text)', fontSize: 11, fontWeight: 600 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: 'var(--chart-text)', fontSize: 10 }}
          tickCount={5}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />

        {entities.map((entity, i) => {
          const color = entity.color || COLORS[i % COLORS.length]
          return (
            <Radar
              key={entity.key}
              name={entity.label}
              dataKey={entity.key}
              stroke={color}
              fill={color}
              fillOpacity={0.18}
              strokeWidth={2}
            />
          )
        })}

        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) => <span className="text-text-secondary">{value}</span>}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
