import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react'

import AuthLayout from '../layouts/AuthLayout.jsx'
import Button from '../components/ui/Button.jsx'
import { PLATFORM_META } from '../components/icons/PlatformIcons.jsx'
import { lerConvite, urlDeAutorizacaoDoConvite } from '../services/integrations.js'

/**
 * Página que o criador abre pelo link que a agência mandou.
 *
 * Pública: ele não tem conta no Lumina. Diz quem está pedindo, para qual
 * perfil e o que será lido, e leva à tela de consentimento da própria rede —
 * quem autoriza é a dona da conta, no aparelho dela.
 */
export function ConectarConta() {
  const { t } = useTranslation()
  const { token } = useParams()
  const [convite, setConvite] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    let ativo = true
    lerConvite(token)
      .then((dados) => { if (ativo) setConvite(dados) })
      .catch((err) => { if (ativo) setErro(err.code || 'convite_invalido') })
    return () => { ativo = false }
  }, [token])

  const rede = convite ? (PLATFORM_META[convite.platform]?.name || convite.platform) : ''

  return (
    <AuthLayout>
      <div className="space-y-5 text-center">
        {erro ? (
          <>
            <XCircle className="mx-auto text-tint-rose" size={40} aria-hidden />
            <h1 className="font-display text-2xl font-bold">{t(`conectarConta.erros.${erro}`, {
              defaultValue: t('conectarConta.erros.convite_invalido'),
            })}</h1>
            <p className="text-sm text-text-secondary">{t('conectarConta.pecaOutro')}</p>
          </>
        ) : !convite ? (
          <div role="status" aria-label={t('common.a11y.loading')}
               className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        ) : convite.connected ? (
          <>
            <CheckCircle2 className="mx-auto text-accent" size={40} aria-hidden />
            <h1 className="font-display text-2xl font-bold">{t('conectarConta.jaConectada', { rede })}</h1>
            <p className="text-sm text-text-secondary">{t('conectarConta.podeFechar')}</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold">
              {t('conectarConta.titulo', { rede })}
            </h1>
            <p className="text-sm text-text-secondary">
              {t('conectarConta.pedido', {
                agencia: convite.agency || t('conectarConta.umaAgencia'),
                criador: convite.influencer,
                rede,
              })}
            </p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left text-sm">
              <p className="mb-2 flex items-center gap-2 font-semibold">
                <ShieldCheck size={16} aria-hidden /> {t('conectarConta.seraLido')}
              </p>
              <ul className="list-disc space-y-1 pl-5 text-text-secondary">
                <li>{t('conectarConta.itens.perfil')}</li>
                <li>{t('conectarConta.itens.publicacoes')}</li>
                <li>{t('conectarConta.itens.comentarios')}</li>
              </ul>
              <p className="mt-3 text-xs text-text-muted">{t('conectarConta.semSenha', { rede })}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => { window.location.href = urlDeAutorizacaoDoConvite(token) }}
            >
              {t('conectarConta.botao', { rede })}
            </Button>
            <p className="text-xs text-text-muted">
              {t('conectarConta.validade', {
                data: new Date(convite.expires_at).toLocaleDateString(),
              })}
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  )
}

/** Volta da rede depois do link do criador: deu certo, recusou ou falhou. */
export function ConectarConcluido() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const erro = params.get('erro')
  const plataforma = params.get('plataforma')
  const rede = PLATFORM_META[plataforma]?.name || plataforma || ''

  let titulo = t('conectarConta.concluido.ok', { rede })
  if (erro === 'ja_conectada') titulo = t('conectarConta.jaConectada', { rede })
  else if (erro === 'access_denied') titulo = t('conectarConta.concluido.recusado')
  else if (erro) titulo = t('conectarConta.concluido.falhou')

  const deuCerto = !erro || erro === 'ja_conectada'
  return (
    <AuthLayout>
      <div className="space-y-4 text-center">
        {deuCerto
          ? <CheckCircle2 className="mx-auto text-accent" size={40} aria-hidden />
          : <XCircle className="mx-auto text-tint-rose" size={40} aria-hidden />}
        <h1 className="font-display text-2xl font-bold">{titulo}</h1>
        <p className="text-sm text-text-secondary">
          {deuCerto ? t('conectarConta.podeFechar') : t('conectarConta.concluido.tenteDeNovo')}
        </p>
        <Link to="/" className="text-sm font-semibold text-accent hover:text-accent-strong">
          Lumina AI
        </Link>
      </div>
    </AuthLayout>
  )
}

export default ConectarConta
