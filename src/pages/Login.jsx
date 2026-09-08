import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { Mail } from 'lucide-react'

import AuthLayout from '../layouts/AuthLayout.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { googleLoginUrl } from '../services/auth.js'
import { cn } from '../lib/cn.js'

export default function Login() {
  const { t } = useTranslation()
  const { devLogin } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState(null)

  /**
   * Entra pela conta de demonstração (dev-login), com o e-mail digitado ou o
   * admin seedado se vazio.
   *
   * Não há campo de senha porque não há senha: a autenticação do produto é
   * OAuth 2.0 e nenhum modelo guarda credencial. O campo existia e não era
   * enviado a lugar nenhum — afirmava uma verificação que não acontecia.
   *
   * `dev_login_disabled` é 403 e não é falha: em staging e produção o atalho
   * é desligado por configuração, e o caminho passa a ser só o Google. Sem
   * este ramo, o usuário lia "Forbidden" e não sabia o que fazer.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)
    setLoading(true)
    try {
      await devLogin(email || undefined)
      navigate('/app/dashboard')
    } catch (err) {
      setApiError(
        err.code === 'dev_login_disabled'
          ? t('auth.login.devDisabled')
          : err.message || t('auth.login.failed')
      )
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    window.location.href = googleLoginUrl()
  }

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        {/* O mesmo degradê descendente das manchetes da landing: branco em cima,
            apagando para baixo. É o que liga a tela ao lugar de onde o visitante
            veio. */}
        <h1 className={cn(
          'font-display text-3xl font-semibold tracking-[-0.02em]',
          'bg-gradient-to-b from-white from-[22.5%] to-white/70 bg-clip-text text-transparent'
        )}>
          {t('auth.login.title')}
        </h1>
        <p className="mt-2 text-sm text-landing-muted">{t('auth.login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          variant="vidro"
          label={t('auth.login.email')}
          type="email"
          placeholder={t('auth.login.emailPlaceholder')}
          leftIcon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        {apiError && (
          <p className="rounded-lg bg-tertiary-500/10 px-3 py-2 text-xs text-tint-rose">
            {apiError}
          </p>
        )}

        <Button
          type="submit"
          variant="vidro-primaria"
          fullWidth
          size="lg"
          loading={loading}
        >
          {t('auth.login.submit')}
        </Button>

        <Button
          type="button"
          variant="vidro"
          fullWidth
          size="lg"
          onClick={handleGoogle}
        >
          {t('auth.login.google')}
        </Button>
        <p className="text-center text-[11px] text-landing-muted">
          <Trans
            i18nKey="auth.login.devHint"
            values={{ acao: t('auth.login.submit') }}
            components={{ 1: <b /> }}
          />
        </p>
      </form>

      <p className={cn('mt-6 text-center text-sm text-landing-muted')}>
        {t('auth.login.noAccount')}{' '}
        <Link to="/cadastro" className="font-semibold text-landing-violet transition-opacity hover:opacity-80">
          {t('auth.login.createAccount')}
        </Link>
      </p>
    </AuthLayout>
  )
}
