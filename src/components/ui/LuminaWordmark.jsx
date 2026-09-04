import { cn } from '../../lib/cn.js'

/**
 * LuminaWordmark — o nome, e só o nome.
 *
 * O símbolo saiu do lado esquerdo: com o nome já escrito por extenso, o
 * conjunto repetia a mesma informação duas vezes e comia largura de uma barra
 * que precisa dela para os links. A arte continua no projeto e continua sendo
 * usada onde ela trabalha sozinha — favicon, ícone do app, cabeçalho do PDF.
 *
 * ## O desenho
 *
 * "Lumina" em branco, "AI" no degradê da marca, e o pingo do "i" trocado pelo
 * brilho. Três coisas, e a terceira é a única que pede explicação.
 *
 * O pingo não é um enfeite ao lado da palavra: ele **ocupa o lugar** do ponto.
 * Para isso a letra precisa vir sem ponto — daí o `ı` (U+0131, i sem pingo), e
 * não um `i` com alguma coisa por cima, que deixaria os dois visíveis. O brilho
 * é posicionado contra a própria letra e dimensionado em `em`, então acompanha
 * o corpo do texto em qualquer tamanho sem precisar de um valor por ponto de
 * uso.
 *
 * ## Por que uma família própria
 *
 * `font-marca` existe só aqui. A referência é um logotipo pesado, de terminais
 * arredondados e caixa baixa; é um desenho que funciona numa palavra e destrói
 * um parágrafo. Mantê-la fora de `display` e `sans` é o que impede isso de
 * escapar para o resto da página.
 */

/**
 * O brilho de quatro pontas.
 *
 * É o mesmo desenho que ficava à esquerda do nome antes da arte da marca
 * chegar, com duas diferenças que a escala impôs.
 *
 * Vem em SVG próprio, e não pelo pacote de ícones: o traço de lá é fixo em 2px,
 * que num pingo de 10px é grosso demais. Este é preenchido, então encolhe sem
 * engordar.
 *
 * E é **uma** estrela, não três. O desenho original traz duas faíscas menores
 * em volta; medido na tela, elas ocupam menos de 3px cada e não leem como
 * faísca — leem como sujeira ao lado da palavra. O que sobrevive à redução é a
 * ponta longa da estrela principal.
 */
function Brilho({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 0c.32 0 .6.21.68.52l1.3 4.72a7.4 7.4 0 0 0 4.78 4.78l4.72 1.3a.71.71 0 0 1 0 1.36l-4.72 1.3a7.4 7.4 0 0 0-4.78 4.78l-1.3 4.72a.71.71 0 0 1-1.36 0l-1.3-4.72a7.4 7.4 0 0 0-4.78-4.78l-4.72-1.3a.71.71 0 0 1 0-1.36l4.72-1.3a7.4 7.4 0 0 0 4.78-4.78l1.3-4.72A.71.71 0 0 1 12 0Z" />
    </svg>
  )
}

export default function LuminaWordmark({
  /** `brand` põe "AI" no degradê; `mono` deixa tudo na cor herdada. */
  tone = 'brand',
  className = '',
  /** Corpo do nome. Em `em`, tudo o mais acompanha. */
  tamanho = 'text-[1.35rem]',
}) {
  const gradiente = tone === 'brand'

  return (
    <span
      className={cn(
        'inline-flex select-none items-baseline font-marca font-extrabold leading-none',
        // O logotipo de referência é inclinado e de letras quase encostadas.
        // A família não tem itálico desenhado, então a inclinação vem de
        // `skewX` — em `-6deg`, que é o bastante para dar o gesto sem que as
        // hastes verticais fiquem tortas o suficiente para incomodar.
        '[transform:skewX(-6deg)] tracking-[-0.02em]',
        tamanho,
        className
      )}
    >
      {/* O nome de verdade, para quem não vê o desenho.
          O `ı` sem pingo é escolha visual, mas é um caractere diferente do `i`:
          o texto renderizado vira "LumınaAI", que leitor de tela pronuncia
          errado e busca de página não encontra. As letras desenhadas saem da
          árvore de acessibilidade e este texto entra no lugar delas. */}
      <span className="sr-only">Lumina AI</span>

      <span aria-hidden className={gradiente ? 'text-white' : 'text-current'}>
        Lum
        {/* A letra e o brilho andam juntos: `relative` aqui é o que dá ao
            pingo um sistema de coordenadas do tamanho da própria letra. */}
        <span className="relative inline-block">
          ı
          <Brilho
            className={cn(
              // `bottom` mede a partir da linha de base da letra, então o
              // brilho sobe junto com a altura de x em qualquer corpo.
              // `bottom` em `em` porque o topo do `ı` fica a 0,51em da base da
              // caixa nesta fonte — medido, não estimado. A 0,60em a folga era
              // de 2px e a estrela, quase da altura da letra: os dois se
              // encostavam e o conjunto lia como espinho, não como pingo.
              // O `skewX` positivo desfaz a inclinação do conjunto: letra
              // inclinada é gesto, estrela inclinada é defeito.
              'pointer-events-none absolute bottom-[0.66em] left-1/2 w-[0.36em]',
              '[transform:translateX(-50%)_skewX(6deg)]',
              gradiente ? 'text-accent' : 'text-current'
            )}
          />
        </span>
        na
      </span>
      <span
        aria-hidden
        className={cn(
          // A folga é menor que um espaço inteiro: "Lumina" e "AI" são uma
          // marca só, não duas palavras.
          'ml-[0.18em]',
          gradiente ? 'text-gradient-brand' : 'text-current'
        )}
      >
        AI
      </span>
    </span>
  )
}
