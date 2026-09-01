import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, Check, X, Lightbulb } from 'lucide-react'

import { cn } from '../../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../../ui/Card.jsx'
import Button from '../../ui/Button.jsx'
import EmptyState from '../../ui/EmptyState.jsx'
import Skeleton from '../../ui/Skeleton.jsx'
import ApiErrorBanner from '../../ui/ApiErrorBanner.jsx'
import {
  decidirRecomendacao,
  desfazerDecisaoDeRecomendacao,
} from '../../../services/influencers.js'

const PRIORITY_STYLES = {
  high:   'bg-tertiary-500/15 text-tint-rose ring-tertiary-500/30',
  medium: 'bg-amber-500/15    text-caution    ring-amber-500/30',
  low:    'bg-primary-600/15  text-accent  ring-primary-500/25',
}

const STATE_STYLES = {
  accepted: { ring: 'ring-emerald-500/30 bg-emerald-500/5',   icon: Check, label: 'accepted', color: 'text-positive' },
  ignored:  { ring: 'ring-tertiary-500/25 bg-tertiary-500/5', icon: X,     label: 'ignored',  color: 'text-tint-rose' },
}

function RecommendationItem({ rec, status, ocupado, onAccept, onIgnore, onDesfazer, t, i18n }) {
  const stateStyle = status && STATE_STYLES[status]

  return (
    <li className={cn(
      'rounded-2xl border border-hairline/60 bg-bg-base/40 p-5 transition-all duration-200',
      stateStyle && `ring-1 ${stateStyle.ring}`,
    )}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600/20 text-accent ring-1 ring-inset ring-primary-500/30">
            <Sparkles size={14} />
          </span>
          <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset',
            PRIORITY_STYLES[rec.priority]
          )}>
            {t(`influenciador.recommendations.priority.${rec.priority}`)}
          </span>
        </div>

        {/* Estado quando ja agiu */}
        {stateStyle && (
          <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', stateStyle.color)}>
            <stateStyle.icon size={13} />
            {t(`influenciador.recommendations.${stateStyle.label}`)}
          </span>
        )}
      </div>

      <h4 className="mt-3 font-display text-base font-bold text-text-primary">
        {rec.title}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {rec.description}
      </p>

      {!status ? (
        <div className="mt-4 flex items-center gap-2">
          <Button variant="primary" size="sm" leftIcon={Check} loading={ocupado}
                  disabled={ocupado} onClick={onAccept}>
            {t('influenciador.recommendations.accept')}
          </Button>
          <Button variant="secondary" size="sm" leftIcon={X} loading={ocupado}
                  disabled={ocupado} onClick={onIgnore}>
            {t('influenciador.recommendations.ignore')}
          </Button>
        </div>
      ) : (
        // Quem decidiu e quando: uma auditoria em que ninguém responde pelo
        // aceite não é auditoria. E o desfazer existe porque decidir por
        // engano é diferente de decidir — sem ele um clique errado congelava
        // o item, e a tela passava a afirmar uma decisão que ninguém tomou.
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          {rec.decidedBy ? (
            <span>
              {t('influenciador.recommendations.decidedBy', {
                nome: rec.decidedBy,
                data: formatarData(rec.decidedAt, i18n.language),
              })}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onDesfazer}
            disabled={ocupado}
            className="font-semibold text-accent underline-offset-2 transition-opacity hover:underline disabled:opacity-50"
          >
            {t('influenciador.recommendations.undo')}
          </button>
        </div>
      )}
    </li>
  )
}

/** Data curta e local. Sem data, `new Date(null)` cairia na epoch. */
function formatarData(iso, idioma) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(idioma === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: 'short',
    })
  } catch {
    return ''
  }
}

/**
 * Recomendações da IA, com a decisão da agência.
 *
 * A decisão **vem do servidor** e volta para ele. Antes ela vivia num
 * `useState` local: aceitar uma recomendação não acontecia de verdade, sumia ao
 * recarregar, e ninguém respondia por ela. Numa ferramenta de auditoria, o
 * registro do que a agência decidiu é parte do produto, não enfeite da tela.
 */
export default function RecommendationsCard({
  data, loading = false, influencerId, analysisId, onRecarregar,
}) {
  const { t, i18n } = useTranslation()
  const [ocupado, setOcupado] = useState(null)
  const [erro, setErro] = useState(null)

  const decidir = async (rec, decisao) => {
    if (!influencerId || !analysisId) return
    setOcupado(rec.index)
    setErro(null)
    try {
      if (decisao === null) {
        await desfazerDecisaoDeRecomendacao(influencerId, {
          analysisId, index: rec.index,
        })
      } else {
        await decidirRecomendacao(influencerId, {
          analysisId, index: rec.index, decisao,
        })
      }
      // Recarrega do servidor em vez de adivinhar o novo estado: quem decidiu e
      // quando são do servidor, e inventá-los aqui seria a mesma mentira de antes.
      await onRecarregar?.()
    } catch (err) {
      setErro(err)
    } finally {
      setOcupado(null)
    }
  }

  if (loading) {
    return (
      <Card glass className="flex flex-col gap-5">
        <CardLabel>{t('influenciador.recommendations.title')}</CardLabel>
        <Skeleton className="h-40" rounded="rounded-xl" />
      </Card>
    )
  }

  if (!data?.length) {
    return (
      <Card glass className="flex flex-col gap-5">
        <CardLabel>{t('influenciador.recommendations.title')}</CardLabel>
        <EmptyState icon={Lightbulb} title={t('influenciador.recommendations.empty')} />
      </Card>
    )
  }

  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('influenciador.recommendations.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('influenciador.recommendations.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('influenciador.recommendations.subtitle')}</p>
      </div>

      {erro ? <ApiErrorBanner error={erro} /> : null}

      <ul className="space-y-3">
        {data.map((rec) => (
          <RecommendationItem
            key={rec.id}
            rec={rec}
            status={rec.decision}
            ocupado={ocupado === rec.index}
            onAccept={() => decidir(rec, 'accepted')}
            onIgnore={() => decidir(rec, 'ignored')}
            onDesfazer={() => decidir(rec, null)}
            t={t}
            i18n={i18n}
          />
        ))}
      </ul>
    </Card>
  )
}
