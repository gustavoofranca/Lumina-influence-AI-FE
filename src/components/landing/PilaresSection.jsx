import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import CartaoDeVidro from './CartaoDeVidro.jsx'
import { TITULO_SECAO } from './estilos.js'

/**
 * As três decisões de engenharia, cada uma com o limite que ela tem.
 *
 * Sem marcadores numerados: três decisões não são uma sequência, e numerar o
 * que não tem ordem é decoração fingindo ser informação.
 *
 * A seção antes se chamava "Arquitetura Neural em 3 Pilares" e falava em
 * "tecnologia proprietária" — é uma chamada ao Gemini do Google. O medidor
 * exibia "94% Genuíno" com a barra fixa em 94%, um número que ninguém mediu.
 */
function ExemploDeSaida({ t }) {
  // 12% é o valor do exemplo, e a barra segue o valor em vez de contradizê-lo.
  const percentual = 12
  return (
    <div className="mt-6 flex flex-col gap-2.5 rounded-md border border-landing-line/25 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs text-landing-muted">{t('landing.pilares.nlpLabel')}</span>
        <span className="font-display text-sm font-semibold tabular-nums text-landing-text">
          {t('landing.pilares.nlpValue')}
        </span>
      </div>
      <div className="h-px bg-landing-line/30">
        <div className="h-px bg-landing-measured" style={{ width: `${percentual}%` }} />
      </div>
    </div>
  )
}

function Chips({ itens }) {
  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {itens.map((chip) => (
        <li
          key={chip}
          className="rounded border border-landing-line/30 px-2.5 py-1 text-xs text-landing-muted"
        >
          {chip}
        </li>
      ))}
    </ul>
  )
}

export default function PilaresSection() {
  const { t } = useTranslation()
  const items = t('landing.pilares.items', { returnObjects: true })
  const chips = t('landing.pilares.chips', { returnObjects: true })

  return (
    <section className={cn(
      // Seção de largura cheia: o lavado é recortado pela janela, não por uma
      // caixa mais estreita, então aqui ele não deixa aresta.
      'relative bg-wash-secao py-24',
      "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-hairline-fade before:content-['']",
      "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-hairline-fade after:content-['']"
    )}>
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-14 px-6 sm:px-8">
        <div className="flex max-w-[46ch] flex-col gap-4">
          <h2 className={TITULO_SECAO}>
            {t('landing.pilares.title')}
          </h2>
          <p className="text-lg leading-relaxed text-landing-muted">
            {t('landing.pilares.subtitle')}
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {items.map((item, i) => (
            <CartaoDeVidro
              as="article"
              key={item.title}
              className="shadow-glow-card"
              interno="!p-6 sm:!p-7"
            >
              <h3 className="font-display text-lg font-semibold text-landing-text">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed text-landing-muted">
                {item.desc}
              </p>
              {i === 0 && <Chips itens={chips} />}
              {i === 1 && <ExemploDeSaida t={t} />}
            </CartaoDeVidro>
          ))}
        </div>
      </div>
    </section>
  )
}
