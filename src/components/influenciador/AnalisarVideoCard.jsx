import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Clapperboard, Upload, FileVideo, X } from 'lucide-react'

import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import { analisarVideoEnviado } from '../../services/influencers.js'

// Espelha `MAX_BYTES` de `src/integrations/media.py`. O back-end recusa acima
// disso de qualquer forma; a checagem aqui existe para não gastar minutos
// subindo um arquivo que vai ser recusado no fim.
const MAX_BYTES = 50 * 1024 * 1024

const TIPOS_ACEITOS = 'video/mp4,video/quicktime,video/webm,video/x-m4v'

function formatarTamanho(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/**
 * Envio de um vídeo para análise multimodal.
 *
 * É o único lugar do produto que recebe arquivo. A análise é síncrona e cara —
 * dezenas de segundos, mais o tempo de subir a mídia —, então o cartão precisa
 * dizer que está trabalhando: sem isso, o usuário clica de novo achando que
 * falhou, e cada clique consome uma das 20 requisições diárias do free tier.
 */
export default function AnalisarVideoCard({ influenciador, campanhas = [], onAnalise }) {
  const { t } = useTranslation()
  const inputRef = useRef(null)

  const [arquivo, setArquivo] = useState(null)
  const [legenda, setLegenda] = useState('')
  const [campanhaId, setCampanhaId] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [resultado, setResultado] = useState(null)

  const escolher = (e) => {
    const f = e.target.files?.[0]
    setErro(null)
    setResultado(null)
    if (!f) return setArquivo(null)
    if (f.size > MAX_BYTES) {
      setErro(t('influenciador.video.tooLarge', { max: 50, size: formatarTamanho(f.size) }))
      setArquivo(null)
      return
    }
    setArquivo(f)
  }

  const limpar = () => {
    setArquivo(null)
    setErro(null)
    setResultado(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const enviar = async () => {
    if (!arquivo) return
    setEnviando(true)
    setErro(null)
    setResultado(null)
    try {
      const r = await analisarVideoEnviado(influenciador.id, {
        arquivo,
        legenda,
        campaignId: campanhaId || undefined,
      })
      setResultado(r.analysis)
      await onAnalise?.(r)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <CardLabel>{t('influenciador.video.label')}</CardLabel>
        <CardTitle className="mt-1.5">{t('influenciador.video.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">
          {t('influenciador.video.subtitle')}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={TIPOS_ACEITOS}
        onChange={escolher}
        className="hidden"
        id={`video-${influenciador.id}`}
      />

      {!arquivo ? (
        <label
          htmlFor={`video-${influenciador.id}`}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-hairline px-4 py-8 text-center transition hover:border-primary-500/60"
        >
          <Upload size={22} className="text-text-muted" />
          <span className="text-sm font-medium text-text-primary">
            {t('influenciador.video.choose')}
          </span>
          <span className="text-xs text-text-muted">
            {t('influenciador.video.hint')}
          </span>
        </label>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-hairline px-3 py-2.5">
          <FileVideo size={18} className="shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-text-primary">
              {arquivo.name}
            </span>
            <span className="text-xs text-text-muted">{formatarTamanho(arquivo.size)}</span>
          </div>
          <button
            type="button"
            onClick={limpar}
            disabled={enviando}
            aria-label={t('influenciador.video.remove')}
            className="shrink-0 rounded-lg p-1 text-text-muted transition hover:text-text-primary"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <Input
        label={t('influenciador.video.caption')}
        value={legenda}
        onChange={(e) => setLegenda(e.target.value)}
        placeholder={t('influenciador.video.captionPlaceholder')}
        disabled={enviando}
      />

      {campanhas.length > 0 && (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-text-secondary">
            {t('influenciador.video.campaign')}
          </span>
          <select
            value={campanhaId}
            onChange={(e) => setCampanhaId(e.target.value)}
            disabled={enviando}
            className="rounded-lg border border-hairline bg-bg-elevated px-3 py-2 text-sm text-text-primary"
          >
            <option value="">{t('influenciador.video.noCampaign')}</option>
            {campanhas.map((c) => (
              <option key={c.id} value={c.id}>{c.title || c.name}</option>
            ))}
          </select>
          {/* Sem campanha o vídeo é analisado e fica de fora do relatório —
              dizer isso aqui evita a descoberta depois de esperar a análise. */}
          <span className="text-[11px] text-text-muted">
            {t('influenciador.video.campaignHint')}
          </span>
        </label>
      )}

      {erro && (
        <p className="rounded-lg bg-tertiary-500/10 px-3 py-2 text-xs text-tint-rose">
          {erro}
        </p>
      )}

      <Button
        variant="primary"
        leftIcon={Clapperboard}
        loading={enviando}
        disabled={!arquivo || enviando}
        onClick={enviar}
      >
        {t(enviando ? 'influenciador.video.analyzing' : 'influenciador.video.analyze')}
      </Button>

      {enviando && (
        <p className="text-center text-xs text-text-muted">
          {t('influenciador.video.waitNote')}
        </p>
      )}

      {resultado && (
        <div className="flex flex-col gap-2 rounded-xl border border-hairline bg-bg-elevated/60 p-3">
          <span className="text-xs font-semibold uppercase tracking-label text-accent">
            {t('influenciador.video.transcriptLabel')}
          </span>
          {resultado.transcript_text ? (
            <blockquote className="border-l-2 border-primary-500 pl-3 text-sm italic leading-relaxed text-text-secondary">
              “{resultado.transcript_text}”
            </blockquote>
          ) : (
            // O modelo pode devolver análise sem transcrição — vídeo sem fala,
            // por exemplo. Dizer "sem transcrição" é diferente de mostrar vazio.
            <p className="text-sm text-text-muted">
              {t('influenciador.video.noTranscript')}
            </p>
          )}
          <p className="text-xs text-text-muted">
            {t('influenciador.video.doneNote')}
          </p>
        </div>
      )}
    </Card>
  )
}
