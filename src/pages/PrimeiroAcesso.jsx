import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { Building2 } from 'lucide-react'

import AuthLayout from '../layouts/AuthLayout.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import CnpjInput from '../components/ui/CnpjInput.jsx'
import AvisoDeEntrada from '../components/auth/AvisoDeEntrada.jsx'
import ConfirmacaoDigitada from '../components/ui/ConfirmacaoDigitada.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { idDoCampo, useCampos } from '../hooks/useCampos.js'
import { aceitarTermos, deleteOwnAccount, previewAccountDeletion } from '../services/auth.js'
import { updateAgency } from '../services/agency.js'
import { mensagemDeAuth } from '../lib/errosDeAuth.js'
import { LIMITES, errosDaApi, juntarEspacos, validarCnpj, validarNomeEmpresa } from '../lib/limites.js'

// Nome provisório que a API dá à agência criada no login pelo Google
// (`DEFAULT_AGENCY_NAME` em auth_service). Não é um nome de verdade: o campo
// começa vazio.
const NOME_PROVISORIO = 'Minha Agência'

// Palavra que o usuário digita para confirmar a exclusão (a mesma da tela de Configurações).
const PALAVRA_EXCLUIR = 'EXCLUIR'

const LINK = 'font-semibold text-landing-violet underline-offset-2 hover:underline'

function validadores(precisaAceitar) {
  return {
    cnpj: (t, c) => validarCnpj(t, c.cnpj, null, { obrigatorio: true }),
    agencia: (t, c) => validarNomeEmpresa(t, c.agencia),
    ...(precisaAceitar
      ? { termos: (t, c) => (c.termos ? null : t('common.validation.termsRequired')) }
      : {}),
  }
}

/**
 * Completa o cadastro da agência: CNPJ (obrigatório) e nome, e o aceite dos
 * Termos para quem entrou pelo Google. Não há "definir depois" — o
 * `ProtectedRoute` traz de volta aqui o admin de agência sem CNPJ.
 */
export default function PrimeiroAcesso() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, agency, refreshUser, logout } = useAuth()
  const precisaAceitar = !user?.terms_accepted
  const { campos, erros, set, sair, validarTudo, mostrarErros } = useCampos(
    {
      cnpj: agency?.cnpj ?? '',
      agencia: agency?.name && agency.name !== NOME_PROVISORIO ? agency.name : '',
      termos: false,
    },
    validadores(precisaAceitar)
  )
  const [daReceita, setDaReceita] = useState(null)
  const [cnpjBloqueado, setCnpjBloqueado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const [dicaConvite, setDicaConvite] = useState(false)
  const [previa, setPrevia] = useState(null)
  const [carregandoPrevia, setCarregandoPrevia] = useState(false)

  const aoConsultarCnpj = (resultado) => {
    setCnpjBloqueado(Boolean(resultado.impeditiva))
    if (resultado.razao_social && (!campos.agencia || campos.agencia === daReceita)) {
      set('agencia', resultado.razao_social)
      setDaReceita(resultado.razao_social)
    }
  }

  // Não há como pular esta tela; sair é a única saída para quem não quer (ou
  // não pode) informar o CNPJ agora.
  const aoSair = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  // Quem entrou pelo Google vira admin de uma agência vazia e não tem outra
  // saída além de Sair: se o CNPJ da empresa já tem conta, ou a pessoa não tem
  // CNPJ, a exclusão (LGPD) precisa estar ao alcance desta tela. A prévia é
  // consultada antes de abrir a confirmação, como em Configurações, porque o que
  // a exclusão leva depende de a pessoa ser a única admin.
  const abrirExclusao = async () => {
    setAviso(null)
    setCarregandoPrevia(true)
    try {
      setPrevia(await previewAccountDeletion())
    } catch (err) {
      setAviso(mensagemDeAuth(t, err))
    } finally {
      setCarregandoPrevia(false)
    }
  }

  const excluirConta = async () => {
    await deleteOwnAccount()
    // A sessão morreu junto com a conta; limpa e volta para a página inicial.
    logout()
    navigate('/', { replace: true })
  }

  const levaAgencia = previa?.scope === 'agency'

  const onSubmit = async (e) => {
    e.preventDefault()
    setAviso(null)
    setDicaConvite(false)
    if (!validarTudo()) return
    if (cnpjBloqueado) {
      document.getElementById(idDoCampo('cnpj'))?.focus()
      return
    }
    setSalvando(true)
    try {
      await updateAgency(agency.id, { name: juntarEspacos(campos.agencia), cnpj: campos.cnpj })
      if (precisaAceitar) await aceitarTermos()
      await refreshUser()
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      const porCampo = errosDaApi(err, { name: 'agencia', cnpj: 'cnpj' })
      // CNPJ já tem conta: quem é da agência deve pedir convite, não recadastrar.
      setDicaConvite(Boolean(
        err?.details?.fields?.some((f) => f.field === 'cnpj' && f.type === 'cnpj_unavailable')
      ))
      if (Object.keys(porCampo).length) mostrarErros(porCampo)
      else setAviso(mensagemDeAuth(t, err))
      setSalvando(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <h1 className="font-display text-2xl font-bold text-white">{t('primeiroAcesso.title')}</h1>
        <p className="mt-2 text-sm leading-relaxed text-landing-muted">{t('primeiroAcesso.subtitle')}</p>

        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
          <CnpjInput
            variant="vidro"
            id={idDoCampo('cnpj')}
            label={t('auth.cadastro.cnpj')}
            value={campos.cnpj}
            onChange={(valor) => { set('cnpj', valor); setCnpjBloqueado(false); setDicaConvite(false) }}
            onBlur={() => sair('cnpj')}
            onConsulta={aoConsultarCnpj}
            error={erros.cnpj}
            autoFocus
          />
          {dicaConvite && (
            <p className="-mt-3 text-xs leading-relaxed text-landing-muted">{t('primeiroAcesso.inviteHint')}</p>
          )}
          <Input
            variant="vidro"
            id={idDoCampo('agencia')}
            label={t('primeiroAcesso.agencyName')}
            placeholder={t('primeiroAcesso.agencyNamePlaceholder')}
            leftIcon={Building2}
            autoComplete="organization"
            maxLength={LIMITES.nomeAgencia}
            value={campos.agencia}
            onChange={(e) => set('agencia', e.target.value)}
            onBlur={() => sair('agencia')}
            error={erros.agencia}
            helperText={daReceita && campos.agencia === daReceita ? t('auth.cadastro.prefilled') : undefined}
          />

          {precisaAceitar && (
            <div>
              <label className="flex items-start gap-3 text-xs leading-relaxed text-landing-muted">
                <input
                  id={idDoCampo('termos')}
                  type="checkbox"
                  checked={campos.termos}
                  onChange={(e) => set('termos', e.target.checked)}
                  onBlur={() => sair('termos')}
                  aria-invalid={!!erros.termos}
                  aria-describedby={erros.termos ? 'erro-termos' : undefined}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-violet-500"
                />
                <span>
                  <Trans
                    i18nKey="auth.cadastro.terms"
                    components={{
                      termos: <Link to="/termos" target="_blank" rel="noopener noreferrer" className={LINK} />,
                      privacidade: <Link to="/privacidade" target="_blank" rel="noopener noreferrer" className={LINK} />,
                    }}
                  />
                </span>
              </label>
              {erros.termos && (
                <p id="erro-termos" className="mt-1.5 text-xs font-medium text-tint-rose">{erros.termos}</p>
              )}
            </div>
          )}

          {aviso && <AvisoDeEntrada tipo="erro">{aviso}</AvisoDeEntrada>}

          <Button type="submit" variant="vidro-primaria" fullWidth size="lg" loading={salvando}>
            {t('primeiroAcesso.confirm')}
          </Button>
        </form>

        <button
          type="button"
          onClick={aoSair}
          className="mt-6 text-sm font-medium text-landing-muted transition-colors hover:text-white"
        >
          {t('primeiroAcesso.logout')}
        </button>

        <button
          type="button"
          onClick={abrirExclusao}
          disabled={carregandoPrevia}
          className="mt-3 block text-sm font-medium text-tint-rose transition-colors hover:text-white disabled:opacity-60"
        >
          {t('primeiroAcesso.deleteAccount')}
        </button>

        <ConfirmacaoDigitada
          open={Boolean(previa)}
          onClose={() => setPrevia(null)}
          titulo={t('configuracoes.excluirConta.title')}
          aviso={t(levaAgencia
            ? 'configuracoes.excluirConta.warningAgency'
            : 'configuracoes.excluirConta.warningAccount')}
          palavra={PALAVRA_EXCLUIR}
          rotuloConfirmar={t('configuracoes.excluirConta.confirm')}
          onConfirmar={excluirConta}
        />
      </div>
    </AuthLayout>
  )
}
