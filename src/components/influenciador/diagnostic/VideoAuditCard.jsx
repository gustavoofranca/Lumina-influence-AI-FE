import { useTranslation } from 'react-i18next'
import { Play, ScanLine } from 'lucide-react'

import { cn } from '../../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../../ui/Card.jsx'

/**
 * VideoAuditCard — thumbnail decorativa de reel + overlay de "scan" da IA
 * para sugerir analise frame-a-frame em andamento.
 */
function ReelThumbnail({ duration }) {
  return (
    <div
      className={cn(
        'relative aspect-[9/12] overflow-hidden rounded-xl',
        'border border-primary/15 bg-neutral-900'
      )}
      style={{
        background: [
          'radial-gradient(circle at 35% 25%, rgba(124,58,237,0.5) 0%, transparent 60%)',
          'radial-gradient(circle at 75% 80%, rgba(244,63,94,0.3) 0%, transparent 50%)',
          'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        ].join(', '),
      }}
    >
      {/* Linhas de scan animadas (decorativo) */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(124,58,237,0.4) 0px, rgba(124,58,237,0.4) 1px, transparent 1px, transparent 6px)',
        }}
      />

      {/* Play button central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          'inline-flex h-14 w-14 items-center justify-center rounded-full',
          'bg-white/15 text-white backdrop-blur-md ring-1 ring-white/20',
          'shadow-glow-soft'
        )}>
          <Play size={22} className="ml-0.5 fill-current" />
        </span>
      </div>

      {/* Marker IA */}
      <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary-600/30 px-2 py-1 text-[10px] font-bold text-primary-200 ring-1 ring-inset ring-primary-500/40 backdrop-blur">
        <ScanLine size={10} className="animate-pulse" />
        AI SCAN
      </div>

      {/* Duracao */}
      <div className="absolute bottom-2 right-2 rounded-md bg-neutral-950/70 px-2 py-0.5 text-[10px] font-medium text-neutral-200 backdrop-blur tabular-nums">
        {duration}
      </div>
    </div>
  )
}

export default function VideoAuditCard() {
  const { t } = useTranslation()

  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('influenciador.videoAudit.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('influenciador.videoAudit.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('influenciador.videoAudit.subtitle')}</p>
      </div>

      <ReelThumbnail duration={t('influenciador.videoAudit.duration')} />
    </Card>
  )
}
