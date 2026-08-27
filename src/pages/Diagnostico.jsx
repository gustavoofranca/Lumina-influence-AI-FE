import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bot } from 'lucide-react'

import { cn } from '../lib/cn.js'
import Table from '../components/ui/Table.jsx'
import Badge from '../components/ui/Badge.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Button from '../components/ui/Button.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ApiErrorBanner from '../components/ui/ApiErrorBanner.jsx'
import { PlatformBadgeList } from '../components/icons/PlatformIcons.jsx'
import { formatPct, parseApiDate } from '../lib/format.js'
import { useApi } from '../hooks/useApi.js'
import { listInfluencers } from '../services/influencers.js'

const SAFETY_VARIANT = { A: 'success', B: 'info', C: 'warning', D: 'danger' }

/** Criador nunca analisado vai para o fim — ausência não disputa com auditoria. */
function ordenarPorAnaliseRecente(a, b) {
  if (!a.lastAnalysis && !b.lastAnalysis) return a.name.localeCompare(b.name)
  if (!a.lastAnalysis) return 1
  if (!b.lastAnalysis) return -1
  return b.lastAnalysis.localeCompare(a.lastAnalysis)
}

function formatarData(iso, locale) {
  if (!iso) return null
  try {
    return parseApiDate(iso).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: 'short',
    })
  } catch {
    return null
  }
}

/**
 * Central de diagnósticos da agência.
 *
 * Reúne numa lista o que a API já mede por criador, ordenado pela auditoria
 * mais recente. Não há endpoint de análises por agência: esta tela é uma visão
 * sobre `/influencers?enriched=true`, e por isso não inventa nenhum número que
 * o back-end não sirva. Cada linha leva à aba de Diagnóstico do criador, que é
 * onde a análise completa mora.
 */
export default function Diagnostico() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const { data, loading, error, refetch} = useApi(() => listInfluencers({ enriched: true }), [])

  const linhas = useMemo(
    () => [...(data || [])].sort(ordenarPorAnaliseRecente),
    [data]
  )

  const nuncaAnalisados = linhas.filter((i) => !i.lastAnalysis).length

  const colunas = [
    {
      key: 'name',
      header: t('diagnostico.columns.creator'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-text-primary">
              {row.name}
            </span>
            <span className="block truncate text-xs text-text-muted">{row.handle}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'platforms',
      header: t('diagnostico.columns.platforms'),
      render: (row) => <PlatformBadgeList platforms={row.platforms} size={14} />,
    },
    {
      key: 'lastAnalysis',
      header: t('diagnostico.columns.lastAnalysis'),
      render: (row) => {
        const data = formatarData(row.lastAnalysis, i18n.language)
        return data ? (
          <span className="text-sm tabular-nums text-text-primary">{data}</span>
        ) : (
          <span className="text-xs text-text-muted">{t('diagnostico.neverAnalyzed')}</span>
        )
      },
    },
    {
      key: 'safetyRating',
      header: t('diagnostico.columns.safety'),
      align: 'center',
      render: (row) => {
        const variant = SAFETY_VARIANT[row.safetyRating]
        if (!variant) return <span className="text-text-muted">—</span>
        return <Badge variant={variant}>{row.safetyRating}</Badge>
      },
    },
    {
      key: 'botProbability',
      header: t('diagnostico.columns.bot'),
      align: 'right',
      render: (row) => {
        if (row.botProbability == null) {
          return <span className="tabular-nums text-text-muted">—</span>
        }
        const tone =
          row.botProbability <= 5 ? 'text-positive'
          : row.botProbability <= 15 ? 'text-caution'
          : 'text-tint-rose'
        return (
          <span className={cn('font-semibold tabular-nums', tone)}>
            {formatPct(row.botProbability, 0)}
          </span>
        )
      },
    },
    {
      key: 'brandCoherence',
      header: t('diagnostico.columns.coherence'),
      align: 'right',
      render: (row) => (
        <span className="font-semibold tabular-nums text-text-primary">
          {row.brandCoherence == null ? '—' : Math.round(row.brandCoherence)}
        </span>
      ),
    },
    {
      key: 'acao',
      header: '',
      align: 'right',
      render: (row) => (
        <Button
          variant="outlined"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/app/influenciadores/${row.id}`)
          }}
        >
          {row.lastAnalysis ? t('diagnostico.view') : t('diagnostico.analyze')}
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {t('diagnostico.title')}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{t('diagnostico.subtitle')}</p>
        {!loading && nuncaAnalisados > 0 && (
          <p className="mt-2 text-xs text-caution">
            {t('diagnostico.pendingHint', { count: nuncaAnalisados })}
          </p>
        )}
      </header>

      {error && <ApiErrorBanner error={error} onRetry={refetch} />}

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" rounded="rounded-xl" />
          ))}
        </div>
      ) : error ? null : (
        <Table
          columns={colunas}
          data={linhas}
          getRowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/app/influenciadores/${row.id}`)}
          emptyState={
            <EmptyState
              icon={Bot}
              title={t('diagnostico.empty.title')}
              description={t('diagnostico.empty.description')}
            />
          }
        />
      )}
    </div>
  )
}
