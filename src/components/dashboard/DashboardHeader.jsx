import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Check } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import StatusIndicator from '../ui/StatusIndicator.jsx'
import Tabs from '../ui/Tabs.jsx'
import { PERIOD_OPTIONS } from '../../lib/constants.js'

function CampaignDropdown({ options, value, onChange, label }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'inline-flex h-10 min-w-[220px] items-center justify-between gap-2 rounded-xl px-3.5',
          'bg-bg-input ring-1 ring-inset ring-neutral-700',
          'text-sm text-neutral-100 transition-all duration-150',
          'hover:ring-neutral-600',
          open && 'ring-2 ring-primary-500 shadow-glow-soft'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex flex-col items-start min-w-0">
          <span className="text-[10px] font-semibold tracking-label text-text-muted">{label}</span>
          <span className="truncate text-sm font-medium text-neutral-100">{selected?.name}</span>
        </span>
        <ChevronDown
          size={14}
          className={cn('shrink-0 text-text-muted transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className={cn(
            'absolute right-0 top-full z-30 mt-2 max-h-72 w-full min-w-[260px] overflow-y-auto p-1.5',
            'animate-fade-in rounded-2xl border border-primary/15 bg-neutral-800 shadow-glow-soft'
          )}
        >
          {options.map((opt) => {
            const active = opt.value === value
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors',
                    active
                      ? 'bg-primary-600/15 text-primary-200'
                      : 'text-text-secondary hover:bg-neutral-700 hover:text-neutral-100'
                  )}
                >
                  <span className="truncate">{opt.name}</span>
                  {active && <Check size={14} className="shrink-0 text-primary-300" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function DashboardHeader({
  period, onPeriodChange,
  campaign, onCampaignChange,
  campaigns,
}) {
  const { t } = useTranslation()

  const periodTabs = PERIOD_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(`dashboard.filters.${opt.labelKey}`),
  }))

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-3">
        <span className="text-label">{t('dashboard.label')}</span>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-neutral-100 lg:text-4xl">
            {t('dashboard.title')}
          </h1>
          <StatusIndicator label={t('dashboard.liveSync')} color="success" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          variant="pills"
          items={periodTabs}
          value={period}
          onChange={onPeriodChange}
        />
        <CampaignDropdown
          options={campaigns}
          value={campaign}
          onChange={onCampaignChange}
          label={t('dashboard.filters.campaign')}
        />
      </div>
    </header>
  )
}
