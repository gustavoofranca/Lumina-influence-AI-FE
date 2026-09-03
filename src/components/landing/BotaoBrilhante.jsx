import { cn } from '../../lib/cn.js'
import { PILULA_PRIMARIA, TEXTO_PILULA } from './estilos.js'

/**
 * Pílula de vidro com luz correndo pela borda.
 *
 * O problema desta peça é que o miolo precisa ser **transparente** e o
 * gradiente giratório precisa aparecer **só** na faixa de 1px. Deixar o
 * gradiente atrás de um miolo translúcido faz uma mancha colorida girar por
 * dentro do botão; deixar o miolo opaco resolve a mancha e mata o vidro.
 *
 * A saída é recortar o anel: o elemento que contém o gradiente recebe duas
 * máscaras — uma limitada à caixa de conteúdo e outra à caixa inteira — e
 * `mask-composite: exclude` subtrai a primeira da segunda. Sobra exatamente a
 * moldura de 1px, e o miolo continua vendo a página através do vidro.
 *
 * O quadrado que gira usa `aspect-square w-[200%]`: precisa cobrir a diagonal
 * do botão em qualquer ângulo, senão aparecem cantos apagados a cada quarto de
 * volta. `prefers-reduced-motion` congela o giro — a borda continua colorida,
 * sem a repetição infinita.
 */
const RECORTE_DE_ANEL = {
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  maskComposite: 'exclude',
}

export default function BotaoBrilhante({ as: Tag = 'button', className, children, ...props }) {
  return (
    <Tag className={cn('relative isolate inline-flex rounded-full', className)} {...props}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full p-px"
        style={RECORTE_DE_ANEL}
      >
        <span
          className="absolute left-1/2 top-1/2 aspect-square w-[200%] animate-girar-brilho motion-reduce:animate-none"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0%, rgba(189,157,255,0.95) 10%, rgba(52,181,250,0.75) 20%, transparent 32%, transparent 100%)',
          }}
        />
      </span>

      <span
        className={cn(
          PILULA_PRIMARIA, TEXTO_PILULA,
          'w-full px-7 py-3 font-display text-base font-semibold'
        )}
      >
        {children}
      </span>
    </Tag>
  )
}
