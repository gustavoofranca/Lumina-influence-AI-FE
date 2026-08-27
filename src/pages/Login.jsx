import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { Mail, Lock } from 'lucide-react'

import AuthLayout from '../layouts/AuthLayout.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { googleLoginUrl } from '../services/auth.js'
import { cn } from '../lib/cn.js'
import { useDarkOnly } from '../hooks/useDarkOnly.js'

export default function Login() {
  useDarkOnly()
  const { t } = useTranslation()
  const { devLogin } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState(null)

  // Login local via dev-login (usa o e-mail digitado, ou o admin seedado se vazio).
  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)
    setLoading(true)
    try {
      await devLogin(email || undefined)
      navigate('/app/dashboard')
    } catch (err) {
      setApiError(err.message || 'Falha no login.')
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    window.location.href = googleLoginUrl()
  }

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-text-primary">
          {t('auth.login.title')}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">{t('auth.login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label={t('auth.login.email')}
          type="email"
          placeholder={t('auth.login.emailPlaceholder')}
          leftIcon={Mail}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label={t('auth.login.password')}
          type="password"
          placeholder="••••••••"
          leftIcon={Lock}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }}
          error={errors.password}
          autoComplete="current-password"
        />

        {apiError && (
          <p className="rounded-lg bg-tertiary-500/10 px-3 py-2 text-xs text-tint-rose">
            {apiError}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          loading={loading}
        >
          {t('auth.login.submit')}
        </Button>

        <Button
          type="button"
          variant="outlined"
          fullWidth
          size="lg"
          onClick={handleGoogle}
        >
          {t('auth.login.google')}
        </Button>
        <p className="text-center text-[11px] text-text-muted">
          <Trans
            i18nKey="auth.login.devHint"
            values={{ acao: t('auth.login.submit') }}
            components={{ 1: <b /> }}
          />
        </p>
      </form>

      <p className={cn('mt-6 text-center text-sm text-text-secondary')}>
        {t('auth.login.noAccount')}{' '}
        <Link to="/cadastro" className="font-semibold text-accent hover:text-accent-strong">
          {t('auth.login.createAccount')}
        </Link>
      </p>
    </AuthLayout>
  )
}
