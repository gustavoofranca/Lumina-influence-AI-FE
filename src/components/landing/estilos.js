/**
 * Tratamentos de superfície da landing, num lugar só.
 *
 * Cada um foi medido no arquivo de referência e adaptado à paleta da Lumina.
 * Ficam aqui porque são usados em cinco seções: repetir a lista de classes em
 * cada uma é exatamente como elas divergem — uma recebe o ajuste e as outras
 * quatro não.
 */

/**
 * Moldura de 1px em degradê. Vai no elemento externo; o miolo entra dentro.
 *
 * `border-image` não convive com `border-radius`, então a borda é desenhada
 * como fundo: o pai carrega o degradê e um filho recuado 1px carrega a cor
 * sólida. A alternativa com `background-clip: padding-box, border-box` faz o
 * mesmo em um elemento só, mas quebra quando o miolo precisa de
 * `backdrop-filter` — que é o caso aqui.
 */
// `relative` porque o `AnelDeRefracao` se posiciona contra esta caixa.
export const MOLDURA = 'relative rounded-2xl bg-moldura-cartao p-px'

/**
 * Miolo do cartão.
 *
 * A tinta era `/85` — 85% de opacidade, ou seja, painel sólido com um
 * `backdrop-blur` que não tinha o que borrar. É por isso que o vidro não
 * aparecia: o efeito depende de o fundo atravessar.
 *
 * `/40` deixa o campo de estrelas passar e ainda dá base suficiente para o
 * texto. Zero seria vidro de verdade, mas o corpo do cartão é texto corrido
 * sobre um fundo animado, e aí a leitura é que paga.
 */
export const MIOLO = 'rounded-[15px] bg-landing-surface/40 backdrop-blur-2xl'

/** Miolo com a aura violeta descendo do topo, para o cartão em destaque. */
export const MIOLO_COM_AURA = `${MIOLO} bg-[radial-gradient(120%_100%_at_50%_0%,rgba(133,102,255,0.14)_0%,rgba(133,102,255,0)_60%)]`

/**
 * Pílula de vidro: fundo transparente, luz só nas arestas.
 *
 * A pilha de sombras internas vem da técnica do `LiquidButton`, com uma
 * escolha deliberada: **as duas sombras de preenchimento largo foram
 * descartadas.** No original elas são
 * `inset 0 0 6px 6px rgba(255,255,255,0.12)` e `inset 0 0 2px 2px …0.06` —
 * iluminam o miolo, e é justamente o que não se quer aqui.
 *
 * O que ficou tem espalhamento negativo maior que o desfoque
 * (`0.5px -3.5px`), e é isso que prende cada sombra à aresta em vez de
 * deixá-la vazar para dentro. A aresta inferior direita é a mais clara: a luz
 * da página vem de cima, então é embaixo que a borda de vidro acende.
 *
 * Fundo `transparent` de verdade — o `backdrop-blur` sozinho já dá o vidro,
 * e qualquer tinta no fundo mata a transparência que o efeito depende.
 */
export const PILULA = [
  'inline-flex items-center justify-center rounded-full bg-transparent backdrop-blur-[4px]',
  'shadow-[inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.28),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.5),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.5),0_0_12px_rgba(255,255,255,0.10)]',
  'transition-shadow hover:shadow-[inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.4),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,1),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.7),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.7),0_0_18px_rgba(255,255,255,0.16)]',
].join(' ')

/** Mesma aresta de vidro, com a luz puxada para o violeta da marca. */
export const PILULA_PRIMARIA = [
  'inline-flex items-center justify-center rounded-full bg-transparent backdrop-blur-[4px]',
  'shadow-[inset_3px_3px_0.5px_-3.5px_rgba(216,199,255,0.35),inset_-3px_-3px_0.5px_-3.5px_rgba(216,199,255,0.95),inset_1px_1px_1px_-0.5px_rgba(189,157,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(189,157,255,0.6),0_0_18px_rgba(124,58,237,0.35)]',
  'transition-shadow hover:shadow-[inset_3px_3px_0.5px_-3.5px_rgba(216,199,255,0.5),inset_-3px_-3px_0.5px_-3.5px_rgba(216,199,255,1),inset_1px_1px_1px_-0.5px_rgba(189,157,255,0.8),inset_-1px_-1px_1px_-0.5px_rgba(189,157,255,0.8),0_0_26px_rgba(124,58,237,0.5)]',
].join(' ')

/**
 * Texto da pílula em degradê vertical, mais apagado em cima.
 *
 * É o detalhe que faz o rótulo parecer iluminado por baixo junto com a borda.
 * Texto chapado dentro desta pílula lê como etiqueta colada.
 */
export const TEXTO_PILULA =
  'bg-gradient-to-b from-white/30 from-[8.85%] to-white bg-clip-text text-transparent'

/** Manchete de seção, com o degradê que a referência usa nos títulos. */
export const TITULO_SECAO = [
  'font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[40px]',
  'bg-gradient-to-b from-white from-[22.5%] to-white/70 bg-clip-text text-transparent',
].join(' ')

/**
 * Lavado radial de seção, sem aresta.
 *
 * O lavado é um radial largo (150% da caixa) e as seções têm largura máxima de
 * 1180px — então o degradê **era recortado** pela borda do container e deixava
 * duas arestas verticais e uma horizontal bem visíveis, um retângulo desenhado
 * no fundo. Trocar por um radial estreito o bastante para morrer dentro da
 * caixa apagaria o efeito, que depende de ser largo e quase imperceptível.
 *
 * A saída é pintar o lavado numa camada própria que transborda a caixa e
 * apagá-la nas bordas por máscara: `intersect` entre uma horizontal, que mata
 * as duas laterais, e uma vertical, que suaviza o encontro com a seção de
 * cima. O conteúdo não é mascarado junto porque a camada é irmã dele.
 */
export const WASH_SECAO = [
  // `isolate` + `before:-z-10`: pseudo-elemento posicionado pinta acima dos
  // filhos em fluxo, então sem isto o lavado cobriria o texto da seção. O
  // `isolate` prende o z negativo dentro da própria seção.
  'relative isolate',
  "before:pointer-events-none before:absolute before:-z-10 before:inset-y-0 before:-inset-x-[12%] before:content-['']",
  'before:bg-wash-secao',
  'before:[mask-image:linear-gradient(90deg,transparent_0%,#000_14%,#000_86%,transparent_100%),linear-gradient(180deg,transparent_0%,#000_9%)]',
  'before:[mask-composite:intersect]',
  'before:[-webkit-mask-composite:source-in]',
].join(' ')

/** Mesmo tratamento, na intensidade mais baixa. */
export const WASH_SECAO_SUAVE = WASH_SECAO.replace('before:bg-wash-secao', 'before:bg-wash-secao-suave')

/** Régua que some nas duas pontas, em vez de bater na borda da seção. */
export const HAIRLINE = 'h-px w-full bg-hairline-fade'
