import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import LuminaWordmark from '../ui/LuminaWordmark.jsx'
import { EMAIL_CONTATO } from '../../lib/contato.js'

// `apiDocs` saiu: o rótulo dizia "Documentação da API" e o destino era a
// âncora da seção de recursos. Não há documentação pública da API — o Swagger
// serve a equipe, não o visitante.
const PRODUTO = ['features', 'solutions']
const EMPRESA = ['privacy', 'terms', 'deletion', 'contact']

// Âncora começando com '#' rola na própria landing; o resto é rota da
// aplicação e precisa de <Link>, senão o navegador recarrega a página inteira.
// Privacidade, termos e exclusão apontavam para '#' — um link que não leva a
// lugar nenhum é reprovação certa no App Review da Meta, que abre cada um.
const DESTINOS = {
  features: '#features', solutions: '#plans',
  privacy: '/privacidade', terms: '/termos', deletion: '/exclusao-de-dados',
  contact: `mailto:${EMAIL_CONTATO}`,
}

// O texto de 12px deixa o alvo com 15px de altura; o padding vertical leva a
// 27px sem mexer no ritmo da coluna.
const ESTILO_LINK = cn(
  'inline-block py-1.5 text-sm leading-5 text-landing-muted',
  'transition-colors hover:text-landing-text'
)

function LinkDoRodape({ destino, children }) {
  if (destino.startsWith('#') || destino.startsWith('mailto:')) {
    return <a href={destino} className={ESTILO_LINK}>{children}</a>
  }
  return <Link to={destino} className={ESTILO_LINK}>{children}</Link>
}

function Coluna({ titulo, chaves, t }) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-sm font-semibold text-landing-text">{titulo}</h2>
      <ul className="flex flex-col gap-4">
        {chaves.map((chave) => (
          <li key={chave}>
            <LinkDoRodape destino={DESTINOS[chave]}>
              {t(`landing.footer.links.${chave}`)}
            </LinkDoRodape>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FooterSection() {
  const { t } = useTranslation()

  return (
    <footer className={cn(
      'relative bg-landing-bg pb-16 pt-16',
      "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-hairline-fade before:content-['']"
    )}>
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-16 px-6 sm:px-8">
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
