import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import { MIOLO, MOLDURA, PILULA, TEXTO_PILULA, TITULO_SECAO } from './estilos.js'

/**
 * Perguntas frequentes — e, aqui, o lugar onde os limites do produto ficam por
 * escrito na página pública.
 *
 * O conteúdo não é material de venda: cada resposta corresponde a uma decisão
 * registrada (ADR-002 para os proxies financeiros, ADR-003 para a ausência que
 * não vira zero, ADR-005 para a divisão de alcance) e é repetida dentro do
 * produto. Compromisso publicado que não tem endereço no código envelhece em
 * silêncio.
 *
 * `<button aria-expanded>` com o painel logo em seguida, e não `<details>`: o
 * `<details>` nativo não anima altura de forma consistente entre navegadores e
 * não deixa fechar os irmãos ao abrir um.
 */
function Pergunta({ pergunta, resposta, aberta, aoAlternar, ultima }) {
  const id = useId()

  return (
    <div className={cn(ultima ? "" : "border-b border-landing-line/25")}>
      <h3>
        <button
          type="button"
          onClick={aoAlternar}
          aria-expanded={aberta}
          aria-controls={id}
          className={cn(
            'flex w-full items-center justify-between gap-6 py-6 text-left',
            'font-display text-lg font-medium text-landing-text transition-colors',
            'hover:text-landing-measured'
          )}
        >
          <span>{pergunta}</span>
          <Plus
            size={20}
            aria-hidden
            className={cn(
              'shrink-0 text-landing-muted transition-transform duration-300',
              'motion-reduce:transition-none',
              aberta && 'rotate-45 text-landing-measured'
            )}
          />
        </button>
      </h3>

      <div
        id={id}
        hidden={!aberta}
        className="max-w-[76ch] pb-7 text-[15px] leading-relaxed text-landing-muted"
      >
        {resposta}
      </div>
    </div>
  )
}

export default function FaqSection() {
  const { t } = useTranslation()
  const items = t('landing.faq.items', { returnObjects: true })
  const [abertaEm, setAbertaEm] = useState(0)

  return (
    <section className="bg-wash-secao mx-auto w-full max-w-[1180px] px-6 py-24 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
          <span className={cn(PILULA, TEXTO_PILULA, 'w-fit px-3.5 py-1 text-sm font-medium')}>
            {t('landing.faq.selo')}
          </span>
          <h2 className={TITULO_SECAO}>
            {t('landing.faq.title')}
          </h2>
          <p className="max-w-[38ch] text-lg leading-relaxed text-landing-muted">
            {t('landing.faq.subtitle')}
          </p>
        </div>

        <div className={MOLDURA}>
        <div className={cn(MIOLO, 'px-6 sm:px-8')}>
          {items.map((item, i) => (
            <Pergunta
              key={item.q}
              pergunta={item.q}
              resposta={item.a}
              aberta={abertaEm === i}
              aoAlternar={() => setAbertaEm(abertaEm === i ? -1 : i)}
              ultima={i === items.length - 1}
            />
          ))}
        </div>
        </div>
      </div>
    </section>
  )
}
