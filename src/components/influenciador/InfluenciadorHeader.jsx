import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, RotateCw, Trash2 } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Avatar from '../ui/Avatar.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import StatusIndicator from '../ui/StatusIndicator.jsx'
import { PlatformBadgeList } from '../icons/PlatformIcons.jsx'
import { formatFollowers } from '../../lib/format.js'

const STATUS_VARIANT = {
  active:     'success',
  monitoring: 'warning',
  risk:       'danger',
}
const STATUS_INDICATOR_COLOR = {
  active:     'success',
  monitoring: 'warning',
  risk:       'danger',
}

function formatDate(iso, locale) {
  // Sem data, `new Date(null)` cairia na epoch e exibiria 31/12/1969.
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function InfluenciadorHeader({
  influenciador,
  onRerun,
  onExcluir,
  reanalisando = false,
  podeReanalisar = true,
}) {
  const { t, i18n } = useTranslation()
  const inf = influenciador

  return (
    <header className={cn(
      'card-glass relative overflow-hidden rounded-3xl p-6',
      'lg:p-8'
    )}>
      {/* Glow decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(50% 50% at 0% 0%, rgba(124,58,237,0.18) 0%, transparent 65%)',
        }}
      />

      {/* Voltar */}
      <Link
        to="/app/influenciadores"
        className="relative inline-flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={13} />
        {t('influenciadores.title')}
      </Link>

      <div className="relative mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        {/* Identidade */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <Avatar name={inf.name} size="xl" />

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-label">{t('influenciador.header.deepAnalysis')}</span>
              {inf.lastAnalysisId && (
                <span className="text-[10px] font-mono text-text-muted">
                  · {t('influenciador.header.sessionId')} #{inf.lastAnalysisId}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl font-bold text-text-primary lg:text-4xl">
              {inf.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span className="font-medium text-text-secondary">{inf.handle}</span>
              <span className="text-text-muted">·</span>
              <PlatformBadgeList platforms={inf.platforms} size={14} />
              <span className="text-text-muted">·</span>
              <span>
                {formatFollowers(inf.followers)} {t('influenciador.header.followersLabel')}
              </span>
              <span className="text-text-muted">·</span>
              <Badge variant="neutral" uppercase={false}>{inf.niche}</Badge>
            </div>

            <div className="mt-1 flex items-center gap-3 text-xs">
              <StatusIndicator
                label={t(`influenciadores.status.${inf.status}`)}
                color={STATUS_INDICATOR_COLOR[inf.status]}
              />
              {formatDate(inf.lastAnalysis, i18n.language) && (
                <span className="text-text-muted">
                  {t('influenciador.header.lastAnalysis')}{' '}
                  {formatDate(inf.lastAnalysis, i18n.language)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Acoes */}
        <div className="flex items-center gap-2 lg:shrink-0">
          <Button
            variant="primary"
            leftIcon={RotateCw}
            loading={reanalisando}
            disabled={!podeReanalisar}
            onClick={onRerun}
          >
            {t('influenciador.header.rerun')}
          </Button>
          {/* Exclusão fica em `secondary`: é ação destrutiva e definitiva, não
              deve competir visualmente com a ação principal da tela. O aviso e
              a confirmação digitada moram no modal. */}
          <Button variant="secondary" leftIcon={Trash2} onClick={onExcluir}>
            {t('influenciador.excluir.trigger')}
          </Button>
        </div>
      </div>
    </header>
  )
}
