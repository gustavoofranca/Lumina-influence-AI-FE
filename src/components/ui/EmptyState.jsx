import { cn } from '../../lib/cn.js'

/**
 * EmptyState — mensagem para quando não há dado a exibir.
 *
 * Existe para que nenhuma área do app fique em branco: sem dado, o usuário
 * precisa saber o motivo. Nunca use dado de exemplo no lugar disto — exibir
 * número inventado como se fosse real é pior que exibir nada.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  compact = false,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-center',
        compact ? 'py-8' : 'py-16',
        className
      )}
    >
      {Icon && (
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-text-muted">
          <Icon size={20} />
        </span>
      )}
      <h3 className="font-display text-base font-semibold text-neutral-200">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-text-secondary">{description}</p>
      )}
    </div>
  )
}
