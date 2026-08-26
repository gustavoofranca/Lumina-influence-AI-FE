import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ChevronLeft, SearchX } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import Table from '../ui/Table.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import { PlatformBadgeList } from '../icons/PlatformIcons.jsx'
import { formatFollowers, formatPct } from '../../lib/format.js'

const STATUS_VARIANT = {
  active:     'success',
  monitoring: 'warning',
  risk:       'danger',
}

function formatDate(iso, locale) {
  // new Date(null) nao lanca: devolve o epoch, e o criador nunca analisado
  // aparecia com "31 de dez.". Ausencia de data precisa aparecer como ausencia.
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
    day: '2-digit', month: 'short',
  })
}

function EngagementCell({ value }) {
  // Sem medição não há faixa de cor a atribuir: verde ou vermelho já seria um
  // julgamento sobre um desempenho que não foi observado.
  if (value == null) {
    return <span className="tabular-nums text-text-muted">{formatPct(null)}</span>
  }
  const tone =
    value >= 8 ? 'text-emerald-300'
    : value >= 5 ? 'text-primary-300'
    : value >= 3 ? 'text-amber-300'
    : 'text-tertiary-300'
  return <span className={cn('font-semibold tabular-nums', tone)}>{formatPct(value)}</span>
}

function EmptyState() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-text-muted">
        <SearchX size={20} />
      </span>
      <h3 className="font-display text-lg font-semibold text-neutral-200">
        {t('influenciadores.empty.title')}
      </h3>
      <p className="max-w-sm text-sm text-text-secondary">
        {t('influenciadores.empty.subtitle')}
      </p>
    </div>
  )
}

function Pagination({ page, totalPages, onPageChange }) {
  const { t } = useTranslation()
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between gap-4 border-t border-neutral-800 px-5 py-3">
      <span className="text-xs text-text-muted">
        {t('influenciadores.pagination.page', { page, total: totalPages })}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
            'text-text-secondary disabled:opacity-40',
            'enabled:hover:bg-neutral-800 enabled:hover:text-neutral-100'
          )}
        >
          <ChevronLeft size={14} />
          {t('influenciadores.pagination.previous')}
        </button>

        {/* Indicadores de página */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const num = i + 1
            const active = num === page
            return (
              <button
                key={num}
                type="button"
                onClick={() => onPageChange(num)}
                className={cn(
                  'h-8 w-8 rounded-lg text-xs font-semibold transition-colors',
                  active
                    ? 'bg-primary-600 text-white shadow-glow-soft'
                    : 'text-text-secondary hover:bg-neutral-800 hover:text-neutral-100'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {num}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
            'text-text-secondary disabled:opacity-40',
            'enabled:hover:bg-neutral-800 enabled:hover:text-neutral-100'
          )}
        >
          {t('influenciadores.pagination.next')}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

export default function InfluenciadoresTable({
  data, page, pageSize, onPageChange, loading = false,
}) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
  const safePage   = Math.min(Math.max(1, page), totalPages)
  const start      = (safePage - 1) * pageSize
  const pageRows   = data.slice(start, start + pageSize)

  const columns = [
    {
      key: 'creator',
      header: t('influenciadores.columns.creator'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div className="min-w-0">
            <div className="truncate font-semibold text-neutral-100">{row.name}</div>
            <div className="truncate text-xs text-text-muted">{row.handle}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'platforms',
      header: t('influenciadores.columns.platforms'),
      render: (row) => <PlatformBadgeList platforms={row.platforms} />,
    },
    {
      key: 'followers',
      header: t('influenciadores.columns.followers'),
      align: 'right',
      render: (row) => (
        <span className="font-medium text-neutral-200 tabular-nums">
          {formatFollowers(row.followers)}
        </span>
      ),
    },
    {
      key: 'engagement',
      header: t('influenciadores.columns.engagement'),
      align: 'right',
      render: (row) => <EngagementCell value={row.engagement} />,
    },
    {
      key: 'lastAnalysis',
      header: t('influenciadores.columns.lastAnalysis'),
      render: (row) => (
        <span className="text-sm text-text-secondary tabular-nums">
          {formatDate(row.lastAnalysis, i18n.language)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('influenciadores.columns.status'),
      align: 'right',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]}>
          {t(`influenciadores.status.${row.status}`)}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      width: '40px',
      render: () => (
        <ChevronRight size={16} className="text-text-muted" />
      ),
    },
  ]

  // Carregando não é vazio: afirmar "nenhum influenciador" antes da resposta
  // chegar é dizer algo falso — visível com banco remoto, onde a espera é longa.
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-neutral-700/60 bg-neutral-800/40 p-4">
        <div className="flex flex-col gap-2">
          {Array.from({ length: pageSize }, (_, i) => (
            <Skeleton key={i} className="h-14" rounded="rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-neutral-700/60 bg-neutral-800/40">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-700/60 bg-neutral-800/40">
      <Table
        columns={columns}
        data={pageRows}
        getRowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/app/influenciadores/${row.id}`)}
        className="!border-0 !rounded-none"
      />
      <Pagination page={safePage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
