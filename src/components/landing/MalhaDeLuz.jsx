import { useMemo } from 'react'

import { cn } from '../../lib/cn.js'

/**
 * Malha de luz em perspectiva atrás do herói.
 *
 * A geometria é polar, não cartesiana: raios que partem de um ponto de fuga
 * logo acima do painel, cruzados por arcos concêntricos em torno do mesmo
 * ponto. É o cruzamento dos dois que lê como um plano dobrado em perspectiva —
 * linhas verticais paralelas, que era o que estava aqui antes, leem como
 * grade de fundo e não como profundidade.
 *
 * Escolhas que sustentam o efeito:
 *
 * - **Os raios somem antes de chegar ao topo.** O gradiente vai de opaco na
 *   origem a transparente na ponta, e é isso que faz a luz parecer emitida do
 *   ponto em vez de desenhada sobre o fundo.
 * - **Os arcos são elipses achatadas.** Círculo perfeito lê como alvo; a
 *   elipse mais larga que alta é o que dá o horizonte.
 * - **Cada raio pulsa no seu tempo.** Fases irregulares evitam a respiração
 *   sincronizada, que denuncia a animação.
 *
 * `viewBox` fixo com `slice`: o desenho é recortado nas bordas em telas
 * estreitas em vez de distorcer os ângulos, que é o que `none` faria.
 */
const LARGURA = 1440
const ALTURA = 620
const ORIGEM_X = LARGURA / 2
// A origem fica na borda inferior do próprio desenho, e o componente é
// ancorado logo acima do painel. Assim a luz nasce na borda de cima do cartão
// e acompanha a altura real dele, em vez de depender de um Y fixo que
// desalinha assim que o texto do herói muda de tamanho.
const ORIGEM_Y = ALTURA
const RAIOS = 30
const ABERTURA = 88         // graus para cada lado da vertical
const COMPRIMENTO = 1150

export default function MalhaDeLuz({ className }) {
  const { raios, arcos } = useMemo(() => {
    const raios = Array.from({ length: RAIOS }, (_, i) => {
      const t = RAIOS === 1 ? 0.5 : i / (RAIOS - 1)
      const grau = -ABERTURA + t * (ABERTURA * 2)
      const rad = (grau * Math.PI) / 180
      return {
        x2: ORIGEM_X + Math.sin(rad) * COMPRIMENTO,
        // O eixo Y do SVG cresce para baixo: subtrair sobe.
        y2: ORIGEM_Y - Math.cos(rad) * COMPRIMENTO * 0.62,
        atraso: `${(i * 0.37) % 5.5}s`,
        duracao: `${6 + ((i * 1.7) % 5)}s`,
      }
    })
    const arcos = [190, 360, 560, 790].map((rx, i) => ({
      rx,
      ry: rx * 0.42,
      atraso: `${i * 1.3}s`,
    }))
    return { raios, arcos }
  }, [])

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="raio" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#D8C7FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#BD9DFF" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="foco">
            <stop offset="0%" stopColor="#EDE4FF" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#8B5CF6" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g>
          {arcos.map(({ rx, ry, atraso }) => (
            <ellipse
              key={rx}
              cx={ORIGEM_X}
              cy={ORIGEM_Y}
              rx={rx}
              ry={ry}
              fill="none"
              stroke="#BD9DFF"
              strokeOpacity="0.16"
              strokeWidth="1"
              className="animate-malha-respira motion-reduce:animate-none"
              style={{ animationDelay: atraso }}
            />
          ))}

          {raios.map(({ x2, y2, atraso, duracao }) => (
            <line
              key={`${x2}-${y2}`}
              x1={ORIGEM_X}
              y1={ORIGEM_Y}
              x2={x2}
              y2={y2}
              stroke="url(#raio)"
              strokeWidth="1"
              className="animate-malha-pulsa motion-reduce:animate-none"
              style={{ animationDelay: atraso, animationDuration: duracao }}
            />
          ))}
        </g>

        {/* O foco fica por cima dos raios: é a fonte, e cobrir a convergência
            esconde o ponto exato onde todas as linhas se encontram, que sem
            isso lê como erro de desenho. */}
        <ellipse cx={ORIGEM_X} cy={ORIGEM_Y} rx="620" ry="190" fill="url(#foco)" />
        <ellipse cx={ORIGEM_X} cy={ORIGEM_Y} rx="330" ry="46" fill="url(#foco)" opacity="0.9" />
      </svg>
    </div>
  )
}
