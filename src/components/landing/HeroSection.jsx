import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import MalhaDeLuz from './MalhaDeLuz.jsx'
import FundoDeThreads from './FundoDeThreads.jsx'
import { PILULA, TEXTO_PILULA } from './estilos.js'
import BotaoBrilhante from './BotaoBrilhante.jsx'

/**
 * Herói centralizado, com o painel do produto largo embaixo do texto.
 *
 * O painel é a tese do produto e não uma captura: as colunas medidas preenchem,
 * a não medida fica em contorno e diz por quê. É a ADR-003 — ausência nunca
 * vira zero — como primeira coisa que a pessoa vê.
 *
 * Cor cheia é privilégio do dado medido. O `unmeasured` dá 3,35:1 sobre a base
 * e por isso vive só no traço; o rótulo textual usa `muted`, que dá 8,5:1.
 */
function Metrica({ rotulo, valor, proporcao, animar }) {
  return (
    <div className="flex flex-col gap-3 px-6 py-5">
      <span className="text-sm text-landing-muted">{rotulo}</span>
      <span className="font-display text-3xl font-semibold tabular-nums text-landing-text">
        {valor}
      </span>
      <div className="h-px bg-landing-line/25">
        <div
          className="h-px bg-landing-measured transition-[width] duration-[1400ms] ease-out motion-reduce:transition-none"
          style={{ width: animar ? `${proporcao}%` : '0%' }}
        />
      </div>
    </div>
  )
}

function MetricaAusente({ rotulo, motivo }) {
  return (
    <div className="flex flex-col gap-3 px-6 py-5">
      <span className="text-sm text-landing-muted">{rotulo}</span>
      {/* Decorativo: quem usa leitor de tela recebe o motivo, que é o conteúdo. */}
      <span
        aria-hidden
        className="block h-9 w-24 rounded-[3px] border border-dashed border-landing-unmeasured"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(90,100,128,0.3) 0 1px, transparent 1px 8px)',
        }}
      />
      <p className="text-xs leading-relaxed text-landing-muted">{motivo}</p>
    </div>
  )
}

function PainelAuditoria({ t }) {
  const [animar, setAnimar] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimar(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const p = t('landing.hero.painel', { returnObjects: true })

  return (
    <figure className="m-0">
      {/* Moldura de 1px em gradiente: o pai carrega o degradê, o filho recuado
          1px carrega o fundo. `border-image` não convive com `border-radius`. */}
      <div className="rounded-2xl bg-moldura-cartao p-px shadow-glow-card-forte">
      <div className="overflow-hidden rounded-[15px] bg-landing-surface/90 backdrop-blur-xl">
        <figcaption className="flex flex-wrap items-baseline justify-between gap-3 border-b border-landing-line/25 px-6 py-4">
          <span className="font-display text-base font-semibold text-landing-text">
            {p.titulo}
          </span>
          <span className="text-xs text-landing-muted">{p.periodo}</span>
        </figcaption>

        <div className="grid divide-landing-line/20 sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
          <Metrica rotulo={p.engajamento} valor="4,8%" proporcao={62} animar={animar} />
          <Metrica rotulo={p.sentimento} valor="72" proporcao={72} animar={animar} />
          <Metrica rotulo={p.bots} valor="12%" proporcao={12} animar={animar} />
          <MetricaAusente rotulo={p.organico} motivo={p.organicoMotivo} />
        </div>
      </div>
      </div>

      <figcaption className="mt-4 text-center text-sm leading-relaxed text-landing-muted">
        {p.legenda}
      </figcaption>
    </figure>
  )
}

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pt-36">
      {/* Os fios entram abaixo da malha e acima do campo de estrelas, que é
          `fixed` na camada 0 da página. */}
      <FundoDeThreads />
      {/* Arte do topo: o mesmo leque da faixa, girado meia volta para abrir
          para baixo a partir de um ponto acima da dobra. No arquivo de
          referência isto é um PNG pintado; aqui é gerado, para acompanhar os
          tokens de cor em vez de envelhecer como binário. */}
      <MalhaDeLuz className="inset-x-[-10%] top-[-220px] h-[560px] rotate-180 opacity-[0.55]" />

      <div className="relative mx-auto flex w-full max-w-[1180px] flex-col items-center px-6 sm:px-8">
        <span
          className={cn(PILULA, TEXTO_PILULA, 'px-4 py-1.5 text-sm font-medium')}
        >
          {t('landing.hero.badge')}
        </span>

        <h1
          className={cn(
            'mt-7 max-w-[16ch] text-center font-display font-semibold',
            'bg-gradient-to-b from-white from-[22.5%] to-white/70 bg-clip-text text-transparent',
            'text-[42px] leading-[1.03] tracking-[-0.035em]',
            'sm:text-[62px] lg:text-[76px]'
          )}
        >
          {t('landing.hero.h1')}
        </h1>

        <p className="mt-6 max-w-[62ch] text-center text-lg leading-relaxed text-landing-muted">
          {t('landing.hero.subtitle')}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <BotaoBrilhante
            as={Link}
            to="/cadastro"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-measured"
          >
            {t('landing.hero.ctaPrimary')}
          </BotaoBrilhante>
          <a
            href="#features"
            className={cn(PILULA, TEXTO_PILULA, 'px-7 py-3 font-display text-base font-semibold')}
          >
            {t('landing.hero.ctaSecondary')}
          </a>
        </div>

        {/* A malha é irmã do painel e ancorada no topo dele: `bottom-full`
            põe a origem exatamente na borda de cima do cartão, e o desenho
            transborda a largura do container para os raios não terminarem
            visivelmente na margem. */}
        <div className="relative mt-24 w-full">
          {/* As barras verticais saíram: os fios do fundo já dão o movimento, e
              as duas leituras juntas embolavam. Fica a floração rente à borda
              de cima do painel, que é o que faz a luz parecer escapar de trás
              dele. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-[18%] bottom-full h-[220px] translate-y-[90px]"
            style={{
              background:
                'radial-gradient(ellipse at 50% 100%, rgba(167,139,250,0.42) 0%, rgba(124,58,237,0.16) 38%, rgba(124,58,237,0) 70%)',
            }}
          />
          <PainelAuditoria t={t} />
        </div>
      </div>
    </section>
  )
}
