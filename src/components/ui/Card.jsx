import { cn } from '../../lib/cn.js'

const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

/**
 * Card — container base do design system.
 * - Padrao: bg-bg-surface, border subtle
 * - glass=true: glassmorphism (translucido + blur + border violeta sutil)
 * - hoverable=true: micro-elevacao em hover
 */
export default function Card({
  children,
  glass = false,
  hoverable = false,
  padding = 'md',
  as: Tag = 'div',
  className = '',
  ...rest
}) {
  return (
    <Tag
      className={cn(
        'rounded-2xl',
        glass
          ? 'card-glass'
          : 'bg-bg-surface border border-primary/10',
        hoverable && 'transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-glow-soft',
        PADDING[padding],
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>{children}</div>
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={cn('font-display text-xl font-bold text-text-primary', className)}>
      {children}
    </h3>
  )
}

export function CardLabel({ children, className = '' }) {
  return <span className={cn('text-label', className)}>{children}</span>
}
