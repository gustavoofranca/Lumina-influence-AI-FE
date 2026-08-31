import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import LuminaWordmark from '../ui/LuminaWordmark.jsx'

const PRODUTO = ['features', 'apiDocs', 'solutions']
const EMPRESA = ['privacy', 'terms', 'contact']
const ANCORAS = {
  features: '#features', apiDocs: '#features', solutions: '#features',
  privacy: '#', terms: '#', contact: '#',
}

function Coluna({ titulo, chaves, t }) {
  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-base font-semibold leading-6 text-white">{titulo}</h4>
      <ul className="flex flex-col gap-4">
        {chaves.map((chave) => (
          <li key={chave}>
            <a
              href={ANCORAS[chave]}
              className={cn(
                // O texto de 12px deixa o alvo com 15px de altura; o padding
                // vertical leva a 27px sem mexer no ritmo da coluna.
                'inline-block py-1.5 text-xs leading-4 text-landing-muted',
                'transition-colors hover:text-landing-text'
              )}
            >
              {t(`landing.footer.links.${chave}`)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FooterSection() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-landing-line/15 bg-landing-bg pb-16 pt-16">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <LuminaWordmark markClassName="w-[26px]" />
            <p className="max-w-[320px] text-sm leading-[22.75px] text-landing-muted">
              {t('landing.footer.tagline')}
            </p>
            <p className="text-xs leading-4 text-landing-muted">{t('landing.footer.copyright')}</p>
          </div>

          <Coluna titulo={t('landing.footer.product')} chaves={PRODUTO} t={t} />
          <Coluna titulo={t('landing.footer.company')} chaves={EMPRESA} t={t} />
        </div>

        <div className={cn(
          'flex flex-col items-center gap-4 border-t border-landing-line/10 pt-8'
        )}>
          <p className="text-center text-sm leading-5 text-landing-muted">
            {t('landing.footer.ctaQuestion')}
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-base font-semibold leading-6 text-landing-violet transition-opacity hover:opacity-80"
          >
            {t('landing.footer.ctaLink')}
          </button>
        </div>
      </div>
    </footer>
  )
}
