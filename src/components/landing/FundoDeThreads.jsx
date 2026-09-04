import { useEffect, useState } from 'react'

import { cn } from '../../lib/cn.js'
import WebThreads from './WebThreads.jsx'

/**
 * Invólucro do `WebThreads` — o componente de terceiro fica intocado para que
 * atualizar o upstream continue sendo trocar um arquivo.
 *
 * Três proteções que o pacote não traz e que o produto precisa:
 *
 * 1. **`prefers-reduced-motion` não monta nada.** Não basta baixar a
 *    velocidade: quem pede menos movimento não deve receber uma animação
 *    contínua de fundo, e assim ainda economiza a GPU dessa pessoa.
 * 2. **WebGL 2 é verificado antes de montar.** Placa antiga, driver na lista
 *    de bloqueio do navegador ou contexto esgotado fazem o `ogl` falhar na
 *    criação do renderer. Sem esta checagem, a landing quebraria inteira em vez
 *    de aparecer sem o fundo — e é a primeira tela da apresentação.
 * 3. **A checagem roda em efeito, não na renderização.** Tocar em `document`
 *    durante o render quebraria qualquer renderização no servidor e deixaria a
 *    primeira pintura inconsistente com a segunda.
 *
 * As cores são as da marca: o padrão do pacote traz um rosa (`#FF9FFC`) que não
 * existe na paleta da Lumina.
 *
 * **Intensidade e máscara não são preferência estética.** Na configuração
 * sugerida os fios cruzam a manchete e o subtítulo e derrubam a legibilidade —
 * e a varredura de contraste não pega isso, porque ela lê a cor computada dos
 * elementos e não o que um canvas desenha atrás deles. Daí o brilho reduzido e
 * a máscara radial que abre um respiro no miolo, onde o texto vive.
 */
export default function FundoDeThreads({ className }) {
  const [podeRenderizar, setPodeRenderizar] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    try {
      const teste = document.createElement('canvas')
      if (teste.getContext('webgl2')) setPodeRenderizar(true)
    } catch {
      // Navegador sem WebGL: a página segue com o campo de estrelas.
    }
  }, [])

  if (!podeRenderizar) return null

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{
        // Duas máscaras cruzadas, e o cruzamento é o ponto: `intersect` só deixa
        // pintar onde as duas são opacas.
        //
        // A radial abre um vazio no miolo — é onde a manchete vive. A linear
        // apaga a faixa de cima: a barra tem 80px e os fios mais íngremes
        // cruzavam justo ali, e um fio quase reto colado na navbar lê como
        // linha vertical de grade, não como fundo. O apagamento vai até 430px
        // porque os fios dos cantos são os mais retos de todos, e a 340px
        // ainda restava traço visível nas duas pontas.
        maskImage: [
          'radial-gradient(58% 46% at 50% 42%, transparent 0%, rgba(0,0,0,0.45) 55%, #000 100%)',
          'linear-gradient(180deg, transparent 0px, transparent 210px, #000 430px)',
        ].join(', '),
        maskComposite: 'intersect',
        WebkitMaskImage: [
          'radial-gradient(58% 46% at 50% 42%, transparent 0%, rgba(0,0,0,0.45) 55%, #000 100%)',
          'linear-gradient(180deg, transparent 0px, transparent 210px, #000 430px)',
        ].join(', '),
        WebkitMaskComposite: 'source-in',
      }}
    >
      <WebThreads
        color1="#7C3AED"
        color2="#34B5FA"
        color3="#FFFFFF"
        backgroundColor="#08021A"
        speed={0.2}
        threadCount={6}
        frequency={5.0}
        spread={0.18}
        taper={1.0}
        position={0.5}
        fanMode="center"
        glow={0.015}
        falloff={0.6}
        thickness={1.1}
        brightness={0.32}
        opacity={0.5}
        mirror
        shimmer={false}
        grain
        grainIntensity={0.05}
        mouseInteraction
        mouseStrength={0.3}
      />
    </div>
  )
}
