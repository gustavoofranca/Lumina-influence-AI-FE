import { Link } from 'react-router-dom'

import LanguageSwitcher from '../components/ui/LanguageSwitcher.jsx'
import StatusIndicator from '../components/ui/StatusIndicator.jsx'
import { useTranslation } from 'react-i18next'
import LuminaWordmark from '../components/ui/LuminaWordmark.jsx'

export default function AuthLayout({ children }) {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg-base px-4 py-12">
      {/* Glows de fundo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: [
            'radial-gradient(55% 45% at 15% 10%, rgba(124,58,237,0.14) 0%, transparent 60%)',
            'radial-gradient(40% 35% at 85% 85%, rgba(14,165,233,0.08) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Language switcher + logo no topo */}
      <div className="relative mb-8 flex w-full max-w-md items-center justify-between">
        <Link to="/" aria-label="Lumina AI">
          <LuminaWordmark tamanho="text-[1.6rem]" />
        </Link>
        <LanguageSwitcher />
      </div>

      {/* Card central */}
      {/* `main` e não `div`: é o marco que leva o leitor de tela direto ao
          formulário, pulando cabeçalho e decoração. Login e cadastro eram as
          únicas telas do produto sem nenhum marco de conteúdo. */}
      <main className="relative w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-primary/15 bg-bg-surface/70 p-8 shadow-glow-soft backdrop-blur-md">
          {children}
        </div>
      </main>

      {/* Status rodapé */}
      <div className="relative mt-8">
        <StatusIndicator label={t('status.operational')} color="success" />
      </div>
    </div>
  )
}
