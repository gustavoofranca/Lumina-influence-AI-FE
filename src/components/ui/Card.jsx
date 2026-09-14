import { cn } from '../../lib/cn.js'

const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

/**
 * Card — a moldura de conteúdo do produto.
 *
 * No escuro é vidro: a aurora do fundo passa pela moldura. O número não. Todo
 * bloco que carrega dado — área de gráfico, corpo de tabela, barra — fica num
 * poço chapado dentro do cartão (`.poco`), porque número precisa de fundo
 * quieto e vidro atrás de valor é ruído sobre ele.
 *
 * É a divisão que o macOS faz, empurrada um passo para dentro: a lateral do
 * Finder é translúcida, a lista de arquivos não. Aqui a moldura do cartão é
 * translúcida, o miolo onde se lê não. No tema claro nada disso é vidro — as
 * variáveis entregam superfície sólida, e o seletor é o mesmo.
 *
 * `hoverable` é só para cartão que leva a algum lugar. Em cartão de leitura ele
 * promete um clique que não existe.
 */
export default function Card({
  children,
  hoverable = false,
  padding = 'md',
  as: Tag = 'div',
  className = '',
  ...rest
}) {
  return (
    <Tag
      className={cn(
        'superficie rounded-superficie',
        hoverable && 'transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-2',
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
    <Tag className={cn('tipo-secao text-text-primary', className)}>
      {children}
    </Tag>
  )
}

export function CardLabel({ children, className = '' }) {
  return <span className={cn('text-label', className)}>{children}</span>
}
