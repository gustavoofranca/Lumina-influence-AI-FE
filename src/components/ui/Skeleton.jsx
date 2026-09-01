import { cn } from '../../lib/cn.js'

/**
 * Skeleton — bloco placeholder com shimmer animado.
 * Usar enquanto dados estao carregando (ex: cards de KPI).
 */
export default function Skeleton({
  className = '',
  rounded = 'rounded-md',
  ...rest
}) {
  return (
    <div
      aria-hidden
      // Marca estável para a verificação de carregamento. Sem texto e com
      // `aria-hidden`, este elemento é invisível para toda varredura que
      // percorre conteúdo — e foi por isso que ele passou meses saindo como
      // bloco escuro no tema claro sem nada acusar.
      data-skeleton=""
      className={cn(
        'animate-shimmer bg-[length:800px_100%]',
        // Gradiente entre superfície e elevado — os dois trocam com o tema. Em
        // neutral fixo, o placeholder saía como bloco escuro sobre o papel
        // claro, e a varredura de contraste não pegava porque não há texto aqui.
        'bg-[linear-gradient(90deg,rgb(var(--bg-surface-rgb))_0%,rgb(var(--bg-elevated-rgb))_50%,rgb(var(--bg-surface-rgb))_100%)]',
        rounded,
        className
      )}
      {...rest}
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}
