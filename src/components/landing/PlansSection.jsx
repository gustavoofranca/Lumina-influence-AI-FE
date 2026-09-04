import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import CartaoDeVidro from './CartaoDeVidro.jsx'
import { PILULA, PILULA_PRIMARIA, TEXTO_PILULA, TITULO_SECAO, WASH_SECAO_SUAVE } from './estilos.js'

const EMAIL_CONTATO = import.meta.env.VITE_CONTACT_EMAIL || 'contato@k13.com.br'

/**
 * Planos.
 *
 * Os cartões trazem **só** o que difere entre os dois — o volume —, e o que o
 * produto entrega vive numa lista compartilhada embaixo. Listar sob o
 * Enterprise algo que os dois planos têm seria exclusividade inventada, e era
 * o que acontecia: "Suporte 24h via Slack", "Acesso total via API (Webhooks)",
 * "Custom NLP Training" e "Dedicated Account Manager" não existem no produto.
 *
 * O preço do plano Agência é o mesmo que está no banco. A página anunciava
 * R$ 2.490 enquanto o sistema cobrava R$ 1.297 — a página de vendas
 * contradizia o produto que ela vende.
 */
function Cartao({ plano, destaque, children }) {
  return (
    <CartaoDeVidro
      aura={destaque}
      className={cn(destaque && 'shadow-glow-card-forte')}
      interno="gap-6 !p-7 sm:!p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-landing-text">{plano.name}</h3>
        {plano.badge && (
          <span className="rounded border border-landing-measured/40 px-2 py-0.5 text-xs text-landing-measured">
            {plano.badge}
          </span>
        )}
      </div>

      <p className="flex items-baseline gap-1.5">
        <span className="font-display text-4xl font-semibold tracking-[-0.02em] text-landing-text">
          {plano.price}
        </span>
        {plano.period && <span className="text-sm text-landing-muted">{plano.period}</span>}
      </p>

      <ul className="flex flex-col gap-3">
        {plano.features.map((f) => (
          <li key={f} className="text-[15px] leading-relaxed text-landing-muted">
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-2">{children}</div>
    </CartaoDeVidro>
  )
}

export default function PlansSection() {
  const { t } = useTranslation()
  const agency = t('landing.plans.agency', { returnObjects: true })
  const enterprise = t('landing.plans.enterprise', { returnObjects: true })
  const shared = t('landing.plans.shared', { returnObjects: true })

  const acao = 'w-full px-6 py-3 font-display text-sm font-semibold'

  return (
    <section id="plans" className={cn(WASH_SECAO_SUAVE, "mx-auto w-full max-w-[1180px] px-6 py-24 sm:px-8")}>
      <div className="flex flex-col gap-12">
        <div className="flex max-w-[46ch] flex-col gap-4">
          <h2 className={TITULO_SECAO}>
            {t('landing.plans.title')}
          </h2>
          <p className="text-lg leading-relaxed text-landing-muted">
            {t('landing.plans.subtitle')}
          </p>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-2">
          <Cartao plano={agency} destaque>
            <Link
              to="/cadastro"
              className={cn(acao, PILULA_PRIMARIA, TEXTO_PILULA)}
            >
              {agency.cta}
            </Link>
          </Cartao>

          <Cartao plano={enterprise}>
            <a
              href={`mailto:${EMAIL_CONTATO}`}
              className={cn(
                acao, PILULA, TEXTO_PILULA
              )}
            >
              {enterprise.cta}
            </a>
          </Cartao>
        </div>

        <CartaoDeVidro interno="!p-7 sm:!p-8">
          <h3 className="font-display text-base font-semibold text-landing-text">
            {shared.title}
          </h3>
          <ul className="mt-5 grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {shared.items.map((item) => (
              <li key={item} className="text-[15px] leading-relaxed text-landing-muted">
                {item}
              </li>
            ))}
          </ul>
        </CartaoDeVidro>
      </div>
    </section>
  )
}
