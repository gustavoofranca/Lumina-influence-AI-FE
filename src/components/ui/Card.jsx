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

/**
 * Título de cartão. Nasce como `h2` porque um cartão é seção direta da página,
 * e a única coisa acima dele é o `h1` da tela — sair de `h1` para `h3`, como
 * era antes, pula um nível e quebra a navegação por cabeçalho no leitor de
 * tela. `as` existe para os cartões aninhados dentro de outro cartão.
 */
export function CardTitle({ children, className = '', as: Tag = 'h2' }) {
  return (
    <Tag className={cn('font-display text-xl font-bold text-text-primary', className)}>
      {children}
    </Tag>
  )
}

export function CardLabel({ children, className = '' }) {
  return <span className={cn('text-label', className)}>{children}</span>
}
