import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Megaphone } from 'lucide-react'

import { cn } from '../lib/cn.js'
import Button from '../components/ui/Button.jsx'
import Search from '../components/ui/Search.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import CampanhaCard from '../components/campanhas/CampanhaCard.jsx'
import ApiErrorBanner from '../components/ui/ApiErrorBanner.jsx'
import { useApi } from '../hooks/useApi.js'
import { listCampaigns } from '../services/campaigns.js'

const STATUS_FILTER = ['all', 'active', 'planning', 'paused', 'completed']

export default function Campanhas() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const { data: campaigns, error } = useApi(listCampaigns, [])
  const all = campaigns || []

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return all.filter((c) => {
      if (status !== 'all' && c.status !== status) return false
      if (q) {
        const haystack = `${c.name} ${c.brand} ${c.industry}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [all, search, status])

  const statusTabs = STATUS_FILTER.map((s) => ({
    value: s,
    label: s === 'all' ? t('campanhas.list.filterAll') : t(`campanhas.status.${s}`),
    count: s === 'all' ? all.length : all.filter((c) => c.status === s).length,
  }))

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-100 lg:text-4xl">
            {t('campanhas.list.title')}
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">{t('campanhas.list.subtitle')}</p>
        </div>

        <Link to="/app/campanhas/nova">
          <Button variant="primary" leftIcon={Plus}>
            {t('campanhas.list.newButton')}
          </Button>
        </Link>
      </header>

      <ApiErrorBanner error={error} />

      {/* Filtros */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 max-w-lg">
          <Search
            placeholder={t('campanhas.list.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs variant="pills" items={statusTabs} value={status} onChange={setStatus} size="sm" />
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className={cn(
          'flex flex-col items-center justify-center gap-3 py-16 text-center',
          'rounded-2xl border border-neutral-700/60 bg-neutral-800/40'
        )}>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-text-muted">
            <Megaphone size={20} />
          </span>
          <h3 className="font-display text-lg font-semibold text-neutral-200">
            {t('campanhas.list.empty.title')}
          </h3>
          <p className="max-w-sm text-sm text-text-secondary">
            {t('campanhas.list.empty.subtitle')}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CampanhaCard key={c.id} campanha={c} />
          ))}
        </div>
      )}
    </div>
  )
}
