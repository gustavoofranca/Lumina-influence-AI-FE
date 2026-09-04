import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import CartaoDeVidro from './CartaoDeVidro.jsx'
import { TITULO_SECAO, WASH_SECAO_SUAVE } from './estilos.js'

/**
 * A comparação entre o que o criador reporta e o que o Lumina coleta.
 *
 * Os dois lados usam a mesma linguagem visual do herói: o que não é
 * verificável aparece em contorno tracejado, o que é verificável aparece com
 * cor cheia. A comparação é lida antes do texto ser lido.
 *
 * O texto anterior afirmava "40h semanais em planilhas", "42% ROI
 * desperdiçado", "12x mais insights" e "dados 100% reais" — quatro números que
 * ninguém mediu, numa página sobre não apresentar número que ninguém mediu.
 */
function Coluna({ titulo, itens, metricaRotulo, metricaValor, verificavel }) {
  // As duas colunas assentam em vidro — sem isso a não verificada flutua na
  // página. O que continua separando as duas é a moldura: a verificada tem
  // borda em degradê, aura violeta e brilho; a outra tem traço pontilhado e
  // nenhuma luz. A ausência segue lida como ausência, agora sobre uma
  // superfície.
  return (
    <CartaoDeVidro
      aura={verificavel}
      moldura={verificavel}
      className={cn(
        verificavel ? 'shadow-glow-card' : 'border border-dashed border-landing-unmeasured'
      )}
      interno="gap-6 !p-7 sm:!p-8"
    >
      <h3 className="font-display text-xl font-semibold text-landing-text">{titulo}</h3>

      <ul className="flex flex-col gap-4">
        {itens.map((item) => (
          <li key={item} className="grid grid-cols-[auto_1fr] gap-3 text-[15px] leading-relaxed">
            <span
              aria-hidden
              className={cn(
                'mt-2 h-px w-4 shrink-0',
                verificavel ? 'bg-landing-measured' : 'bg-landing-unmeasured'
              )}
            />
            <span className="text-landing-muted">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-baseline justify-between gap-4 border-t border-landing-line/25 pt-5">
        <span className="text-sm text-landing-muted">{metricaRotulo}</span>
        <span
          className={cn(
            'font-display text-base font-semibold',
            verificavel ? 'text-landing-measured' : 'text-landing-muted'
          )}
        >
          {metricaValor}
        </span>
      </div>
    </CartaoDeVidro>
  )
}

export default function ComparativoSection() {
  const { t } = useTranslation()
  const chaos = t('landing.comparativo.chaos', { returnObjects: true })
  const lumina = t('landing.comparativo.lumina', { returnObjects: true })

  return (
    <section id="features" className={cn(WASH_SECAO_SUAVE, "mx-auto w-full max-w-[1180px] px-6 py-24 sm:px-8")}>
      <div className="flex flex-col gap-12">
        <div className="flex max-w-[46ch] flex-col gap-4">
          <h2 className={TITULO_SECAO}>
            {t('landing.comparativo.title')}
          </h2>
          <p className="text-lg leading-relaxed text-landing-muted">
            {t('landing.comparativo.subtitle')}
          </p>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-2">
          <Coluna
            titulo={chaos.title}
            itens={chaos.items}
            metricaRotulo={chaos.metricLabel}
            metricaValor={chaos.metricValue}
            verificavel={false}
          />
          <Coluna
            titulo={lumina.title}
            itens={lumina.items}
            metricaRotulo={lumina.metricLabel}
            metricaValor={lumina.metricValue}
            verificavel
          />
        </div>
      </div>
    </section>
  )
}
