import { useEffect, useRef } from 'react'

/**
 * Fundo animado da página pública: campo de estrelas em perspectiva.
 *
 * As estrelas vivem em três dimensões e são projetadas na tela — `x/z` e `y/z`
 * a partir de um ponto de fuga no centro. Conforme `z` diminui, cada estrela
 * acelera para fora, cresce e clareia. É o que faz o campo parecer que a página
 * avança por dentro dele, em vez de pontos deslizando sobre um plano.
 *
 * Canvas, e não centenas de elementos com `animation` no CSS: cada estrela
 * seria um nó com sua própria camada de composição, e o custo aparece em
 * máquina modesta — que é onde a apresentação vai rodar.
 *
 * Cuidados que a página precisa manter:
 *
 * - **`prefers-reduced-motion` desenha o campo parado.** Movimento contínuo no
 *   fundo é exatamente o que a preferência existe para desligar.
 * - **Pausa com a aba escondida.** `requestAnimationFrame` já é suspenso pelo
 *   navegador, mas o relógio não: sem isto, voltar para a aba faz o campo
 *   saltar o tempo inteiro que passou.
 * - **Fica atrás e não recebe evento.** `aria-hidden` e `pointer-events-none`:
 *   é atmosfera, não conteúdo, e não pode entrar na leitura de tela.
 * - **O paralaxe segue o ponteiro com atraso** e é proporcional à proximidade:
 *   estrela perto anda mais que estrela ao fundo. Aplicar a posição do mouse
 *   direto faria o campo saltar junto com o ponteiro, o que lê como falha.
 */
const DENSIDADE = 1 / 7000   // estrelas por pixel de viewport
const MAXIMO = 260           // teto para telas grandes

// Velocidade de aproximação, em unidades de profundidade por segundo. Baixa de
// propósito: o efeito de origem é uma dobra espacial, e numa landing de produto
// isso vira ruído. Aqui é uma respiração lenta — quem olha percebe o movimento,
// quem lê o texto não é atrapalhado.
const VELOCIDADE = 22

// Teto do rastro, em pixels.
const RASTRO_MAXIMO = 12

export default function FundoEstrelado() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let estrelas = []
    let largura = 0
    let altura = 0
    let centroX = 0
    let centroY = 0
    let profundidadeMaxima = 0
    // Distância focal. No componente de origem esta constante era `quantity / 2`
    // — o campo de visão mudava junto com a quantidade de estrelas, então
    // aumentar a densidade também deformava a perspectiva. Aqui ela é derivada
    // só da tela, que é a grandeza com que ela de fato tem relação.
    let foco = 0
    let quadro = null
    let anterior = 0
    // Alvo do paralaxe (para onde o ponteiro pede) e valor corrente (onde o
    // campo está de fato). A distância entre os dois é o que dá a inércia.
    let alvoX = 0
    let alvoY = 0
    let deslocX = 0
    let deslocY = 0

    const nascer = (estrela, profundidade) => {
      // Sorteia onde a estrela vai **aparecer na tela** e deriva `x` e `y` daí,
      // em vez de sortear `x` e `y` num intervalo fixo.
      //
      // A diferença não é cosmética: como a projeção divide por `z`, um
      // intervalo fixo faz a densidade vista cair conforme a estrela se
      // aproxima — boa parte do campo nasce fora de quadro e o que sobra na
      // tela é quase só o fundo distante, apagado. Amostrando na tela, a
      // densidade fica igual em qualquer profundidade.
      const escala = foco / profundidade
      estrela.x = (Math.random() * largura - centroX) / escala
      estrela.y = (Math.random() * altura - centroY) / escala
      estrela.z = profundidade
      estrela.telaX = null   // sem posição anterior: o primeiro quadro não risca
      estrela.telaY = null
      return estrela
    }

    const dimensionar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      largura = window.innerWidth
      altura = window.innerHeight
      canvas.width = Math.floor(largura * dpr)
      canvas.height = Math.floor(altura * dpr)
      canvas.style.width = `${largura}px`
      canvas.style.height = `${altura}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'

      centroX = largura / 2
      centroY = altura / 2
      profundidadeMaxima = (largura + altura) / 2
      foco = profundidadeMaxima / 2

      const quantas = Math.min(MAXIMO, Math.round(largura * altura * DENSIDADE))
      estrelas = Array.from({ length: quantas }, () =>
        // Profundidade inicial sorteada em toda a faixa: começar todas no fundo
        // faria a página abrir vazia e encher aos poucos.
        nascer({}, Math.random() * profundidadeMaxima)
      )
    }

    const desenhar = () => {
      ctx.clearRect(0, 0, largura, altura)

      for (const e of estrelas) {
        const proximidade = 1 - e.z / profundidadeMaxima     // 0 no fundo, 1 rente
        const escala = foco / e.z
        // O paralaxe entra na projeção, não na posição da estrela: somar ao
        // `x` e `y` deslocaria o campo de forma permanente a cada movimento do
        // ponteiro, e ele iria embora do enquadramento.
        const px = centroX + e.x * escala + deslocX * proximidade
        const py = centroY + e.y * escala + deslocY * proximidade

        const brilho = 0.22 + proximidade * 0.55
        const cor = `rgba(222, 229, 255, ${brilho.toFixed(3)})`

        // O rastro é a distância percorrida desde o quadro anterior. Perto do
        // centro ela é sub-pixel e a estrela lê como ponto; na borda, onde a
        // projeção acelera, vira risco. É o mesmo dado desenhando as duas
        // leituras, sem precisar decidir entre ponto e linha.
        if (e.telaX !== null) {
          const dx = px - e.telaX
          const dy = py - e.telaY
          const dist2 = dx * dx + dy * dy
          if (dist2 > 0.6) {
            // Rastro com teto. A projeção acelera com o inverso de `z`, então
            // uma estrela que chega perto e longe do eixo percorre centenas de
            // pixels num quadro só — e isso deixa de ler como estrela e passa a
            // ler como risco na tela. Acima do teto, desenha só o pedaço final
            // do percurso, que é o que o olho interpreta como velocidade.
            const dist = Math.sqrt(dist2)
            const fator = dist > RASTRO_MAXIMO ? RASTRO_MAXIMO / dist : 1
            ctx.strokeStyle = cor
            ctx.lineWidth = 0.4 + proximidade * 1.4
            ctx.beginPath()
            ctx.moveTo(px - dx * fator, py - dy * fator)
            ctx.lineTo(px, py)
            ctx.stroke()
            e.telaX = px
            e.telaY = py
            continue
          }
        }

        ctx.fillStyle = cor
        ctx.beginPath()
        ctx.arc(px, py, 0.35 + proximidade * 0.85, 0, Math.PI * 2)
        ctx.fill()
        e.telaX = px
        e.telaY = py
      }
    }

    const passo = (agora) => {
      const delta = Math.min((agora - anterior) / 1000, 0.05)
      anterior = agora

      // Margem curta: com uma tela inteira de folga a estrela seguia viva
      // muito além da borda, acelerando o tempo todo, e voltava a cruzar o
      // quadro como um risco.
      const margem = Math.max(largura, altura) * 0.15
      for (const e of estrelas) {
        e.z -= VELOCIDADE * delta

        // Renasce ao passar pela câmera. O limite não é zero: `x/z` explode
        // perto de zero e a estrela saltaria para o infinito no último quadro.
        if (e.z < 1) {
          nascer(e, profundidadeMaxima)
          continue
        }

        // Renasce também quando a projeção já saiu de quadro com folga. Sem
        // isto, boa parte do campo passa a vida fora da tela e a densidade que
        // se vê cai muito abaixo da que foi configurada.
        const escala = foco / e.z
        const px = centroX + e.x * escala
        const py = centroY + e.y * escala
        if (px < -margem || px > largura + margem || py < -margem || py > altura + margem) {
          nascer(e, profundidadeMaxima)
        }
      }

      // Interpolação: 6% da distância por quadro, o que dá ~0,4s para alcançar.
      deslocX += (alvoX - deslocX) * 0.06
      deslocY += (alvoY - deslocY) * 0.06
      desenhar()
      quadro = requestAnimationFrame(passo)
    }

    const parar = () => {
      if (quadro !== null) cancelAnimationFrame(quadro)
      quadro = null
    }
    const comecar = () => {
      if (quadro !== null || semMovimento) return
      anterior = performance.now()
      quadro = requestAnimationFrame(passo)
    }
    const aoTrocarVisibilidade = () => (document.hidden ? parar() : comecar())

    const aoMoverPonteiro = (e) => {
      // -1..1 a partir do centro da janela, vezes a amplitude máxima.
      alvoX = (e.clientX / window.innerWidth - 0.5) * -26
      alvoY = (e.clientY / window.innerHeight - 0.5) * -18
    }

    const aoRedimensionar = () => {
      dimensionar()
      desenhar()
    }

    dimensionar()
    desenhar()
    comecar()

    window.addEventListener('resize', aoRedimensionar)
    document.addEventListener('visibilitychange', aoTrocarVisibilidade)
    if (!semMovimento) window.addEventListener('pointermove', aoMoverPonteiro, { passive: true })
    return () => {
      parar()
      window.removeEventListener('resize', aoRedimensionar)
      document.removeEventListener('visibilitychange', aoTrocarVisibilidade)
      window.removeEventListener('pointermove', aoMoverPonteiro)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas ref={ref} className="absolute inset-0" />
      {/* Duas auras em deriva muito lenta. Elas dão profundidade ao campo e
          impedem que o fundo leia como um papel de parede estático. */}
      <div
        className="absolute left-[-10%] top-[-15%] h-[70vmax] w-[70vmax] animate-aura-lenta motion-reduce:animate-none rounded-full opacity-60 blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 62%)' }}
      />
      <div
        className="absolute right-[-15%] top-[25%] h-[55vmax] w-[55vmax] animate-aura-lenta-2 motion-reduce:animate-none rounded-full opacity-50 blur-[110px]"
        style={{ background: 'radial-gradient(circle, rgba(52,181,250,0.14) 0%, transparent 62%)' }}
      />
    </div>
  )
}
