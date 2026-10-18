import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import AuthLayout from '../layouts/AuthLayout.jsx'
import PedirLink from '../components/auth/PedirLink.jsx'
import { esqueciSenha } from '../services/auth.js'

/** "Esqueci minha senha". A resposta é a mesma exista ou não a conta (OWASP). */
export default function RecuperarSenha() {
  const { t } = useTranslation()

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-white">{t('auth.recuperar.title')}</h1>
        <p className="mt-2 text-sm text-landing-muted">{t('auth.recuperar.subtitle')}</p>
      </div>
      <PedirLink enviar={esqueciSenha} rotulo={t('auth.recuperar.submit')} enviado={t('auth.recuperar.sent')} />
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-semibold text-landing-violet hover:opacity-80">
          {t('auth.recuperar.back')}
        </Link>
      </p>
    </AuthLayout>
  )
}
