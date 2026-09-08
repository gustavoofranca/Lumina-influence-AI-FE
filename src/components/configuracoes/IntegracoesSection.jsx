import { useTranslation } from 'react-i18next'
import { Plug } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import StatusIndicator from '../ui/StatusIndicator.jsx'
import ApiErrorBanner from '../ui/ApiErrorBanner.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import { PLATFORM_META } from '../icons/PlatformIcons.jsx'
import { formatFollowers } from '../../lib/format.js'
import { useApi } from '../../hooks/useApi.js'
import { listPlatformConnections } from '../../services/agency.js'

/**
 * Plataformas conectadas.
 *
 * A conexão OAuth pertence ao influenciador, não à agência: cada SocialAccount
 * é de um criador. Esta tela resume o que já está conectado por plataforma;
 * conectar acontece na tela do influenciador, onde existe esse contexto.
 */

const PLATFORMS = Object.keys(PLATFORM_META)

function formatSync(iso, locale) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

function Stat({ label, children }) {
  return (
    <div>
      <span className="block text-label">
        {label}
      </span>
      <span className="mt-1 block font-medium text-text-primary">{children}</span>
    </div>
  )
}

function PlataformaCard({ platform, dados, t, locale }) {
  const meta = PLATFORM_META[platform]
  const Icon = meta.Icon
  const conectada = Boolean(dados)
  const sync = formatSync(dados?.lastSync, locale)

  return (
    <div className={cn(
      'flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-200',
      conectada
        ? 'border-primary/15 bg-primary-600/5 hover:border-primary/30'
        : 'border-hairline/60 bg-bg-base/40'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn(
            'inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset',
            conectada
              ? 'bg-bg-surface text-text-primary ring-primary/30'
              : 'bg-bg-surface/60 text-text-muted ring-hairline'
          )}>
            <Icon size={22} />
          </span>
          <div>
            <h3 className="tipo-bloco text-text-primary">{meta.name}</h3>
            {conectada && (
              <p className="text-xs text-text-muted">
                {t('configuracoes.integracoes.accounts', { count: dados.accounts })}
              </p>
            )}
          </div>
        </div>
        {conectada
          ? <StatusIndicator label={t('configuracoes.integracoes.connected')} color="success" />
          : <Badge variant="neutral" uppercase={false}>{t('configuracoes.integracoes.disconnected')}</Badge>
        }
      </div>

      {conectada && (
        <div className="grid grid-cols-2 gap-3 border-t border-hairline pt-4 text-xs">
          <Stat label={t('configuracoes.integracoes.followers')}>
            {formatFollowers(dados.followers)}
          </Stat>
          <Stat label={t('configuracoes.integracoes.lastSync')}>
            {/* Sem sincronização registrada, dizer isso — não inventar data. */}
            {sync || t('configuracoes.integracoes.neverSynced')}
          </Stat>
        </div>
      )}
    </div>
  )
}

export default function IntegracoesSection() {
  const { t, i18n } = useTranslation()
  const { data: conexoes, loading, error, refetch} = useApi(listPlatformConnections, [])

  const porPlataforma = new Map((conexoes || []).map((c) => [c.platform, c]))

  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('configuracoes.integracoes.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('configuracoes.integracoes.title')}</CardTitle>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          {t('configuracoes.integracoes.subtitle')}
        </p>
      </div>

      <ApiErrorBanner error={error} onRetry={refetch} />

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {PLATFORMS.map((p) => (
            <Skeleton key={p} className="h-44" rounded="rounded-2xl" />
          ))}
        </div>
      ) : !conexoes?.length ? (
        <EmptyState
          compact
          icon={Plug}
          title={t('configuracoes.integracoes.empty')}
          description={t('configuracoes.integracoes.emptyHint')}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {PLATFORMS.map((p) => (
            <PlataformaCard
              key={p}
              platform={p}
              dados={porPlataforma.get(p)}
              t={t}
              locale={i18n.language}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
