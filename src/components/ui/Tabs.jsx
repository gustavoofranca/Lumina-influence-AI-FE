import { cn } from '../../lib/cn.js'

/**
 * Tabs — barra horizontal com indicador animado (border-bottom violeta).
 *
 * Props:
 *   items   = [{ value, label, icon?, count? }]
 *   value   = string (controlado)
 *   onChange(nextValue)
 *   variant = 'underline' (padrao) | 'pills'
 */
const SIZES = {
  sm: 'text-xs',
  md: 'text-sm',
}

export default function Tabs({
  items = [],
  value,
  onChange,
  variant = 'underline',
  size = 'md',
  className = '',
}) {
  if (variant === 'pills') {
    // A barra é inline-flex para abraçar o conteúdo no desktop. O invólucro de
    // bloco existe para que ela role num celular em vez de ser cortada.
    return (
      <div className="overflow-x-auto">
      <div
        className={cn(
          'inline-flex gap-1 rounded-2xl bg-bg-surface p-1 ring-1 ring-inset ring-hairline',
          className
        )}
        role="tablist"
      >
        {items.map((item) => {
          const active = item.value === value
          const Icon = item.icon
          return (
            <button
              key={item.value}
              role="tab"
              aria-selected={active}
              onClick={() => onChange?.(item.value)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-semibold transition-all duration-200',
                SIZES[size],
                active
                  ? 'bg-primary-600 text-white shadow-glow-soft'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
              )}
            >
              {Icon ? <Icon size={14} /> : null}
              {item.label}
              {item.count !== undefined ? (
                <span className={cn('rounded-full px-1.5 text-[10px]', active ? 'bg-white/20' : 'bg-bg-elevated/80 text-text-muted')}>
                  {item.count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
      </div>
    )
  }

  // underline
  return (
    <div
      role="tablist"
      className={cn('flex gap-1 border-b border-hairline/80', className)}
    >
      {items.map((item) => {
        const active = item.value === value
        const Icon = item.icon
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(item.value)}
            className={cn(
              'group relative inline-flex items-center gap-2 px-4 py-3 font-semibold transition-colors',
              SIZES[size],
              active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {Icon ? <Icon size={14} /> : null}
            {item.label}
            {item.count !== undefined ? (
              <span className={cn(
                'rounded-full px-1.5 text-[10px] font-semibold',
                active ? 'bg-primary-600/25 text-accent-strong' : 'bg-bg-surface text-text-muted'
              )}>
                {item.count}
              </span>
            ) : null}

            {/* Indicador inferior (animado) */}
            <span
              className={cn(
                'pointer-events-none absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-all duration-300',
                active ? 'bg-primary-500 shadow-[0_0_12px_rgba(124,58,237,0.7)]' : 'bg-transparent'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
