import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, FileText, Download, Eye, FileSearch } from 'lucide-react'

import { cn } from '../lib/cn.js'
import Button from '../components/ui/Button.jsx'
import Search from '../components/ui/Search.jsx'
import Card, { CardLabel } from '../components/ui/Card.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Toast from '../components/ui/Toast.jsx'
import ApiErrorBanner from '../components/ui/ApiErrorBanner.jsx'
import { formatDateRange } from '../lib/format.js'
import { useApi } from '../hooks/useApi.js'
import { listReports, downloadReport } from '../services/reports.js'

function formatDate(iso, locale) {
  try {
    return new Date(iso).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch {
    return iso
  }
}

function RelatorioRow({ relatorio, onPreview, onDownload, t, locale }) {
  return (
    <div className={cn(
      'flex flex-col gap-4 rounded-2xl border border-hairline/60 bg-bg-base/40 p-5',
      'transition-all duration-200 hover:border-primary/30 hover:bg-bg-surface/50',
      'lg:flex-row lg:items-center'
    )}>
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600/15 text-accent ring-1 ring-inset ring-primary-500/25">
        <FileText size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="tipo-secao truncate text-text-primary">
          {relatorio.name}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          <span>{formatDateRange(relatorio.period.start, relatorio.period.end, locale)}</span>
          <span>·</span>
          <span>{relatorio.pages} {t('relatorios.list.columns.pages').toLowerCase()}</span>
        </div>
      </div>

      <div className="hidden flex-col items-end text-xs text-text-muted lg:flex">
        <span className="font-semibold uppercase tracking-label">
          {formatDate(relatorio.createdAt, locale)}
        </span>
        <span>{relatorio.generatedBy}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" leftIcon={Eye} onClick={onPreview}>
          {t('relatorios.list.actions.preview')}
        </Button>
        <Button variant="primary" size="sm" leftIcon={Download} onClick={onDownload}>
          {t('relatorios.list.actions.download')}
        </Button>
      </div>
    </div>
  )
}

export default function Relatorios() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  const { data: reports, loading, error, refetch} = useApi(listReports, [])
  const all = reports || []

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return all
    return all.filter((r) => r.name.toLowerCase().includes(q))
  }, [all, search])

  const handleDownload = async (r) => {
    try {
      await downloadReport(r.id, r.name)
      setToast({ type: 'success', message: t('relatorios.list.downloadStarted'), desc: `${r.name}.pdf` })
    } catch (e) {
      setToast({ type: 'error', message: t('relatorios.list.downloadFailed'), desc: e.message })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary lg:text-4xl">
            {t('relatorios.list.title')}
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">{t('relatorios.list.subtitle')}</p>
        </div>

        <Link to="/app/relatorios/novo">
          <Button variant="primary" leftIcon={Plus}>
            {t('relatorios.list.newButton')}
          </Button>
        </Link>
      </header>

      <ApiErrorBanner error={error} onRetry={refetch} />

      <div className="max-w-lg">
        <Search
          placeholder={t('relatorios.list.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista */}
      <Card glass padding="md">
        {error ? null : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-[72px]" rounded="rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title={t('relatorios.list.empty.title')}
            description={t('relatorios.list.empty.subtitle')}
          />
        ) : (
          <div className="space-y-3">
            <CardLabel>
              {t('relatorios.list.title')} · {filtered.length}
            </CardLabel>
            {filtered.map((r) => (
              <RelatorioRow
                key={r.id}
                relatorio={r}
                onPreview={() => handleDownload(r)}
                onDownload={() => handleDownload(r)}
                t={t}
                locale={i18n.language}
              />
            ))}
          </div>
        )}
      </Card>

      <Toast
        open={!!toast}
        onClose={() => setToast(null)}
        message={toast?.message || ''}
        description={toast?.desc || ''}
        type={toast?.type || 'info'}
      />
    </div>
  )
}
