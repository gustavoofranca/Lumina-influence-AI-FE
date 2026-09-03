import { useEffect, useRef } from 'react'

/**
 * Fundo animado da página pública: campo de pontos em deriva lenta.
 *
 * Canvas, e não centenas de elementos com `animation` no CSS: cada estrela
 * seria um nó com sua própria camada de composição, e o custo aparece em
 * máquina modesta — que é onde a apresentação vai rodar.
 *
 * Três cuidados que a página precisa manter:
 *
 * - **`prefers-reduced-motion` desenha o campo parado.** Movimento contínuo no
 *   fundo é exatamente o que a preferência existe para desligar.
 * - **Pausa com a aba escondida.** `requestAnimationFrame` já é suspenso pelo
 *   navegador, mas o relógio não: sem isto, voltar para a aba faz o campo
 *   saltar o tempo inteiro que passou.
 * - **Fica atrás e não recebe evento.** `aria-hidden` e `pointer-events-none`:
 *   é atmosfera, não conteúdo, e não pode entrar na leitura de tela.
 * - **O paralaxe segue o ponteiro com atraso.** O deslocamento é proporcional à
 *   profundidade — estrela grande e próxima anda mais que estrela distante —, e
 *   persegue o alvo por interpolação a cada quadro. Aplicar a posição do mouse
 *   direto faria o campo saltar junto com o ponteiro, o que lê como falha.
 */
const DENSIDADE = 1 / 9000   // estrelas por pixel de viewport
const MAXIMO = 220           // teto para telas grandes

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
    let quadro = null
    let anterior = 0
    // Alvo do paralaxe (para onde o ponteiro pede) e valor corrente (onde o
    // campo está de fato). A distância entre os dois é o que dá a inércia.
    let alvoX = 0
    let alvoY = 0
    let deslocX = 0
    let deslocY = 0

    const dimensionar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      largura = window.innerWidth
      altura = window.innerHeight
      canvas.width = Math.floor(largura * dpr)
      canvas.height = Math.floor(altura * dpr)
      canvas.style.width = `${largura}px`
      canvas.style.height = `${altura}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const quantas = Math.min(MAXIMO, Math.round(largura * altura * DENSIDADE))
      estrelas = Array.from({ length: quantas }, () => {
        // A profundidade governa tamanho, brilho e velocidade juntos — é o que
        // dá paralaxe sem precisar de camadas separadas.
        const profundidade = Math.random()
        return {
          x: Math.random() * largura,
          y: Math.random() * altura,
          raio: 0.4 + profundidade * 1.1,
          base: 0.18 + profundidade * 0.5,
          velocidade: (0.004 + profundidade * 0.018) * 60,
          profundidade,
          fase: Math.random() * Math.PI * 2,
          cintila: 0.5 + Math.random() * 1.2,
        }
      })
    }

    const desenhar = (t) => {
      ctx.clearRect(0, 0, largura, altura)
      for (const e of estrelas) {
        const brilho = semMovimento
          ? e.base
          : e.base * (0.72 + 0.28 * Math.sin(t * 0.0012 * e.cintila + e.fase))
        ctx.beginPath()
        // 26px de amplitude na estrela mais próxima; a mais distante quase não
        // sai do lugar, que é o que produz a sensação de profundidade.
        const px = e.x + deslocX * (0.25 + e.profundidade * 0.75)
        const py = e.y + deslocY * (0.25 + e.profundidade * 0.75)
        ctx.arc(px, py, e.raio, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(222, 229, 255, ${brilho.toFixed(3)})`
        ctx.fill()
      }
    }

    const passo = (agora) => {
      const delta = Math.min((agora - anterior) / 1000, 0.05)
      anterior = agora
      for (const e of estrelas) {
        // Deriva diagonal lenta: sobe e vai para a direita, reentrando pela
        // borda oposta. Movimento em um eixo só lê como rolagem da página.
        e.y -= e.velocidade * delta
        e.x += e.velocidade * delta * 0.35
        if (e.y < -2) { e.y = altura + 2; e.x = Math.random() * largura }
        if (e.x > largura + 2) e.x = -2
      }
      // Interpolação: 6% da distância por quadro, o que dá ~0,4s para alcançar.
      deslocX += (alvoX - deslocX) * 0.06
      deslocY += (alvoY - deslocY) * 0.06
      desenhar(agora)
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

    dimensionar()
    desenhar(0)
    comecar()

    window.addEventListener('resize', dimensionar)
    document.addEventListener('visibilitychange', aoTrocarVisibilidade)
    if (!semMovimento) window.addEventListener('pointermove', aoMoverPonteiro, { passive: true })
    return () => {
      parar()
      window.removeEventListener('resize', dimensionar)
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
