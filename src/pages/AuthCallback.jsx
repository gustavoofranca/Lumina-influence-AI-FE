import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'
import { useTranslation } from 'react-i18next'

/**
 * Recebe o redirect do back-end após o OAuth Google:
 *   /auth/callback#access_token=...&refresh_token=...
 * Extrai o token do fragmento, carrega o usuário e entra no app.
 */
export default function AuthCallback() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { loginWithTokens } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    const frag = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const accessToken = frag.get('access_token')
    if (!accessToken) {
      setError('Token ausente no retorno do login.')
      return
    }
    // O back-end marca quando este login acabou de criar a agência — é a única
    // hora em que dá para saber, e é o que dispara a escolha do nome dela.
    const agenciaNova = frag.get('new_agency') === '1'
    // Limpa o fragmento da URL (não deixa o token no histórico).
    window.history.replaceState(null, '', '/auth/callback')
    loginWithTokens(accessToken)
      .then(() => navigate(agenciaNova ? '/primeiro-acesso' : '/app/dashboard',
                           { replace: true }))
      .catch((e) => setError(e.message || t('auth.callback.error')))
  }, [loginWithTokens, navigate])

  return (
    <AuthLayout>
      <div className="text-center">
        {error ? (
          <>
            <h1 className="font-display text-2xl font-bold text-tertiary-400">{t('auth.callback.failed')}</h1>
            <p className="mt-2 text-sm text-text-secondary">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 text-sm font-semibold text-accent hover:text-accent-strong"
            >
              {t('auth.callback.back')}
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            <p className="mt-4 text-sm text-text-secondary">{t('auth.callback.authenticating')}</p>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
