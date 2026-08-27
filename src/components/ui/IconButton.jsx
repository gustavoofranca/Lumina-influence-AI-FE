import { cn } from '../../lib/cn.js'

const VARIANTS = {
  primary: cn(
    'bg-primary-600 text-white shadow-glow-soft',
    'hover:bg-primary-500 hover:shadow-glow-primary',
    'active:bg-primary-700'
  ),
  secondary: cn(
    'bg-secondary-500/15 text-tint-sky ring-1 ring-inset ring-secondary-500/30',
    'hover:bg-secondary-500/25 hover:text-tint-sky',
    'active:bg-secondary-500/35'
  ),
  tertiary: cn(
    'bg-tertiary-500/15 text-tint-rose ring-1 ring-inset ring-tertiary-500/30',
    'hover:bg-tertiary-500/25 hover:text-tint-rose',
    'active:bg-tertiary-500/35'
  ),
  ghost: cn(
    'bg-transparent text-text-secondary ring-1 ring-inset ring-transparent',
    'hover:bg-bg-surface hover:text-text-primary hover:ring-hairline',
    'active:bg-bg-elevated'
  ),
}

const SIZES = {
  sm: { box: 'h-8 w-8',   icon: 16 },
  md: { box: 'h-10 w-10', icon: 18 },
  lg: { box: 'h-12 w-12', icon: 20 },
}

/**
 * IconButton — botao quadrado arredondado (rounded-2xl) com 1 icone.
 * Usar em topbar, toolbars e cards (ex: notificacoes, ajuda).
 */
export default function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  badge = null,
  type = 'button',
  className = '',
  ...rest
}) {
  const dims = SIZES[size]
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        'relative inline-flex items-center justify-center rounded-2xl',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        'disabled:cursor-not-allowed disabled:opacity-50',
        dims.box,
        VARIANTS[variant],
        className
      )}
      {...rest}
    >
      {Icon ? <Icon size={dims.icon} /> : null}
      {badge !== null && badge !== undefined ? (
        <span
          className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-tertiary-500 px-1 text-[10px] font-bold text-white ring-2 ring-bg-base"
          aria-label={`${badge} novas notificacoes`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  )
}
