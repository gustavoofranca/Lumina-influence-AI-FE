import { cn } from '../../lib/cn.js'
import LuminaMark from './LuminaMark.jsx'

/**
 * LuminaWordmark — marca + nome.
 *
 * O nome fica em HTML, não embutido na imagem: assim usa a fonte real do
 * produto, acompanha o zoom e continua sendo texto para busca e leitor de tela.
 *
 * Em cabeçalho, o símbolo horizontal fica alto demais para caber ao lado do
 * nome; por isso o padrão ali é `as="icon"`, o quadrado, que mantém a arte
 * legível em pouca altura.
 */
export default function LuminaWordmark({
  tone = 'brand',
  as = 'icon',
  showTagline = true,
  className = '',
  markClassName = 'w-8',
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LuminaMark tone={tone} as={as} className={cn('shrink-0 rounded-lg', markClassName)} />
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
          <span className="mt-1 text-[8.5px] font-semibold uppercase tracking-label text-text-muted">
            Influence AI
          </span>
        )}
      </span>
    </span>
  )
}
