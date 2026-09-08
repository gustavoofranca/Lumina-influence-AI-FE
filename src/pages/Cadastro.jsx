import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'

import AuthLayout from '../layouts/AuthLayout.jsx'
import Button from '../components/ui/Button.jsx'
import { googleLoginUrl } from '../services/auth.js'
import { cn } from '../lib/cn.js'

/**
 * Cadastro — porta de entrada de quem ainda não tem conta.
 *
 * Não existe registro por e-mail e senha: a autenticação do produto é OAuth 2.0.
 * A conta e a agência nascem no retorno do Google, e o nome da agência é pedido
 * em /primeiro-acesso — único momento em que essa informação existe.
 */
export default function Cadastro() {
  const { t } = useTranslation()

  const handleGoogle = () => {
    window.location.href = googleLoginUrl()
  }

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] bg-gradient-to-b from-white from-[22.5%] to-white/70 bg-clip-text text-transparent">
          {t('auth.cadastro.title')}
        </h1>
        <p className="mt-2 text-sm text-landing-muted">{t('auth.cadastro.subtitle')}</p>
      </div>

      <Button
        type="button"
        variant="vidro-primaria"
        fullWidth
        size="lg"
        onClick={handleGoogle}
      >
        {t('auth.cadastro.google')}
      </Button>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
        <span className="mt-0.5 text-landing-violet">
          <ShieldCheck size={16} />
        </span>
        <p className="text-xs leading-relaxed text-landing-muted">
          {t('auth.cadastro.hint')}
        </p>
      </div>

      <p className={cn('mt-6 text-center text-sm text-landing-muted')}>
        {t('auth.cadastro.hasAccount')}{' '}
        <Link to="/login" className="font-semibold text-landing-violet transition-opacity hover:opacity-80">
          {t('auth.cadastro.login')}
        </Link>
      </p>
    </AuthLayout>
  )
}
