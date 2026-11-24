import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import PasswordInput from '../ui/PasswordInput.jsx'
import ForcaDaSenha from '../auth/ForcaDaSenha.jsx'
import AvisoDeEntrada from '../auth/AvisoDeEntrada.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { idDoCampo, useCampos } from '../../hooks/useCampos.js'
import { esqueciSenha, trocarSenha } from '../../services/auth.js'
import { mensagemDeAuth } from '../../lib/errosDeAuth.js'
import { codigoDoApp, errosDaApi, validarCodigoDoApp, validarSenha } from '../../lib/limites.js'

/**
 * Senha da conta. Quem tem senha troca aqui (e as outras sessões caem); quem
 * entra só pelo Google define por um link no e-mail — é o link que prova que a
 * pessoa é dona do endereço. Com 2FA ativo, a troca pede o código do app.
 */
export default function SegurancaCard() {
  const { t } = useTranslation()
  const { user, aplicarSessao } = useAuth()
  const comDoisFatores = !!user?.mfa_enabled
  const { campos, erros, set, sair, validarTudo, mostrarErros, limpar } = useCampos(
    { atual: '', nova: '', codigo: '' },
    {
      atual: (tt, c) => (c.atual ? null : tt('common.validation.required')),
      nova: (tt, c) => validarSenha(tt, c.nova, { email: user?.email, nome: user?.name }),
      codigo: (tt, c) => (comDoisFatores ? validarCodigoDoApp(tt, c.codigo) : null),
    }
  )
  const [estado, setEstado] = useState({ enviando: false, aviso: null })

  const trocar = async (e) => {
    e.preventDefault()
    if (!validarTudo()) return
    setEstado({ enviando: true, aviso: null })
    try {
      const codigo = comDoisFatores ? codigoDoApp(campos.codigo) : undefined
      aplicarSessao(await trocarSenha(campos.atual, campos.nova, codigo))
      limpar()
      setEstado({ enviando: false, aviso: { tipo: 'ok', texto: t('configuracoes.perfil.seguranca.changed') } })
    } catch (err) {
      const porCampo = errosDaApi(err, { current_password: 'atual', new_password: 'nova', totp_code: 'codigo' })
      if (Object.keys(porCampo).length) {
        mostrarErros(porCampo)
        setEstado({ enviando: false, aviso: null })
      } else {
        setEstado({ enviando: false, aviso: { tipo: 'erro', texto: mensagemDeAuth(t, err) } })
      }
    }
  }

  const definirPorEmail = async () => {
    setEstado({ enviando: true, aviso: null })
    try {
      await esqueciSenha(user.email)
      setEstado({
        enviando: false,
        aviso: { tipo: 'ok', texto: t('configuracoes.perfil.seguranca.sent', { email: user.email }) },
      })
    } catch (err) {
      setEstado({ enviando: false, aviso: { tipo: 'erro', texto: mensagemDeAuth(t, err) } })
    }
  }

  return (
    <Card className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('configuracoes.perfil.seguranca.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('configuracoes.perfil.seguranca.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('configuracoes.perfil.seguranca.subtitle')}</p>
      </div>

      {estado.aviso && <AvisoDeEntrada tipo={estado.aviso.tipo}>{estado.aviso.texto}</AvisoDeEntrada>}

      {user?.has_password ? (
        <form onSubmit={trocar} noValidate className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <PasswordInput
              id={idDoCampo('atual')}
              label={t('configuracoes.perfil.seguranca.current')}
              autoComplete="current-password"
              value={campos.atual}
              onChange={(e) => set('atual', e.target.value)}
              onBlur={() => sair('atual')}
              error={erros.atual}
            />
            <div>
              <PasswordInput
                id={idDoCampo('nova')}
                label={t('configuracoes.perfil.seguranca.new')}
                autoComplete="new-password"
                value={campos.nova}
                onChange={(e) => set('nova', e.target.value)}
                onBlur={() => sair('nova')}
                error={erros.nova}
              />
              <ForcaDaSenha senha={campos.nova} entradas={[user.email, user.name]} />
            </div>
            {comDoisFatores && (
              <Input
                id={idDoCampo('codigo')}
                label={t('auth.mfa.codeLabel')}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={7}
                value={campos.codigo}
                onChange={(e) => set('codigo', e.target.value)}
                onBlur={() => sair('codigo')}
                error={erros.codigo}
              />
            )}
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={estado.enviando}>
              {t('configuracoes.perfil.seguranca.change')}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm text-text-secondary">{t('configuracoes.perfil.seguranca.noPassword')}</p>
          <Button type="button" variant="secondary" loading={estado.enviando} onClick={definirPorEmail}>
            {t('configuracoes.perfil.seguranca.define')}
          </Button>
        </div>
      )}
    </Card>
  )
}
