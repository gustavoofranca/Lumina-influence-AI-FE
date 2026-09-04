import { useRef } from 'react'
import { GlassCard } from 'react-glass-ui'

import { cn } from '../../lib/cn.js'
import { useCartaoIluminado } from '../../hooks/useLuzDoPonteiro.js'

/**
 * Raio do cartão, em pixels.
 *
 * Um número só, e não uma classe do Tailwind de um lado e uma prop do outro. A
 * biblioteca recebe o raio como número e aplica em seis camadas próprias; o
 * invólucro externo precisa **do mesmo valor**, porque é nele que os chamadores
 * penduram sombra e borda. Dois lugares com o mesmo 16 escrito à mão é a
 * definição de valor que vai divergir.
 */
const RAIO = 16

/**
 * Cartão de vidro da landing — invólucro fino do `GlassCard` do `react-glass-ui`.
 *
 * A biblioteca monta o pipeline de filtros SVG (borrão, mapa de deslocamento,
 * aberração cromática, luz interna e externa). O que este arquivo faz é fixar
 * **as escolhas do projeto** num lugar só, para que os cinco cartões da página
 * não divirjam com o tempo — que é exatamente como eles divergiriam se cada
 * seção repetisse vinte props.
 *
 * ## Onde saímos da configuração de referência, e por quê
 *
 * - **`backgroundOpacity` não é 0.** Na referência o miolo é transparente, mas
 *   lá o cartão fica sobre foto. Aqui ele fica sobre um campo de estrelas
 *   animado, com texto corrido por cima: com miolo zerado, o contraste do corpo
 *   é o que paga. O valor abaixo foi escolhido medindo pixel, não no olho.
 * - **`chromaticAberration` fica em 0.** A franja colorida em texto pequeno lê
 *   como erro de renderização, não como vidro.
 * - **`flexibility` e `onHoverScale` ficam neutros.** Cartão de conteúdo não é
 *   alvo de clique; escalar no hover promete uma interação que não existe.
 *
 * ## Limite conhecido
 *
 * A própria biblioteca declara suporte melhor no Chrome, e a medição bate: o
 * deslocamento depende de filtro SVG dentro de `backdrop-filter`, que Firefox e
 * Safari não implementam. Lá sobra o borrão com a borda, que é um vidro fosco
 * apresentável — degrada, não quebra.
 *
 * E vale o número: neste fundo escuro a distorção altera menos de 1% dos pixels
 * do cartão, porque quase não há detalhe atrás para refratar. O que faz o vidro
 * ler aqui é a **borda acesa**, e é por isso que ela vem em branco a 40%.
 */
export default function CartaoDeVidro({
  as: Tag = 'div',
  className,
  interno,
  aura = false,
  moldura = true,
  borrao = 4,
  distorcao = 40,
  children,
  ...resto
}) {
  const involucro = useRef(null)
  useCartaoIluminado(involucro)

  // `GlassCard` sempre renderiza uma `div`. Quando o chamador pede outra tag —
  // `article` nos pilares —, ela envolve o cartão por fora: perder a semântica
  // para ganhar um efeito visual seria uma troca ruim, e invisível no build.
  const cartao = (
    <GlassCard
      blur={borrao}
      distortion={distorcao}
      flexibility={0}
      onHoverScale={1}
      chromaticAberration={0}
      borderRadius={RAIO}
      borderSize={moldura ? 1 : 0}
      borderColor="#ffffff"
      borderOpacity={moldura ? 0.4 : 0}
      backgroundColor="#0E0524"
      // Medido em pixel na página: com o corpo em `text-landing-muted` sobre o
      // campo de estrelas, esta tinta mantém o contraste acima de 8:1. Zerar
      // derruba para perto do mínimo assim que uma estrela passa atrás.
      backgroundOpacity={0.42}
      saturation={100}
      brightness={100}
      innerLightColor="#ffffff"
      innerLightBlur={10}
      innerLightSpread={1}
      // A aura violeta do cartão em destaque vira luz interna, que é onde a
      // biblioteca já tem o controle — em vez de um gradiente por cima.
      innerLightOpacity={aura ? 0.16 : 0}
      outerLightColor="#BD9DFF"
      outerLightBlur={10}
      outerLightSpread={1}
      outerLightOpacity={aura ? 0.14 : 0}
      // `flex-1` e não `h-full`: a altura do item de grade vem do esticamento e
      // não é declarada, então porcentagem não tem contra o que resolver — o
      // vidro encolhia até o conteúdo e sobrava uma área morta dentro do cartão.
      // Com o invólucro em `flex`, o filho cresce sem depender de porcentagem.
      // `!h-full !w-full` com `!important` de propósito: a biblioteca crava
      // `width: fit-content; height: fit-content` **inline** na raiz, e estilo
      // inline vence qualquer classe. Sem isto o vidro encolhe até o conteúdo
      // e sobra uma área morta dentro do cartão em grades de altura igual.
      className={cn('relative !h-full !w-full')}
      // O `interno` dos chamadores usa `!p-…`: a biblioteca crava
      // `padding: 10px` **inline** na camada de conteúdo, e sem o `!important`
      // o texto encosta na borda do cartão. Fica explícito no ponto de uso, e
      // não escondido aqui dentro, porque é uma exceção e exceção some.
      contentClassName={cn('flex h-full flex-col', interno)}
      {...resto}
    >
      {children}
    </GlassCard>
  )

  // Mesmo sem tag própria o cartão precisa de um invólucro flex, senão o
  // `flex-1` do vidro não tem contexto para crescer.
  //
  // O raio aqui não é enfeite, é correção de um defeito que se via na tela: os
  // chamadores penduram `shadow-glow-card` e a borda tracejada **neste**
  // elemento, e ele não tinha raio nenhum. Sombra e borda seguem a forma da
  // caixa, então o cartão era redondo e a decoração dele era quadrada.
  // Medido no cartão tracejado, na primeira linha dentro da caixa e fora do
  // arco: o tracejado passava reto pelo canto, a 106 de luminância sobre um
  // fundo de 15. Com o raio, a mesma linha lê 16 — o fundo — até o arco
  // começar. No cartão aceso, o filete de `inset 0 1px 0 0` atravessava o canto
  // a 45 e caiu para 26, que é só o halo difuso, como deve ser.
  return (
    <Tag
      ref={involucro}
      className={cn('relative flex h-full', className)}
      style={{ borderRadius: RAIO }}
    >
      {cartao}
      <BrilhoDoPonteiro />
    </Tag>
  )
}

/**
 * O que o cartão faz quando a luz do ponteiro passa perto dele.
 *
 * O grosso do efeito não está aqui: a luz vive numa camada atrás da página e
 * atravessa o `backdrop-filter` do cartão sozinha — ver `LuzDoPonteiro`. O que
 * falta é o que o vidro faz que o ar não faz, e são duas coisas.
 *
 * **O aro.** Vidro acende na aresta, onde a luz entra de raspão. O anel é o
 * gradiente recortado a 1px por duas máscaras que se excluem: uma cobre a caixa
 * de conteúdo, a outra a caixa inteira, e o que sobra é exatamente a moldura.
 * É o mesmo recurso do lavado das seções, pelo mesmo motivo — desenhar o
 * contorno sem precisar de um elemento opaco por baixo, que aqui mataria o
 * vidro.
 *
 * **O brilho de superfície.** Muito fraco de propósito: 6% de branco. Ele passa
 * por cima do texto, e o texto é o que a página tem para dizer. O que ele
 * precisa fazer é sugerir que a face do vidro reflete alguma coisa; qualquer
 * valor em que ele apareça sozinho já está atrapalhando a leitura.
 *
 * As duas usam `--luz-cx` / `--luz-cy`, que o laço escreve no invólucro. O
 * padrão é um ponto muito fora da caixa: antes do primeiro movimento do
 * ponteiro, e em quem não recebe a luz, o gradiente inteiro cai fora do cartão
 * e não há nada para pintar.
 */
function BrilhoDoPonteiro() {
  const centro = 'var(--luz-cx, -9999px) var(--luz-cy, -9999px)'

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 z-20">
      <span
        className="absolute inset-0"
        style={{
          borderRadius: RAIO,
          padding: 1,
          background: `radial-gradient(400px circle at ${centro}, rgba(226,214,255,0.9) 0%, rgba(178,150,255,0.35) 40%, rgba(167,139,250,0) 100%)`,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
        }}
      />
      <span
        className="absolute inset-0"
        style={{
          borderRadius: RAIO,
          background: `radial-gradient(150px circle at ${centro}, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)`,
        }}
      />
    </span>
  )
}
