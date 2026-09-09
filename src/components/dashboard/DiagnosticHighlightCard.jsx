import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Play, ArrowRight, Sparkles } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel } from '../ui/Card.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'

/**
 * A miniatura do post que foi analisado.
 *
 * Era inteiramente inventada: dois degradês radiais, um botão de play que não
 * tocava nada e a duração "00:42" escrita no código, igual para todo criador.
 * O back-end já mandava `thumbnail_url` — a miniatura verdadeira do vídeo — e
 * o adaptador do front a descartava.
 *
 * Num produto que existe para auditar o que foi publicado, e cuja página
 * pública promete que todo número diz de onde veio, a única imagem da tela ser
 * ficção é o defeito mais caro que havia aqui. A duração saiu junto pelo mesmo
 * motivo: não é medida em lugar nenhum.
 *
 * O degradê sobrevive como fundo de quem não tem miniatura — uma conta sem
 * vídeo, um post de imagem — e aí ele é o que sempre deveria ter sido: um
 * espaço vazio decente, não um vídeo falso. Por isso o play só aparece quando
 * há vídeo de verdade atrás.
 */
const FUNDO_SEM_MINIATURA = [
  'radial-gradient(circle at 30% 20%, rgba(124,58,237,0.28) 0%, transparent 55%)',
  'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
].join(', ')

function ReelThumbnail({ src, alt }) {
  // Miniatura de plataforma expira, muda de host e às vezes some. O estado
  // separa "não temos endereço" de "o endereço não respondeu" — nos dois casos
  // o fim é o mesmo, mas sem ele a imagem quebrada some e deixa um retângulo
  // preto, que é pior do que o espaço vazio desenhado de propósito.
  const [falhou, setFalhou] = useState(false)
  const mostrarImagem = Boolean(src) && !falhou

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-superficie',
        'border border-primary/15',
        'aspect-[16/9]'
      )}
      // O fundo fica sempre: é ele que aparece se a imagem não vier.
      style={{ background: FUNDO_SEM_MINIATURA }}
    >
      {mostrarImagem ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFalhou(true)}
        />
      ) : null}

      {/* O play só aparece sobre vídeo de verdade. Sobre o fundo vazio ele
          voltaria a prometer um vídeo que não existe, que é o defeito que este
          componente acabou de deixar de ter. */}
      {mostrarImagem ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'inline-flex h-12 w-12 items-center justify-center rounded-full',
              'bg-black/45 text-white backdrop-blur-md ring-1 ring-white/25'
            )}
          >
            <Play size={20} className="ml-0.5 fill-current" />
          </span>
        </div>
      ) : null}
    </div>
  )
}

export default function DiagnosticHighlightCard({ data, loading = false }) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card className="flex flex-col gap-5">
        <CardLabel>{t('dashboard.diagnostic.label')}</CardLabel>
        <Skeleton className="h-12" rounded="rounded-xl" />
        <Skeleton className="h-40" rounded="rounded-2xl" />
        <Skeleton className="h-16" rounded="rounded-xl" />
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardLabel>{t('dashboard.diagnostic.label')}</CardLabel>
        <EmptyState icon={Sparkles} title={t('dashboard.diagnostic.empty')} />
      </Card>
    )
  }

  const name = data.influencerName

  return (
    <Card className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <CardLabel>{t('dashboard.diagnostic.label')}</CardLabel>
        <div className="mt-3 flex items-center gap-3">
          <Avatar name={name} size="md" />
          <div className="min-w-0">
            <p className="tipo-bloco truncate text-text-primary">{name}</p>
            <p className="numerico truncate tipo-apoio text-text-muted">
              {t('dashboard.diagnostic.analysisId')}: #{data.analysisId}
            </p>
          </div>
        </div>
      </div>

      {/* Reel thumbnail */}
      <ReelThumbnail
        src={data.thumbnailUrl}
        alt={t('dashboard.diagnostic.thumbnailAlt', { nome: name })}
      />

      {/* IA Transcription */}
      <div>
        <CardLabel>{t('dashboard.diagnostic.transcriptLabel')}</CardLabel>
        {data.transcript ? (
          <p className="tipo-corpo mt-2 line-clamp-3 text-text-secondary">
            {data.transcript}
          </p>
        ) : (
          /* Sem transcrição não se desenha um travessão solto: quem lê fica sem
             saber se o texto sumiu ou se não existe. A frase diz qual dos
             dois. */
          <p className="tipo-corpo mt-2 text-text-muted">
            {t('dashboard.diagnostic.transcriptEmpty')}
          </p>
        )}
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-2">
        {data.pills.map((pill) => (
          <Badge key={pill.key} variant={pill.variant} size="sm" uppercase={false}>
            {t(`dashboard.diagnostic.pills.${pill.key}`, {
              valor: pill.valuePct == null ? '—' : `${pill.valuePct}%`,
            })}
          </Badge>
        ))}
      </div>

      {/* Brand coherence */}
      <div>
        {data.brandCoherence == null ? (
          /* Barra em zero afirma que mediu e deu zero. Não mediu. */
          <div className="flex items-baseline justify-between gap-3">
            <CardLabel>{t('dashboard.diagnostic.coherenceLabel')}</CardLabel>
            <span className="tipo-apoio text-text-muted">
              {t('dashboard.diagnostic.coherenceEmpty')}
            </span>
          </div>
        ) : (
          <ProgressBar
            label={t('dashboard.diagnostic.coherenceLabel')}
            value={data.brandCoherence}
            showValue
            variant="primary"
            size="md"
          />
        )}
      </div>

      {/* Link de detalhe */}
      <Link
        to={`/app/influenciadores/${data.influencerId}`}
        className={cn(
          'group inline-flex items-center justify-center gap-1.5 rounded-xl py-2 px-3',
          'text-sm font-semibold text-accent transition-colors',
          'hover:bg-primary-600/10 hover:text-accent-strong'
        )}
      >
        {t('dashboard.diagnostic.viewAnalysis')}
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Card>
  )
}
