import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import AuthLayout from '../layouts/AuthLayout.jsx'
import AtivacaoDoisFatores from '../components/auth/AtivacaoDoisFatores.jsx'
import { destinoAposLogin, useAuth } from '../context/AuthContext.jsx'
import { cn } from '../lib/cn.js'

/**
 * Ativação obrigatória do 2FA para administrador, no meio do login: a API não
 * entrega a sessão a um administrador sem segundo fator, só o ticket que serve
 * para ativá-lo. Concluída a ativação, a sessão nova é aplicada e a pessoa
 * segue para onde iria.
 */
export default function AtivarDoisFatores() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { state } = useLocation()
  const { aplicarSessao } = useAuth()

  if (!state?.ticket) return <Navigate to="/login" replace />

  const entrar = (dados) => {
    aplicarSessao(dados)
    navigate(destinoAposLogin(dados.user, dados.agency), { replace: true })
  }

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className={cn(
          'font-display text-3xl font-semibold tracking-[-0.02em]',
          'bg-gradient-to-b from-white from-[22.5%] to-white/70 bg-clip-text text-transparent'
        )}>
          {t('auth.mfa.setup.title')}
        </h1>
        <p className="mt-2 text-sm text-landing-muted">{t('auth.mfa.setup.subtitleRequired')}</p>
      </div>
      <AtivacaoDoisFatores ticket={state.ticket} onAtivado={entrar} vidro />
    </AuthLayout>
  )
}
