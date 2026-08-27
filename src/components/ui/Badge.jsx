import { cn } from '../../lib/cn.js'

/**
 * Badge — pill com background semi-transparente da cor + texto solido.
 * Variantes refletem o vocabulario semantico do produto.
 */
const VARIANTS = {
  organic: 'bg-primary-600/15 text-accent ring-1 ring-inset ring-primary-500/20',
  paid:    'bg-secondary-500/15 text-tint-sky ring-1 ring-inset ring-secondary-500/20',
  success: 'bg-emerald-500/15 text-positive ring-1 ring-inset ring-emerald-500/20',
  warning: 'bg-amber-500/15 text-caution ring-1 ring-inset ring-amber-500/20',
  danger:  'bg-tertiary-500/15 text-tint-rose ring-1 ring-inset ring-tertiary-500/20',
  info:    'bg-secondary-500/15 text-tint-sky ring-1 ring-inset ring-secondary-500/20',
  neutral: 'bg-bg-elevated/60 text-text-primary ring-1 ring-inset ring-hairline/40',
}

const SIZES = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon: Icon = null,
  uppercase = true,
  className = '',
  ...rest
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        uppercase && 'uppercase tracking-label',
        SIZES[size],
        VARIANTS[variant],
        className
      )}
      {...rest}
    >
      {Icon ? <Icon size={size === 'sm' ? 10 : size === 'lg' ? 14 : 12} /> : null}
      {children}
    </span>
  )
}
