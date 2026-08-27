import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2 } from 'lucide-react'

import AuthLayout from '../layouts/AuthLayout.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import ApiErrorBanner from '../components/ui/ApiErrorBanner.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { updateAgency } from '../services/agency.js'

/**
 * Primeiro acesso via OAuth: o back-end cria a agencia com um nome
 * provisorio, e aqui o dono da conta escolhe o nome de verdade antes de
 * entrar no app. So aparece quando o login acabou de criar a agencia.
 */
export default function PrimeiroAcesso() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { agency, refreshUser } = useAuth()

  const [nome, setNome] = useState('')
  const [erroCampo, setErroCampo] = useState('')
  const [erroApi, setErroApi] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const seguir = () => navigate('/app/dashboard', { replace: true })

  const onSubmit = async (e) => {
    e.preventDefault()
    const limpo = nome.trim()
    if (!limpo) {
      setErroCampo(t('primeiroAcesso.nameRequired'))
      return
    }
    setErroCampo('')
    setErroApi(null)
    setSalvando(true)
    try {
      await updateAgency(agency.id, { name: limpo })
      await refreshUser()
      seguir()
    } catch (err) {
      setErroApi(err)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {t('primeiroAcesso.title')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {t('primeiroAcesso.subtitle')}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <Input
            label={t('primeiroAcesso.agencyName')}
            placeholder={t('primeiroAcesso.agencyNamePlaceholder')}
            leftIcon={Building2}
            value={nome}
            onChange={(e) => { setNome(e.target.value); setErroCampo('') }}
            error={erroCampo}
            autoFocus
          />

          <ApiErrorBanner error={erroApi} />

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={seguir}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {t('primeiroAcesso.skip')}
            </button>
            <Button type="submit" variant="primary" disabled={salvando}>
              {salvando ? t('primeiroAcesso.saving') : t('primeiroAcesso.confirm')}
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
