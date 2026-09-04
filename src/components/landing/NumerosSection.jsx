import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import { PILULA, TEXTO_PILULA, TITULO_SECAO } from './estilos.js'

/**
 * Os números que sustentam a página.
 *
 * Cada um é verificável no repositório, e é por isso que eles estão aqui: a
 * landing inteira fala em procedência, e uma seção de números inventados seria
 * a contradição mais barata possível. Se algum destes deixar de ser verdade, o
 * lugar de corrigir é aqui e no `docs/` ao mesmo tempo — texto publicado que
 * descreve comportamento é código sem teste.
 *
 * Sem cartão: são quatro dados curtos e o vidro não acrescenta nada. As réguas
 * verticais entre eles já dão a separação, e somem no celular, onde a grade
 * vira duas colunas e uma borda vertical passaria pelo meio do nada.
 */
export default function NumerosSection() {
  const { t } = useTranslation()
  const itens = t('landing.numeros.itens', { returnObjects: true })

  return (
    <section className="relative mx-auto w-full max-w-[1180px] px-6 py-24 sm:px-8">
      <div className="flex max-w-[46ch] flex-col gap-4">
        <span className={cn(PILULA, TEXTO_PILULA, 'w-fit px-3.5 py-1 text-sm font-medium')}>
          {t('landing.numeros.selo')}
        </span>
        <h2 className={TITULO_SECAO}>{t('landing.numeros.title')}</h2>
      </div>

      <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4 lg:gap-x-4">
        {itens.map((item, i) => (
          <div
            key={item.rotulo}
            className={cn(
              'flex flex-col gap-1.5 lg:px-6',
              i > 0 && 'lg:border-l lg:border-landing-line/25'
            )}
          >
            <dd className="font-display text-[44px] font-semibold leading-none tracking-[-0.03em] text-landing-text">
              {item.valor}
            </dd>
            <dt className="text-[15px] font-medium text-landing-text">{item.rotulo}</dt>
            <p className="text-sm leading-relaxed text-landing-muted">{item.nota}</p>
          </div>
        ))}
      </dl>
    </section>
  )
}
