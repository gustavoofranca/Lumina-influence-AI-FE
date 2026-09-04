import { useEffect } from 'react'

/**
 * Luz que segue o ponteiro na página pública.
 *
 * Um laço só, compartilhado. A tentação aqui é cada componente registrar o seu
 * `mousemove` e escrever estilo na hora — é o que faz a referência que serviu de
 * ponto de partida. O problema é que cada evento vira uma leitura de geometria
 * (`getBoundingClientRect`) seguida de uma escrita de estilo, no mesmo tique:
 * o navegador é obrigado a recalcular o layout no meio do tratamento do evento,
 * e o ponteiro dispara dezenas de eventos por segundo. Aqui o evento só anota
 * onde o ponteiro está; **todas** as leituras acontecem juntas no quadro
 * seguinte, e só então vêm as escritas.
 *
 * O que o laço publica:
 *
 * - `--luz-x` / `--luz-y` na raiz — posição suavizada, em pixels de janela.
 * - `--luz-forca` na raiz — 0 a 1, sobe quando o ponteiro entra na página e
 *   desce quando ele sai. É o que evita a luz aparecer e sumir de estalo.
 * - `--luz-cx` / `--luz-cy` em cada cartão registrado — a mesma posição, mas
 *   relativa ao cartão, que é o que um gradiente dentro dele consegue usar.
 *
 * Por que em variável de CSS e não em estado do React: mudar estado a cada
 * quadro re-renderiza a árvore inteira sessenta vezes por segundo para pintar
 * um degradê. A variável muda o valor sem passar pelo React.
 *
 * ## Quando a luz não existe
 *
 * - **`prefers-reduced-motion`.** Uma luz que persegue o ponteiro é movimento
 *   contínuo disparado por quem só queria mover o mouse. É o caso exato da
 *   preferência.
 * - **Ponteiro grosso.** Em toque não há cursor pairando: a luz ficaria presa
 *   onde o dedo tocou por último, o que lê como sujeira na tela.
 *
 * Nos dois casos nada é registrado e nenhum laço começa — não é um laço que
 * roda escondido, é código que não roda.
 */

// Fração da distância que a luz percorre por quadro. Mais alto persegue o
// ponteiro de perto e denuncia a taxa de quadros; mais baixo vira arrasto.
//
// A 0,16 a luz chegava a metade do caminho em quatro quadros — parecia presa
// por um elástico. A 0,55 ela cobre metade da distância a cada quadro e some
// com o erro em pouco mais de um: na prática ela anda junto com o ponteiro.
// Zerar a suavização seria pior, não melhor — sem ela a luz salta de posição
// a cada evento e o tremor da mão vira tremor na tela.
const SUAVIZACAO = 0.55

// A força sobe e desce mais devagar que a posição: entrar e sair da janela é
// uma transição de atmosfera, não um movimento.
const SUAVIZACAO_DA_FORCA = 0.07

// Além deste raio o cartão não recebe luz nenhuma, e o laço para de escrever
// nele. Sem isto, doze cartões repintam o próprio degradê a cada quadro para
// mostrar exatamente nada.
const ALCANCE = 330

// Valor que tira a luz de um cartão: um centro tão longe que o degradê inteiro
// cai fora dele.
const LONGE = -9999

const cartoes = new Map()

let alvoX = 0
let alvoY = 0
let x = 0
let y = 0
let alvoForca = 0
let forca = 0

let iniciado = false
let rodando = false
let quadro = 0
let medidasVelhas = true

function medir() {
  for (const registro of cartoes.values()) {
    registro.caixa = registro.el.getBoundingClientRect()
  }
}

function escrever() {
  const raiz = document.documentElement
  raiz.style.setProperty('--luz-x', `${x.toFixed(1)}px`)
  raiz.style.setProperty('--luz-y', `${y.toFixed(1)}px`)
  raiz.style.setProperty('--luz-forca', forca.toFixed(3))

  for (const registro of cartoes.values()) {
    const { el, caixa } = registro
    if (!caixa) continue

    // Distância do ponteiro até a borda do cartão, e não até o centro: cartão
    // largo tem o centro longe da beirada, e ele apagaria com o ponteiro ainda
    // rente a ele.
    const dx = Math.max(caixa.left - x, 0, x - caixa.right)
    const dy = Math.max(caixa.top - y, 0, y - caixa.bottom)
    const perto = dx * dx + dy * dy < ALCANCE * ALCANCE

    if (!perto) {
      // Escreve uma vez só ao sair do alcance. `apagado` é o que impede este
      // ramo de virar uma escrita por quadro em todo cartão fora de alcance.
      if (!registro.apagado) {
        el.style.setProperty('--luz-cx', `${LONGE}px`)
        el.style.setProperty('--luz-cy', `${LONGE}px`)
        registro.apagado = true
      }
      continue
    }

    registro.apagado = false
    el.style.setProperty('--luz-cx', `${(x - caixa.left).toFixed(1)}px`)
    el.style.setProperty('--luz-cy', `${(y - caixa.top).toFixed(1)}px`)
  }
}

function passo() {
  x += (alvoX - x) * SUAVIZACAO
  y += (alvoY - y) * SUAVIZACAO
  forca += (alvoForca - forca) * SUAVIZACAO_DA_FORCA

  // Todas as leituras de geometria antes de qualquer escrita. Intercalar as
  // duas coisas é o que força o navegador a recalcular o layout no meio do
  // quadro, uma vez por cartão.
  if (medidasVelhas) {
    medir()
    medidasVelhas = false
  }
  escrever()

  // Meio pixel é menos que a menor diferença que a tela consegue mostrar, e a
  // força já está estável muito antes disso. Parar o laço aqui é o que faz a
  // página não gastar quadro nenhum com o ponteiro parado.
  const assentou =
    Math.abs(alvoX - x) < 0.5 &&
    Math.abs(alvoY - y) < 0.5 &&
    Math.abs(alvoForca - forca) < 0.005

  if (assentou) {
    x = alvoX
    y = alvoY
    forca = alvoForca
    escrever()
    rodando = false
    return
  }

  quadro = requestAnimationFrame(passo)
}

function acordar() {
  if (rodando) return
  rodando = true
  quadro = requestAnimationFrame(passo)
}

function aoMover(evento) {
  // `pointermove` de um toque chega aqui num aparelho híbrido, que tem ponteiro
  // fino disponível mas está sendo usado com o dedo.
  if (evento.pointerType === 'touch') return
  alvoX = evento.clientX
  alvoY = evento.clientY
  alvoForca = 1
  acordar()
}

function aoSair(evento) {
  // `relatedTarget` nulo é o ponteiro deixando a janela de verdade; com valor,
  // ele só passou para outro elemento dentro da página.
  if (evento.relatedTarget) return
  alvoForca = 0
  acordar()
}

function aoRolarOuRedimensionar() {
  if (cartoes.size === 0) return
  medidasVelhas = true
  acordar()
}

function ligar() {
  if (iniciado) return
  iniciado = true
  window.addEventListener('pointermove', aoMover, { passive: true })
  document.addEventListener('pointerout', aoSair, { passive: true })
  window.addEventListener('scroll', aoRolarOuRedimensionar, { passive: true })
  window.addEventListener('resize', aoRolarOuRedimensionar, { passive: true })
}

function desligar() {
  if (!iniciado) return
  iniciado = false
  window.removeEventListener('pointermove', aoMover)
  document.removeEventListener('pointerout', aoSair)
  window.removeEventListener('scroll', aoRolarOuRedimensionar)
  window.removeEventListener('resize', aoRolarOuRedimensionar)
  cancelAnimationFrame(quadro)
  rodando = false
  document.documentElement.style.removeProperty('--luz-x')
  document.documentElement.style.removeProperty('--luz-y')
  document.documentElement.style.removeProperty('--luz-forca')
}

/** `true` quando o aparelho e a preferência de quem está lendo permitem a luz. */
export function luzPermitida() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return (
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Liga o laço na página. Chamar uma vez, na página que tem a luz.
 */
export function useLuzDoPonteiro() {
  useEffect(() => {
    if (!luzPermitida()) return undefined
    ligar()
    return desligar
  }, [])
}

/**
 * Registra um elemento para receber `--luz-cx` / `--luz-cy`.
 *
 * @param {import('react').RefObject<HTMLElement>} ref elemento que recebe as variáveis
 */
export function useCartaoIluminado(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el || !luzPermitida()) return undefined

    cartoes.set(el, { el, caixa: null, apagado: false })
    medidasVelhas = true
    acordar()

    return () => {
      cartoes.delete(el)
    }
  }, [ref])
}
