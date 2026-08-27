import { useId } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

/**
 * DonutChart — pie chart com furo central + slot para conteudo customizado
 * no centro (numero, label, etc).
 *
 * Props:
 *   data:    Array<{ key, value, color }>
 *   centerContent: ReactNode (renderizado no centro)
 *   size:    number (default 200)
 *   thickness: number (default 18)
 */
export default function DonutChart({
  data = [],
  centerContent = null,
  size = 200,
  thickness = 16,
}) {
  const baseId = useId()

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <defs>
            {data.map((d, i) => (
              <linearGradient key={d.key} id={`${baseId}-${d.key}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor={d.color} stopOpacity={0.95} />
                <stop offset="100%" stopColor={d.color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>

          <Pie
            data={data}
            dataKey="value"
            nameKey="key"
            innerRadius={size / 2 - thickness}
            outerRadius={size / 2 - 2}
            startAngle={90}
            endAngle={-270}
            stroke="var(--bg-surface)"
            strokeWidth={2}
            paddingAngle={2}
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell key={d.key} fill={`url(#${baseId}-${d.key})`} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {centerContent ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
          {centerContent}
        </div>
      ) : null}
    </div>
  )
}
