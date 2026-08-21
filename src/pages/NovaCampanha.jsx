import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Building2, Calendar, Wallet, Tag, Check, Search as SearchIcon, Sparkles, Megaphone } from 'lucide-react'

import { cn } from '../lib/cn.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Search from '../components/ui/Search.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Card, { CardLabel } from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import WizardStepper from '../components/campanha/WizardStepper.jsx'
import { PlatformBadgeList } from '../components/icons/PlatformIcons.jsx'
import { INFLUENCIADORES } from '../mocks/influenciadores.js'
import { formatFollowers, formatBudget, formatDateRange } from '../lib/format.js'

// =============================================================================
// Step 1: Detalhes
// =============================================================================
function Step1Detalhes({ data, errors, onChange, t }) {
  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-bold text-neutral-100">
          {t('campanhas.wizard.step1.title')}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">{t('campanhas.wizard.step1.subtitle')}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Input
          label={t('campanhas.wizard.step1.name')}
          placeholder={t('campanhas.wizard.step1.namePh')}
          leftIcon={Sparkles}
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          error={errors.name}
          containerClassName="lg:col-span-2"
        />
        <Input
          label={t('campanhas.wizard.step1.brand')}
          placeholder={t('campanhas.wizard.step1.brandPh')}
          leftIcon={Building2}
          value={data.brand}
          onChange={(e) => onChange('brand', e.target.value)}
          error={errors.brand}
        />
        <Input
          label={t('campanhas.wizard.step1.industry')}
          placeholder={t('campanhas.wizard.step1.industryPh')}
          leftIcon={Tag}
          value={data.industry}
          onChange={(e) => onChange('industry', e.target.value)}
          error={errors.industry}
        />
        <Input
          label={t('campanhas.wizard.step1.startDate')}
          type="date"
          leftIcon={Calendar}
          value={data.startDate}
          onChange={(e) => onChange('startDate', e.target.value)}
          error={errors.startDate}
        />
        <Input
          label={t('campanhas.wizard.step1.endDate')}
          type="date"
          leftIcon={Calendar}
          value={data.endDate}
          onChange={(e) => onChange('endDate', e.target.value)}
          error={errors.endDate || errors.period}
        />
        <Input
          label={t('campanhas.wizard.step1.budget')}
          type="number"
          placeholder={t('campanhas.wizard.step1.budgetPh')}
          leftIcon={Wallet}
          value={data.budget}
          onChange={(e) => onChange('budget', e.target.value)}
          error={errors.budget}
          containerClassName="lg:col-span-2"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-label">
          {t('campanhas.wizard.step1.description')}
        </label>
        <textarea
          rows={3}
          placeholder={t('campanhas.wizard.step1.descriptionPh')}
          value={data.description}
          onChange={(e) => onChange('description', e.target.value)}
          className={cn(
            'w-full rounded-xl bg-bg-input px-3.5 py-3 text-sm text-neutral-100',
            'ring-1 ring-inset ring-neutral-700 transition-all duration-200',
            'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:shadow-glow-soft'
          )}
        />
      </div>
    </Card>
  )
}

// =============================================================================
// Step 2: Selecionar influenciadores
// =============================================================================
function InfluenciadorRow({ inf, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(inf.id)}
      aria-pressed={checked}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-150',
        'border ring-1 ring-inset',
        checked
          ? 'border-primary-500/60 bg-primary-600/10 ring-primary-500/30'
          : 'border-neutral-700/60 bg-neutral-900/40 ring-transparent hover:bg-neutral-800/60'
      )}
    >
      <Avatar name={inf.name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-neutral-100">{inf.name}</span>
          <span className="truncate text-xs text-text-muted">{inf.handle}</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
          <PlatformBadgeList platforms={inf.platforms} size={12} />
          <span>{formatFollowers(inf.followers)}</span>
          <span>· {inf.engagement.toFixed(1)}% eng</span>
        </div>
      </div>
      <span
        className={cn(
          'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all',
          checked
            ? 'bg-primary-600 text-white'
            : 'border border-neutral-700 bg-transparent text-transparent'
        )}
      >
        <Check size={13} />
      </span>
    </button>
  )
}

function Step2Influenciadores({ selected, onToggle, error, t }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return INFLUENCIADORES
    return INFLUENCIADORES.filter((i) =>
      `${i.name} ${i.handle}`.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <Card glass className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-neutral-100">
            {t('campanhas.wizard.step2.title')}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">{t('campanhas.wizard.step2.subtitle')}</p>
        </div>
        <Badge variant={selected.size > 0 ? 'organic' : 'neutral'} uppercase={false}>
          {t('campanhas.wizard.step2.selected', { count: selected.size })}
        </Badge>
      </div>

      <Search
        placeholder={t('campanhas.wizard.step2.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="text-xs font-medium text-tertiary-300">{error}</p>}

      <div className="grid max-h-[480px] gap-2 overflow-y-auto pr-2 lg:grid-cols-2">
        {filtered.map((inf) => (
          <InfluenciadorRow
            key={inf.id}
            inf={inf}
            checked={selected.has(inf.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </Card>
  )
}

// =============================================================================
// Step 3: Confirmação
// =============================================================================
function Step3Review({ data, selected, t, locale }) {
  const selectedInfs = INFLUENCIADORES.filter((i) => selected.has(i.id))
  const totalReach   = selectedInfs.reduce((sum, i) => sum + i.followers, 0)
  const budget       = Number(data.budget) || 0
  const perCreator   = selectedInfs.length > 0 ? Math.round(budget / selectedInfs.length) : 0

  return (
    <Card glass className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-neutral-100">
          {t('campanhas.wizard.step3.title')}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">{t('campanhas.wizard.step3.subtitle')}</p>
      </div>

      {/* Resumo da campanha */}
      <div className="rounded-2xl border border-primary/15 bg-neutral-900/40 p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600/15 text-primary-300 ring-1 ring-inset ring-primary-500/20">
            <Megaphone size={18} />
          </span>
          <div>
            <CardLabel>{data.brand || '—'}</CardLabel>
            <h3 className="mt-0.5 font-display text-lg font-bold text-neutral-100">
              {data.name || '—'}
            </h3>
          </div>
        </div>
        {data.description && (
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{data.description}</p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-neutral-700/60 pt-4 text-sm">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-label text-text-muted">
              {t('campanhas.detail.header.period')}
            </span>
            <div className="mt-0.5 font-semibold text-neutral-100">
              {data.startDate && data.endDate
                ? formatDateRange(data.startDate, data.endDate, locale)
                : '—'}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-label text-text-muted">
              {t('campanhas.detail.header.industry')}
            </span>
            <div className="mt-0.5 font-semibold text-neutral-100">{data.industry || '—'}</div>
          </div>
        </div>
      </div>

      {/* KPIs estimados */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-neutral-900/40 p-4 ring-1 ring-inset ring-neutral-800">
          <CardLabel>{t('campanhas.wizard.step3.totalBudget')}</CardLabel>
          <div className="mt-2 font-display text-2xl font-extrabold text-gradient-brand">
            {formatBudget(budget)}
          </div>
        </div>
        <div className="rounded-xl bg-neutral-900/40 p-4 ring-1 ring-inset ring-neutral-800">
          <CardLabel>{t('campanhas.wizard.step3.perInfluencer')}</CardLabel>
          <div className="mt-2 font-display text-2xl font-extrabold text-neutral-100">
            {formatBudget(perCreator)}
          </div>
        </div>
        <div className="rounded-xl bg-neutral-900/40 p-4 ring-1 ring-inset ring-neutral-800">
          <CardLabel>{t('campanhas.wizard.step3.estimatedReach')}</CardLabel>
          <div className="mt-2 font-display text-2xl font-extrabold text-neutral-100">
            {formatFollowers(totalReach)}
          </div>
        </div>
      </div>

      {/* Lista compacta dos influenciadores */}
      <div>
        <CardLabel>
          {t('campanhas.wizard.step2.selected', { count: selectedInfs.length })}
        </CardLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedInfs.map((inf) => (
            <span
              key={inf.id}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900/60 px-3 py-1.5 ring-1 ring-inset ring-neutral-700"
            >
              <Avatar name={inf.name} size="sm" />
              <span className="text-sm font-medium text-neutral-200">{inf.name}</span>
            </span>
          ))}
        </div>
      </div>
    </Card>
  )
}

// =============================================================================
// Wizard parent
// =============================================================================
const TOTAL_STEPS = 3

export default function NovaCampanha() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    name: '', brand: '', industry: '',
    startDate: '', endDate: '',
    budget: '', description: '',
  })
  const [selected, setSelected] = useState(new Set())
  const [errors, setErrors]     = useState({})
  const [success, setSuccess]   = useState(false)

  const setField = (key, value) => {
    setData((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key]: undefined, period: undefined }))
  }

  const toggleInf = (id) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
    setErrors((p) => ({ ...p, selection: undefined }))
  }

  const validateStep1 = () => {
    const errs = {}
    if (!data.name.trim())     errs.name = t('campanhas.wizard.errors.required')
    if (!data.brand.trim())    errs.brand = t('campanhas.wizard.errors.required')
    if (!data.industry.trim()) errs.industry = t('campanhas.wizard.errors.required')
    if (!data.startDate)       errs.startDate = t('campanhas.wizard.errors.required')
    if (!data.endDate)         errs.endDate = t('campanhas.wizard.errors.required')
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      errs.period = t('campanhas.wizard.errors.invalidPeriod')
    }
    if (!data.budget || Number(data.budget) <= 0) {
      errs.budget = t('campanhas.wizard.errors.invalidBudget')
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    if (selected.size === 0) {
      setErrors({ selection: t('campanhas.wizard.step2.selectAtLeastOne') })
      return false
    }
    return true
  }

  const onNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }

  const onBack = () => setStep((s) => Math.max(1, s - 1))

  const onCreate = () => {
    setSuccess(true)
    setTimeout(() => navigate('/app/campanhas'), 1500)
  }

  const steps = [
    { key: 'step1', label: t('campanhas.wizard.step1.label') },
    { key: 'step2', label: t('campanhas.wizard.step2.label') },
    { key: 'step3', label: t('campanhas.wizard.step3.label') },
  ]

  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
          <Check size={28} />
        </span>
        <h2 className="font-display text-2xl font-bold text-neutral-100">
          {t('campanhas.wizard.step3.createdSuccess')}
        </h2>
        <p className="text-sm text-text-secondary">{data.name}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <Link
          to="/app/campanhas"
          className="inline-flex w-max items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-neutral-100"
        >
          <ArrowLeft size={13} />
          {t('campanhas.detail.back')}
        </Link>

        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-100 lg:text-4xl">
            {t('campanhas.wizard.title')}
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">{t('campanhas.wizard.subtitle')}</p>
        </div>

        {/* Stepper */}
        <div className="rounded-2xl border border-primary/10 bg-neutral-800/40 p-4">
          <WizardStepper steps={steps} currentStep={step} />
        </div>
      </header>

      {/* Conteudo do passo */}
      <div>
        {step === 1 && <Step1Detalhes data={data} errors={errors} onChange={setField} t={t} />}
        {step === 2 && <Step2Influenciadores selected={selected} onToggle={toggleInf} error={errors.selection} t={t} />}
        {step === 3 && <Step3Review data={data} selected={selected} t={t} locale={i18n.language} />}
      </div>

      {/* Navegacao */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={step === 1 ? () => navigate('/app/campanhas') : onBack}
          leftIcon={ArrowLeft}
        >
          {step === 1 ? t('campanhas.wizard.back') : t('campanhas.wizard.previous')}
        </Button>

        {step < TOTAL_STEPS ? (
          <Button variant="primary" onClick={onNext} rightIcon={ArrowRight}>
            {t('campanhas.wizard.next')}
          </Button>
        ) : (
          <Button variant="primary" onClick={onCreate} leftIcon={Check}>
            {t('campanhas.wizard.create')}
          </Button>
        )}
      </div>
    </div>
  )
}
