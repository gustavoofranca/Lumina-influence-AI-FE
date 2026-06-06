import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Play, ArrowRight } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel } from '../ui/Card.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { findInfluenciador } from '../../mocks/influenciadores.js'
import { HIGHLIGHTED_DIAGNOSIS } from '../../mocks/dashboard.js'

function ReelThumbnail() {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl',
        'border border-primary/15 bg-neutral-900',
        'aspect-[16/9]'
      )}
      style={{
        background: [
          'radial-gradient(circle at 30% 20%, rgba(124,58,237,0.45) 0%, transparent 55%)',
          'radial-gradient(circle at 80% 70%, rgba(244,63,94,0.35) 0%, transparent 50%)',
          'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        ].join(', '),
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            'inline-flex h-12 w-12 items-center justify-center rounded-full',
            'bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20'
          )}
        >
          <Play size={20} className="ml-0.5 fill-current" />
        </span>
      </div>
      <div className="absolute bottom-2 left-2 rounded-md bg-neutral-950/70 px-2 py-0.5 text-[10px] font-medium text-neutral-200 backdrop-blur">
        00:42
      </div>
    </div>
  )
}

export default function DiagnosticHighlightCard({ data: dataProp }) {
  const { t } = useTranslation()
  const data = dataProp || HIGHLIGHTED_DIAGNOSIS
  const mockInf = findInfluenciador(data.influencerId)
  const name = data.influencerName || mockInf?.name

  return (
    <Card glass className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <CardLabel>{t('dashboard.diagnostic.label')}</CardLabel>
        <div className="mt-3 flex items-center gap-3">
          <Avatar name={name} size="md" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-neutral-100">{name}</p>
            <p className="truncate text-xs text-text-muted">
              {t('dashboard.diagnostic.analysisId')}: #{data.analysisId}
            </p>
          </div>
        </div>
      </div>

      {/* Reel thumbnail */}
      <ReelThumbnail />

      {/* IA Transcription */}
      <div>
        <CardLabel>{t('dashboard.diagnostic.transcriptLabel')}</CardLabel>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-secondary">
          {data.transcript}
        </p>
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-2">
        {data.pills.map((pill) => (
          <Badge key={pill.key} variant={pill.variant} size="sm" uppercase={false}>
            {t(`dashboard.diagnostic.pills.${pill.key}`)}
          </Badge>
        ))}
      </div>

      {/* Brand coherence */}
      <div>
        <ProgressBar
          label={t('dashboard.diagnostic.coherenceLabel')}
          value={data.brandCoherence}
          showValue
          variant="primary"
          size="md"
        />
      </div>

      {/* Link de detalhe */}
      <Link
        to={`/app/influenciadores/${data.influencerId}`}
        className={cn(
          'group inline-flex items-center justify-center gap-1.5 rounded-xl py-2 px-3',
          'text-sm font-semibold text-primary-300 transition-colors',
          'hover:bg-primary-600/10 hover:text-primary-200'
        )}
      >
        {t('dashboard.diagnostic.viewAnalysis')}
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Card>
  )
}
