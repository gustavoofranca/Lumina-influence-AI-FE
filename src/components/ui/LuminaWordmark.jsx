import { cn } from '../../lib/cn.js'
import LuminaMark from './LuminaMark.jsx'

/**
 * LuminaWordmark — símbolo + nome da marca.
 *
 * O nome fica em HTML, não no SVG: assim usa a fonte real do produto, cresce
 * com o zoom do navegador e continua sendo texto para busca e leitor de tela.
 *
 * Use `compact` sempre que o símbolo ficar abaixo de ~64px de largura — que é
 * o caso de todo cabeçalho. A versão de cinco sinais só se lê grande.
 */
export default function LuminaWordmark({
  tone = 'brand',
  compact = false,
  showTagline = true,
  className = '',
  markClassName = 'w-9',
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LuminaMark tone={tone} compact={compact} className={markClassName} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-lg font-extrabold tracking-display-tight',
            tone === 'brand' ? 'text-gradient-brand' : 'text-current'
          )}
        >
          Lumina
        </span>
        {showTagline && (
          <span className="mt-0.5 text-[8.5px] font-semibold uppercase tracking-label text-text-muted">
            Influence AI
          </span>
        )}
      </span>
    </span>
  )
}
