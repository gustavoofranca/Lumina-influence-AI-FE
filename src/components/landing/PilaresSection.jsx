import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import icone1 from '../../assets/landing/pillar-1-icon.svg'
import icone2 from '../../assets/landing/pillar-2-icon.svg'
import icone3 from '../../assets/landing/pillar-3-icon.svg'
import roi from '../../assets/landing/roi-dashboard.png'

const ICONES = [icone1, icone2, icone3]

/** Medidor do pilar 2 — a nota que a análise de NLP devolve. */
function MedidorNlp({ t }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-landing-glass/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold leading-[15px] text-landing-violet">
          {t('landing.pilares.nlpLabel')}
        </span>
        <span className="text-[10px] font-semibold leading-[15px] text-landing-violet">
          {t('landing.pilares.nlpValue')}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-landing-card">
        <div className="h-full bg-landing-violet" style={{ width: '94%' }} />
      </div>
    </div>
  )
}

function Chips({ itens }) {
  return (
    <div className="flex flex-wrap gap-3">
      {itens.map((chip) => (
        <span
          key={chip}
          className="rounded bg-landing-card px-2 py-1 text-[10px] font-semibold leading-[15px] text-landing-blue"
        >
          {chip}
        </span>
      ))}
    </div>
  )
}

export default function PilaresSection() {
  const { t } = useTranslation()
  const items = t('landing.pilares.items', { returnObjects: true })
  const chips = t('landing.pilares.chips', { returnObjects: true })

  return (
    <section className="bg-landing-surface/30 py-24">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-8">
        <div data-reveal className="flex flex-col items-start gap-4 lg:flex-row lg:items-end">
          <div className="flex max-w-[576px] flex-col gap-4">
            <h2 className="font-display text-3xl font-extrabold leading-10 text-landing-text lg:text-4xl">
              {t('landing.pilares.title')}
            </h2>
            <p className="text-base leading-6 text-landing-muted">
              {t('landing.pilares.subtitle')}
            </p>
          </div>
          <div className="hidden flex-1 px-12 pb-4 lg:block">
            <div className="h-px w-full bg-landing-line/20" />
          </div>
        </div>

        <div className="grid items-stretch gap-8 lg:grid-cols-3">
          {items.map((item, i) => {
            const destaque = i === 1
            return (
              <div
                key={item.title}
                data-reveal
                style={{ '--delay': `${i * 150}ms` }}
                className={cn(
                  'flex flex-col gap-6 rounded-2xl p-8 backdrop-blur-md lg:min-h-[615px]',
                  'border border-landing-line/10',
                  destaque
                    ? cn(
                        'bg-landing-card lg:scale-105',
                        'shadow-[0_25px_50px_-12px_rgba(189,157,255,0.1)]'
                      )
                    : 'bg-landing-glass/40'
                )}
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-landing-elevated">
                  <img src={ICONES[i]} alt="" aria-hidden className={i === 0 ? 'size-[22px]' : 'size-[18px]'} />
                </span>

                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold leading-7 text-landing-text">{item.title}</h3>
                  <p className={cn(
                    'text-sm leading-[22.75px]',
                    destaque ? 'text-landing-text' : 'text-landing-muted'
                  )}>
                    {item.desc}
                  </p>
                </div>

                <div>
                  {i === 0 && <Chips itens={chips} />}
                  {i === 1 && <MedidorNlp t={t} />}
                  {i === 2 && (
                    <img
                      src={roi}
                      alt={t('landing.pilares.roiAlt')}
                      className="aspect-square w-full rounded-lg object-cover opacity-60"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
