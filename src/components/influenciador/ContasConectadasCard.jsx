import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link2, Unlink, Plug } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import DesconectarModal from './DesconectarModal.jsx'
import { PLATFORM_META } from '../icons/PlatformIcons.jsx'
import { formatFollowers } from '../../lib/format.js'
import { getConnectUrl, disconnectAccount } from '../../services/integrations.js'

const PLATFORMS = Object.keys(PLATFORM_META)

function formatSync(iso, locale) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: 'short',
    })
  } catch {
    return null
  }
}

/**
 * Contas conectadas de um criador.
 *
 * Três estados por plataforma, e a distinção entre os dois últimos importa:
 *  - vinculada       → handle, seguidores e último sync, com opção de desvincular
 *  - não vinculada   → botão de conectar
 *  - sem credencial  → a plataforma não está configurada *neste ambiente*, o que
 *                      é diferente de "ninguém conectou ainda". Dizer "conectar"
 *                      ali levaria o usuário a um erro que não é dele.
 */
export default function ContasConectadasCard({ influenciador, onChange }) {
  const { t, i18n } = useTranslation()
  const [ocupada, setOcupada] = useState(null)
  const [indisponiveis, setIndisponiveis] = useState([])
  const [erro, setErro] = useState(null)

  const vinculadas = new Map(
    (influenciador?.socialAccounts || []).map((sa) => [sa.platform, sa])
  )

  const conectar = async (platform) => {
    setErro(null)
    setOcupada(platform)
    try {
      const url = await getConnectUrl(influenciador.id, platform)
      window.location.href = url
    } catch (err) {
      if (err.code === 'platform_not_configured') {
        setIndisponiveis((atual) => [...atual, platform])
      } else {
        setErro(err.message)
      }
      setOcupada(null)
    }
  }

  // Desconectar deixou de ser um clique direto: a mesma ação pode preservar ou
  // apagar o histórico coletado, e essa escolha precisa ser feita por quem
  // clica, não por um padrão invisível.
  const [aDesconectar, setADesconectar] = useState(null)

  const desconectar = async (purgar) => {
    const alvo = aDesconectar
    if (!alvo) return
    setErro(null)
    setOcupada(alvo.platform)
    try {
      const r = await disconnectAccount(alvo.platform, alvo.id, { purgarColetado: purgar })
      setADesconectar(null)
      await onChange?.(
        r?.posts_deleted
          ? t('influenciador.desconectar.donePurged', { count: r.posts_deleted })
          : t('influenciador.desconectar.done')
      )
    } catch (err) {
      // O erro fica no cartão, e o modal fecha: reabrir com a caixa remarcada
      // faria a segunda tentativa herdar uma escolha que não foi refeita.
      setADesconectar(null)
      setErro(err.message)
    } finally {
      setOcupada(null)
    }
  }

  return (
    <>
    <DesconectarModal
      open={Boolean(aDesconectar)}
      onClose={() => setADesconectar(null)}
      conta={aDesconectar}
      ocupada={Boolean(ocupada)}
      onConfirmar={desconectar}
    />
    <Card glass className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('influenciador.conexoes.label')}</CardLabel>
        <CardTitle className="mt-1.5">{t('influenciador.conexoes.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">
          {t('influenciador.conexoes.subtitle')}
        </p>
      </div>

      {erro && (
        <p className="rounded-lg bg-tertiary-500/10 px-3 py-2 text-xs text-tint-rose">
          {erro}
        </p>
      )}

      <ul className="flex flex-col divide-y divide-hairline">
        {PLATFORMS.map((platform) => {
          const meta = PLATFORM_META[platform]
          const Icon = meta.Icon
          const conta = vinculadas.get(platform)
          const indisponivel = indisponiveis.includes(platform)
          const sync = formatSync(conta?.lastSync, i18n.language)

          return (
            <li key={platform} className="flex items-center gap-3 py-3">
              <span className={cn('shrink-0', meta.color)}>
                <Icon size={20} />
              </span>

              <div className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-text-primary">
                  {meta.name}
                </span>
                <span className="block truncate text-xs text-text-secondary">
                  {conta ? (
                    <>
                      @{conta.handle} · {formatFollowers(conta.followers)}
                      {sync ? ` · ${t('influenciador.conexoes.lastSync', { data: sync })}` : ''}
                      {conta.connected ? '' : ` · ${t('influenciador.conexoes.notCollecting')}`}
                    </>
                  ) : indisponivel ? (
                    t('influenciador.conexoes.unavailable')
                  ) : (
                    t('influenciador.conexoes.notLinked')
                  )}
                </span>
              </div>

              {conta?.connected ? (
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    leftIcon={Unlink}
                    loading={ocupada === platform}
                    onClick={() => setADesconectar({ platform, id: conta.id })}
                  >
                    {t('influenciador.conexoes.disconnect')}
                  </Button>
                </div>
              ) : indisponivel ? (
                <span className="shrink-0 text-text-muted">
                  <Plug size={16} />
                </span>
              ) : (
                <Button
                  variant="outlined"
                  size="sm"
                  leftIcon={Link2}
                  loading={ocupada === platform}
                  onClick={() => conectar(platform)}
                  className="shrink-0"
                >
                  {t('influenciador.conexoes.connect')}
                </Button>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
    </>
  )
}
