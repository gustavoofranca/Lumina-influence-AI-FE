import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx'
import LuminaWordmark from '../ui/LuminaWordmark.jsx'

// `secao` só existe para os dois itens que têm seção própria. Cases e API
// apontam para a mesma âncora de Solutions e não podem acender junto com ela —
// três itens realçados ao mesmo tempo não dizem nada sobre onde o leitor está.
const NAV = [
  { key: 'solutions', anchor: '#features', secao: 'features' },
  { key: 'pricing',   anchor: '#plans',    secao: 'plans' },
  { key: 'cases',     anchor: '#features' },
  { key: 'api',       anchor: '#features' },
]

/**
 * Marca o item do menu cuja seção está à vista.
 *
 * O design mostra "Solutions" sublinhado — é o estado do topo da página. Fixar
 * o realce no primeiro item deixaria o menu afirmando a seção errada assim que
 * o usuário rolasse, então quem decide é o que está na tela.
 */
function useSecaoVisivel() {
  const [secao, setSecao] = useState('features')

  useEffect(() => {
    const alvos = ['features', 'plans']
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (!alvos.length) return

    // O observador serve de gatilho; quem decide é a posição de todos os alvos.
    // Confiar só nas entradas recebidas deixava o menu preso na última seção
    // vista — no topo da página ele continuava marcando "Pricing".
    const atualizar = () => {
      const meio = window.innerHeight / 2
      const atual = alvos.find((el) => {
        const r = el.getBoundingClientRect()
        return r.top <= meio && r.bottom >= meio
      })
      setSecao(atual ? atual.id : 'features')
    }

    const observador = new IntersectionObserver(atualizar, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
    })
    alvos.forEach((el) => observador.observe(el))
    window.addEventListener('scroll', atualizar, { passive: true })
    atualizar()
    return () => {
      observador.disconnect()
      window.removeEventListener('scroll', atualizar)
    }
  }, [])

  return secao
}

/**
 * Barra fixa, não sticky: no design ela fica por cima do topo do hero, que
 * reserva 128px de respiro. Sticky empurraria a arte inteira 80px para baixo.
 */
export default function HeaderSection() {
  const { t } = useTranslation()
  const secao = useSecaoVisivel()
  // Abaixo de 1024px o menu de seções não cabe na barra. Sem este disclosure a
  // landing simplesmente não tinha navegação no celular.
  const [aberto, setAberto] = useState(false)
  const idMenu = useId()

  useEffect(() => {
    if (!aberto) return
    const fechar = (e) => e.key === 'Escape' && setAberto(false)
    window.addEventListener('keydown', fechar)
    return () => window.removeEventListener('keydown', fechar)
  }, [aberto])

  return (
    <header className={cn(
      'fixed inset-x-0 top-0 z-50 backdrop-blur-[12px]',
      'bg-landing-bg/80 shadow-[0_25px_50px_-12px_rgba(6,14,32,0.4)]'
    )}>
      <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between gap-6 px-8">
        <Link to="/" className="shrink-0" aria-label="Lumina Influence AI">
          <LuminaWordmark markClassName="w-[26px]" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map(({ key, anchor, secao: alvo }) => {
            const ativo = alvo === secao
            return (
              <a
                key={key}
                href={anchor}
                aria-current={ativo ? 'true' : undefined}
                className={cn(
                  // min-w garante o alvo de 24px do WCAG 2.5.8: "API" mede 23px
                  // de largura e ficava abaixo do mínimo.
                  'min-w-6 pb-1.5 text-center text-sm font-medium transition-colors',
                  ativo
                    ? 'border-b-2 border-landing-violet text-landing-violet'
                    : 'text-landing-muted hover:text-landing-text'
                )}
              >
                {t(`landing.nav.${key}`)}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-controls={idMenu}
            aria-label={t(aberto ? 'common.a11y.closeMenu' : 'common.a11y.openMenu')}
            className="rounded-lg p-1.5 text-landing-muted transition-colors hover:text-landing-text lg:hidden"
          >
            {aberto ? <X size={20} /> : <Menu size={20} />}
          </button>
          <LanguageSwitcher />
          <Link
            to="/login"
            className={cn(
              // py-1 leva o alvo de 20px para 28px sem deslocar nada: o flex
              // centraliza o item na barra.
              'hidden whitespace-nowrap py-1 text-sm font-medium text-landing-muted',
              'transition-colors hover:text-landing-text sm:block'
            )}
          >
            {t('landing.nav.login')}
          </Link>
          <Link
            to="/cadastro"
            className={cn(
              'whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold text-landing-ink',
              'bg-gradient-to-br from-[#BD9DFF] to-[#8A4CFC]',
              'shadow-[0_10px_15px_-3px_rgba(189,157,255,0.2),0_4px_6px_-4px_rgba(189,157,255,0.2)]',
              'transition-transform hover:-translate-y-px'
            )}
          >
            {t('landing.nav.cta')}
          </Link>
        </div>
      </div>

      {aberto && (
        <nav
          id={idMenu}
          className="border-t border-landing-line/15 bg-landing-bg/95 px-8 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map(({ key, anchor }) => (
              <li key={key}>
                <a
                  href={anchor}
                  onClick={() => setAberto(false)}
                  className={cn(
                    'block rounded-lg px-2 py-2.5 text-sm font-medium text-landing-muted',
                    'transition-colors hover:bg-landing-glass/40 hover:text-landing-text'
                  )}
                >
                  {t(`landing.nav.${key}`)}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/login"
                onClick={() => setAberto(false)}
                className={cn(
                  'block rounded-lg px-2 py-2.5 text-sm font-medium text-landing-muted',
                  'transition-colors hover:bg-landing-glass/40 hover:text-landing-text sm:hidden'
                )}
              >
                {t('landing.nav.login')}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
