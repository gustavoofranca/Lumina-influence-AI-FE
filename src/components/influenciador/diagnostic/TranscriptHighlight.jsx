import { useTranslation } from 'react-i18next'
import { Download, FileText } from 'lucide-react'

import { cn } from '../../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../../ui/Card.jsx'
import Button from '../../ui/Button.jsx'
import EmptyState from '../../ui/EmptyState.jsx'
import Skeleton from '../../ui/Skeleton.jsx'

const TONE_STYLES = {
  primary:    { tag: 'bg-primary-600/20 text-primary-200 ring-primary-500/30',   bar: 'bg-primary-500',   highlight: 'bg-primary-600/25 text-primary-100' },
  secondary:  { tag: 'bg-secondary-500/20 text-secondary-200 ring-secondary-500/30', bar: 'bg-secondary-500', highlight: 'bg-secondary-500/25 text-secondary-100' },
  success:    { tag: 'bg-emerald-500/20 text-emerald-200 ring-emerald-500/30',   bar: 'bg-emerald-500',   highlight: 'bg-emerald-500/25 text-emerald-100' },
  tertiary:   { tag: 'bg-tertiary-500/20 text-tertiary-200 ring-tertiary-500/30', bar: 'bg-tertiary-500', highlight: 'bg-tertiary-500/25 text-tertiary-100' },
}

/**
 * Aplica grifos coloridos sobre a string `text` para todas as substrings
 * em `highlights`. Case-insensitive, primeira ocorrência de cada termo.
 */
function renderTextWithHighlights(text, highlights, highlightClass) {
  if (!highlights?.length) return text

  // Constroi regex unica com escape de caracteres especiais
  const escaped = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) => {
    const isHighlight = highlights.some((h) => h.toLowerCase() === part.toLowerCase())
    if (!isHighlight) return part
    return (
      <mark key={i} className={cn('rounded-sm px-1 font-semibold', highlightClass)}>
        {part}
      </mark>
    )
  })
}

function Segment({ segment, t }) {
  const style = TONE_STYLES[segment.tone] || TONE_STYLES.primary
  return (
    <li className="relative flex gap-4 pl-4">
      <span className={cn('absolute left-0 top-2 h-[calc(100%-1rem)] w-px', style.bar, 'opacity-60')} />
      <span className={cn('absolute left-[-3px] top-2 h-1.5 w-1.5 rounded-full', style.bar)} />

      <div className="flex-1">
        <div className="mb-2 flex items-center gap-2">
          <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ring-1 ring-inset', style.tag)}>
            [{segment.time}]
          </span>
          <span className="text-[10px] font-bold uppercase tracking-label text-text-muted">
            {t(`influenciador.transcript.segments.${segment.segment}`)}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">
          {renderTextWithHighlights(segment.text, segment.highlights, style.highlight)}
        </p>
      </div>
    </li>
  )
}

export default function TranscriptHighlight({ segments, loading = false, nomeDoCriador }) {
  const { t } = useTranslation()

  /**
   * Exporta o texto que já está na tela, sem passar pela API.
   * A transcrição vem do payload da análise; salvar em .txt é formatação, não
   * uma segunda fonte de verdade.
   */
  const exportar = () => {
    const conteudo = (segments || [])
      .map((seg) => `[${seg.time}] ${seg.text}`)
      .join('\n\n')
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const base = (nomeDoCriador || 'transcricao').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    link.href = url
    link.download = `transcricao-${base}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card glass className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardLabel>{t('influenciador.transcript.title')}</CardLabel>
          <CardTitle className="mt-1.5">{t('influenciador.transcript.title')}</CardTitle>
          <p className="mt-1 text-sm text-text-secondary">{t('influenciador.transcript.subtitle')}</p>
        </div>
        <Button
          variant="outlined"
          size="sm"
          leftIcon={Download}
          disabled={!segments?.length}
          onClick={exportar}
        >
          {t('influenciador.transcript.export')}
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-40" rounded="rounded-xl" />
      ) : segments?.length ? (
        <ul className="space-y-5">
          {segments.map((seg, i) => (
            <Segment key={i} segment={seg} t={t} />
          ))}
        </ul>
      ) : (
        <EmptyState icon={FileText} title={t('influenciador.transcript.empty')} />
      )}
    </Card>
  )
}
