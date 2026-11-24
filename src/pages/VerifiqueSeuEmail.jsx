import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { MailCheck } from 'lucide-react'

import AuthLayout from '../layouts/AuthLayout.jsx'
import Button from '../components/ui/Button.jsx'
import AvisoDeEntrada from '../components/auth/AvisoDeEntrada.jsx'
import { reenviarVerificacao } from '../services/auth.js'
import { mascararEmail } from '../lib/email.js'
import { mensagemDeAuth } from '../lib/errosDeAuth.js'

const ESPERA_SEGUNDOS = 60

/** Depois do cadastro: avisa para onde foi o link e deixa reenviar, com espera entre envios. */
export default function VerifiqueSeuEmail() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const email = state?.email ?? ''
  const [espera, setEspera] = useState(ESPERA_SEGUNDOS)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    if (espera <= 0) return undefined
    const tique = setTimeout(() => setEspera((s) => s - 1), 1000)
    return () => clearTimeout(tique)
  }, [espera])

  const reenviar = async () => {
    setEnviando(true)
    setAviso(null)
    try {
      await reenviarVerificacao(email)
      setAviso({ tipo: 'ok', texto: t('auth.verifique.resent') })
      setEspera(ESPERA_SEGUNDOS)
    } catch (err) {
      setAviso({ tipo: 'erro', texto: mensagemDeAuth(t, err) })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center">
        <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-landing-violet/15 text-landing-violet">
          <MailCheck size={22} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-white">{t('auth.verifique.title')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-landing-muted">
          {email
            ? <Trans i18nKey="auth.verifique.body" values={{ email: mascararEmail(email) }} components={{ b: <b className="text-white" /> }} />
            : t('auth.verifique.bodyNoEmail')}
        </p>
        <p className="mt-2 text-xs text-landing-muted">{t('auth.verifique.spam')}</p>
      </div>

      <div className="mt-6 space-y-3">
        {aviso && <AvisoDeEntrada tipo={aviso.tipo}>{aviso.texto}</AvisoDeEntrada>}
        <Button
          type="button"
          variant="vidro"
          fullWidth
          size="lg"
          loading={enviando}
          disabled={!email || espera > 0}
          onClick={reenviar}
        >
          {espera > 0 ? t('auth.verifique.resendIn', { s: espera }) : t('auth.verifique.resend')}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-landing-muted">
        {t('auth.verifique.wrongEmail')}{' '}
        <Link to="/cadastro" className="font-semibold text-landing-violet hover:opacity-80">
          {t('auth.verifique.back')}
        </Link>
      </p>
    </AuthLayout>
  )
}
