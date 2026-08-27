import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Search from '../ui/Search.jsx'
import Tabs from '../ui/Tabs.jsx'
import { PLATFORM_META } from '../icons/PlatformIcons.jsx'

const PLATFORM_KEYS = ['instagram', 'tiktok', 'youtube']
const STATUS_KEYS   = ['active', 'monitoring', 'risk']

function ChipToggle({ active, onClick, children, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all duration-150',
        'ring-1 ring-inset',
        active
          ? 'bg-primary-600/20 text-accent-strong ring-primary-500/40'
          : 'bg-bg-surface/60 text-text-secondary ring-hairline hover:bg-bg-elevated hover:text-text-primary'
      )}
    >
      {children}
    </button>
  )
}

export default function InfluenciadoresFilters({
  search, onSearchChange,
  platforms, onTogglePlatform,
  statuses, onToggleStatus,
  range, onRangeChange,
  hasFilters, onClear,
}) {
  const { t } = useTranslation()

  const rangeTabs = [
    { value: 'all',   label: t('influenciadores.filters.rangeAll') },
    { value: 'micro', label: t('influenciadores.filters.rangeMicro') },
    { value: 'mid',   label: t('influenciadores.filters.rangeMid') },
    { value: 'macro', label: t('influenciadores.filters.rangeMacro') },
    { value: 'mega',  label: t('influenciadores.filters.rangeMega') },
  ]

  return (
    <div className="card-glass flex flex-col gap-5 rounded-2xl p-5">
      {/* Linha 1: Search + clear */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-lg">
          <Search
            placeholder={t('influenciadores.filters.searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary"
          >
            <X size={13} />
            {t('influenciadores.filters.clear')}
          </button>
        )}
      </div>

      {/* Linha 2: Plataformas + Status */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <span className="text-label">{t('influenciadores.filters.platforms')}</span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {PLATFORM_KEYS.map((p) => {
              const meta = PLATFORM_META[p]
              const Icon = meta.Icon
              const active = platforms.has(p)
              return (
                <ChipToggle
                  key={p}
                  active={active}
                  onClick={() => onTogglePlatform(p)}
                  ariaLabel={meta.name}
                >
                  <Icon size={13} />
                  {meta.name}
                </ChipToggle>
              )
            })}
          </div>
        </div>

        <div>
          <span className="text-label">{t('influenciadores.filters.status')}</span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {STATUS_KEYS.map((s) => {
              const active = statuses.has(s)
              return (
                <ChipToggle
                  key={s}
                  active={active}
                  onClick={() => onToggleStatus(s)}
                >
                  {t(`influenciadores.status.${s}`)}
                </ChipToggle>
              )
            })}
          </div>
        </div>
      </div>

      {/* Linha 3: Faixa de seguidores */}
      <div>
        <span className="text-label">{t('influenciadores.filters.followersRange')}</span>
        <div className="mt-2.5">
          <Tabs
            variant="pills"
            items={rangeTabs}
            value={range}
            onChange={onRangeChange}
            size="sm"
          />
        </div>
      </div>
    </div>
  )
}
