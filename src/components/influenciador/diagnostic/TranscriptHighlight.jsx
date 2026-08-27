import { useTranslation } from 'react-i18next'
import { Download, FileText } from 'lucide-react'

import Card, { CardLabel, CardTitle } from '../../ui/Card.jsx'
import Button from '../../ui/Button.jsx'
import EmptyState from '../../ui/EmptyState.jsx'
import Skeleton from '../../ui/Skeleton.jsx'
import { parseApiDate } from '../../../lib/format.js'

const HIGHLIGHT = 'rounded-sm bg-primary-600/25 px-1 font-semibold text-accent-strong'

/**
 * Grifa as frases-chave dentro da transcrição. Case-insensitive.
 *
 * As frases vêm da própria análise (`key_phrases`), não de uma lista fixa: o
 * grifo mostra o que o modelo destacou, não o que a interface achou bonito.
 */
function comGrifos(texto, frases) {
  const termos = (frases || []).filter((f) => typeof f === 'string' && f.trim())
  if (!termos.length) return texto

  const escapado = termos
    .map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  const partes = texto.split(new RegExp(`(${escapado})`, 'gi'))

  return partes.map((parte, i) =>
    termos.some((f) => f.toLowerCase() === parte.toLowerCase())
      ? <mark key={i} className={HIGHLIGHT}>{parte}</mark>
      : parte
  )
}

function formatarData(iso, locale) {
  if (!iso) return null
  try {
    return parseApiDate(iso).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch {
    return null
  }
}

/**
 * Transcrição do áudio analisado.
 *
 * O modelo devolve texto corrido, sem marcação de tempo nem classificação de
 * tom. A versão anterior deste componente desenhava segmentos cronometrados e
 * coloridos por tom — uma estrutura que nenhum dado sustenta, e que por isso
 * nunca chegou a receber dado nenhum: era chamado sem props e mostrava estado
 * vazio para 111 análises que tinham transcrição no banco.
 *
 * Agora mostra o que existe: o texto, quando foi analisado, e as frases-chave
 * que o próprio modelo destacou.
 */
export default function TranscriptHighlight({ transcript, loading = false, nomeDoCriador }) {
  const { t, i18n } = useTranslation()

  const texto = transcript?.text || ''
  const analisadaEm = formatarData(transcript?.analyzed_at, i18n.language)

  /** Salva o texto que já está na tela — formatação, não segunda fonte. */
  const exportar = () => {
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' })
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
          <p className="mt-1 text-sm text-text-secondary">
            {analisadaEm
              ? t('influenciador.transcript.analyzedAt', { data: analisadaEm })
              : t('influenciador.transcript.subtitle')}
          </p>
        </div>
        <Button
          variant="outlined"
          size="sm"
          leftIcon={Download}
          disabled={!texto}
          onClick={exportar}
        >
          {t('influenciador.transcript.export')}
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-40" rounded="rounded-xl" />
      ) : texto ? (
        <blockquote className="border-l-2 border-primary-500/40 pl-4 text-sm leading-relaxed text-text-secondary">
          {comGrifos(texto, transcript.key_phrases)}
        </blockquote>
      ) : (
        <EmptyState
          icon={FileText}
          title={t('influenciador.transcript.empty')}
          description={t('influenciador.transcript.emptyHint')}
        />
      )}
    </Card>
  )
}
