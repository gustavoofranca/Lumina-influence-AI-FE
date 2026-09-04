import { useEffect } from 'react'

/**
 * Rolagem suave da página pública, via Lenis.
 *
 * O ganho não é estético: a rolagem nativa entrega deltas irregulares, que
 * variam com o dispositivo (roda de mouse, trackpad, toque). Qualquer animação
 * amarrada à posição de rolagem herda essa irregularidade e treme. O Lenis
 * interpola a posição num relógio próprio, e as seções que reagem ao scroll
 * passam a acompanhar um valor contínuo.
 *
 * **Só na landing.** Dentro do produto a rolagem é ferramenta: quem lê uma
 * tabela de 200 criadores quer que a página pare onde ela soltou. Sequestrar
 * isso atrapalha o trabalho.
 *
 * `prefers-reduced-motion` **não monta o Lenis**. Rolagem sequestrada é dos
 * piores problemas de acessibilidade que existem: para sensibilidade
 * vestibular, a inércia é justamente o que provoca o mal-estar. Não basta
 * reduzir a duração — a página tem de rolar do jeito que o sistema operacional
 * manda.
 */
export function useRolagemSuave() {
  useEffect(() => {
    const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (preferencia.matches) return

    let lenis
    let quadro
    let cancelado = false

    // Carregamento tardio: a rolagem suave é enfeite e não pode entrar no
    // caminho crítico da primeira pintura.
    import('lenis').then(({ default: Lenis }) => {
      if (cancelado) return
      lenis = new Lenis({
        // Âncoras do menu passam a ser interpoladas pelo Lenis. Sem isto,
        // clicar em "Planos" salta seco no meio de uma rolagem suave.
        anchors: true,
        duration: 1.1,
      })
      const passo = (t) => {
        lenis.raf(t)
        quadro = requestAnimationFrame(passo)
      }
      quadro = requestAnimationFrame(passo)
    })

    return () => {
      cancelado = true
      if (quadro) cancelAnimationFrame(quadro)
      lenis?.destroy()
    }
  }, [])
}
