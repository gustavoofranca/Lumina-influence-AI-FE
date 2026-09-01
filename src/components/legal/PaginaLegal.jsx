import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

import FooterSection from '../landing/FooterSection.jsx'
import LuminaWordmark from '../ui/LuminaWordmark.jsx'
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx'
import { useDarkOnly } from '../../hooks/useDarkOnly.js'
import { EMAIL_CONTATO } from '../../lib/contato.js'

/**
 * PaginaLegal — casco das páginas públicas de política, termos e exclusão.
 *
 * O conteúdo vem inteiro do i18n sob a chave passada em `base`, no formato
 * `{ title, updated, intro, sections: [{ h, p }] }`. Manter o texto fora do JSX
 * é o que permite revisar a versão em inglês — a que o revisor da Meta lê — sem
 * tocar em componente, e é a mesma razão de o seletor de idioma ficar visível
 * aqui: a página precisa provar que existe nos dois idiomas.
 *
 * `{{email}}` em qualquer parágrafo é substituído pelo endereço de contato.
 */
export default function PaginaLegal({ base }) {
  const { t } = useTranslation()
  useDarkOnly()

  const secoes = t(`${base}.sections`, { returnObjects: true })
  const lista = Array.isArray(secoes) ? secoes : []

  return (
    <div className="min-h-screen bg-landing-bg font-sans text-landing-text">
      <header className="border-b border-landing-line/15">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-8 py-5">
          <Link to="/" className="flex items-center gap-3" aria-label="Lumina Influence AI">
            <LuminaWordmark markClassName="w-[26px]" />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] px-8 py-16">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-xs text-landing-muted transition-colors hover:text-landing-text"
        >
          <ArrowLeft size={14} />
          {t('legal.back')}
        </Link>

        <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
          {t(`${base}.title`)}
        </h1>
        <p className="mt-3 text-xs text-landing-muted">
          {t('legal.updatedAt', { date: t(`${base}.updated`) })}
        </p>
        <p className="mt-8 text-sm leading-relaxed text-landing-muted">
          {t(`${base}.intro`, { email: EMAIL_CONTATO })}
        </p>

        <div className="mt-12 flex flex-col gap-10">
          {lista.map((secao, i) => (
            <section key={secao.h ?? i} className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-semibold text-white">{secao.h}</h2>
              {String(secao.p).split('\n').map((paragrafo, j) => (
                <p key={j} className="text-sm leading-relaxed text-landing-muted">
                  {paragrafo.replaceAll('{{email}}', EMAIL_CONTATO)}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
