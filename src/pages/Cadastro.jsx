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
        <h1 className="font-display text-3xl font-bold text-neutral-100">
          {t('auth.cadastro.title')}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">{t('auth.cadastro.subtitle')}</p>
      </div>

      <Button
        type="button"
        variant="primary"
        fullWidth
        size="lg"
        onClick={handleGoogle}
      >
        {t('auth.cadastro.google')}
      </Button>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-neutral-700/60 bg-neutral-800/40 px-4 py-3">
        <span className="mt-0.5 text-primary-300">
          <ShieldCheck size={16} />
        </span>
        <p className="text-xs leading-relaxed text-text-secondary">
          {t('auth.cadastro.hint')}
        </p>
      </div>

      <p className={cn('mt-6 text-center text-sm text-text-secondary')}>
        {t('auth.cadastro.hasAccount')}{' '}
        <Link to="/login" className="font-semibold text-primary-300 hover:text-primary-200">
          {t('auth.cadastro.login')}
        </Link>
      </p>
    </AuthLayout>
  )
}
