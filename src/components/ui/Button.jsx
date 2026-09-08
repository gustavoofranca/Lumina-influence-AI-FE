import { Refresh2 } from 'iconsax-reactjs'

import { cn } from '../../lib/cn.js'
// As telas de entrada usam o material da landing. Importar a receita é o que
// impede o botão do login de divergir do botão do herói com o tempo — foi
// exatamente assim que o seletor de idioma tinha divergido.
import { PILULA, PILULA_PRIMARIA } from '../landing/estilos.js'

/**
 * Button — 4 variantes oficiais (Figma):
 * - primary  : bg-primary-600 + glow violeta
 * - secondary: bg-bg-surface (acoes secundarias)
 * - inverted : bg branco + texto escuro (CTAs em fundo escuro destacado)
 * - outlined : transparente + borda primary + texto primary
 * - vidro / vidro-primaria : a pilula de vidro da landing (telas de entrada)
 */
const VARIANTS = {
  primary: cn(
    'bg-primary-600 text-white shadow-glow-primary',
    'hover:bg-primary-500 hover:shadow-[0_0_28px_rgba(124,58,237,0.55)]',
    'active:bg-primary-700'
  ),
  secondary: cn(
    'bg-bg-surface text-text-primary ring-1 ring-inset ring-hairline',
    'hover:bg-bg-elevated hover:ring-hairline',
    'active:bg-bg-surface'
  ),
  inverted: cn(
    'bg-white text-neutral-900',
    'hover:bg-neutral-200',
    'active:bg-neutral-300'
  ),
  outlined: cn(
    'bg-transparent text-accent ring-1 ring-inset ring-primary-500/60',
    'hover:bg-primary-600/10 hover:text-accent-strong hover:ring-primary-400',
    'active:bg-primary-600/20'
  ),
  // Pílula de vidro da landing, para as telas de entrada. É variante e não
  // `className` de propósito: sobrescrevendo por fora, o `hover:bg-primary-500`
  // da variante `primary` continuaria vivo e o botão viraria violeta sólido no
  // hover — a classe de hover não é anulada por uma classe de fundo sem hover.
  vidro: cn(PILULA, 'text-white'),
  'vidro-primaria': cn(PILULA_PRIMARIA, 'text-white'),
}

const SIZES = {
  sm: 'h-8  px-3 text-xs gap-1.5  rounded-xl',
  md: 'h-10 px-4 text-sm gap-2    rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-2xl',
}

const ICON_SIZE = { sm: 14, md: 16, lg: 18 }

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading
  const iconSize = ICON_SIZE[size]

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex select-none items-center justify-center font-semibold',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        SIZES[size],
        VARIANTS[variant],
        fullWidth && 'w-full',
        className
      )}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Refresh2 size={iconSize} className="animate-spin" />
      ) : LeftIcon ? (
        <LeftIcon size={iconSize} />
      ) : null}

      <span>{children}</span>

      {RightIcon && !loading ? <RightIcon size={iconSize} /> : null}
    </button>
  )
}
