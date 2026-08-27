import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, ArrowRight, Calendar, Check, Download, FileText,
  TrendingUp, BarChart3, Brain, Lightbulb, ChartLine, Megaphone, Users,
} from 'lucide-react'

import { cn } from '../lib/cn.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Badge from '../components/ui/Badge.jsx'
import Card, { CardLabel } from '../components/ui/Card.jsx'
import Toast from '../components/ui/Toast.jsx'
import WizardStepper from '../components/campanha/WizardStepper.jsx'
import ReportPreview from '../components/relatorio/ReportPreview.jsx'
import ApiErrorBanner from '../components/ui/ApiErrorBanner.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import { formatBudget, formatDateRange, formatFollowers } from '../lib/format.js'
import { SECTION_KEYS } from '../lib/constants.js'
import { useApi } from '../hooks/useApi.js'
import { listCampaigns, getCampaignBenchmarking } from '../services/campaigns.js'
import { previewReport, createReport, downloadReport } from '../services/reports.js'

const SECTION_ICONS = {
  kpis:            BarChart3,
  growth:          ChartLine,
  benchmark:       TrendingUp,
  diagnostic:      Brain,
  recommendations: Lightbulb,
}

const TOTAL_STEPS = 4

// =============================================================================
// Step 1: Campanha
// =============================================================================
const LOADING_CARDS = 4

function Step1Campanha({ campanhas, loading, apiError, campaignId, onSelect, error, t, locale }) {
  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-bold text-neutral-100">
          {t('relatorios.wizard.step1.title')}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">{t('relatorios.wizard.step1.subtitle')}</p>
      </div>

      {error && <p className="text-xs font-medium text-tertiary-300">{error}</p>}

      <ApiErrorBanner error={apiError} />

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: LOADING_CARDS }, (_, i) => (
            <Skeleton key={i} className="h-28" rounded="rounded-2xl" />
          ))}
        </div>
      ) : (campanhas || []).length === 0 ? (
        <EmptyState compact icon={Megaphone} title={t('campanhas.list.empty.title')} />
      ) : (
      <div className="grid gap-3 md:grid-cols-2">
        {campanhas.map((c) => {
          const checked = campaignId === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              aria-pressed={checked}
              className={cn(
                'group flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all duration-150',
                checked
                  ? 'border-primary-500/60 bg-primary-600/10 shadow-glow-soft'
                  : 'border-neutral-700/60 bg-neutral-900/40 hover:border-neutral-600 hover:bg-neutral-800/60'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-label text-text-muted">
                    {c.brand}
                  </span>
                  <h3 className="mt-1 truncate font-display text-base font-bold text-neutral-100">
                    {c.name}
                  </h3>
                </div>
                <span className={cn(
                  'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all',
                  checked ? 'bg-primary-600 text-white' : 'border border-neutral-700 bg-transparent text-transparent'
                )}>
                  <Check size={13} />
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{formatDateRange(c.startDate, c.endDate, locale)}</span>
                <span className="font-semibold text-primary-300">{formatBudget(c.budget)}</span>
              </div>
            </button>
          )
        })}
      </div>
      )}
    </Card>
  )
}

// =============================================================================
// Step 2: Período + Influenciadores
// =============================================================================
function Step2PeriodoInfluenciadores({
  participants, loading, period, onPeriodChange,
  selectedIds, onToggleId,
  error, t,
}) {
  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-bold text-neutral-100">
          {t('relatorios.wizard.step2.title')}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">{t('relatorios.wizard.step2.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('relatorios.wizard.step2.startDate')}
          type="date"
          leftIcon={Calendar}
          value={period.start}
          onChange={(e) => onPeriodChange({ ...period, start: e.target.value })}
        />
        <Input
          label={t('relatorios.wizard.step2.endDate')}
          type="date"
          leftIcon={Calendar}
          value={period.end}
          onChange={(e) => onPeriodChange({ ...period, end: e.target.value })}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-label">{t('relatorios.wizard.step2.creators')}</span>
          <Badge variant={selectedIds.size > 0 ? 'organic' : 'neutral'} uppercase={false}>
            {t('relatorios.wizard.step2.selected', { count: selectedIds.size })}
          </Badge>
        </div>

        {error && <p className="mt-2 text-xs font-medium text-tertiary-300">{error}</p>}

        {loading ? (
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-[58px]" rounded="rounded-xl" />
            ))}
          </div>
        ) : participants.length === 0 ? (
          <EmptyState compact icon={Users} title={t('campanhas.detail.participants.empty')} />
        ) : (
        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          {participants.map((inf) => {
            const checked = selectedIds.has(inf.id)
            return (
              <button
                key={inf.id}
                type="button"
                onClick={() => onToggleId(inf.id)}
                aria-pressed={checked}
                className={cn(
                  'flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-150',
                  'border ring-1 ring-inset',
                  checked
                    ? 'border-primary-500/60 bg-primary-600/10 ring-primary-500/30'
                    : 'border-neutral-700/60 bg-neutral-900/40 ring-transparent hover:bg-neutral-800/60'
                )}
              >
                <Avatar name={inf.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-100">{inf.name}</p>
                  <p className="truncate text-xs text-text-muted">
                    {inf.handle} · {formatFollowers(inf.followers)}
                  </p>
                </div>
                <span className={cn(
                  'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all',
                  checked ? 'bg-primary-600 text-white' : 'border border-neutral-700 bg-transparent text-transparent'
                )}>
                  <Check size={13} />
                </span>
              </button>
            )
          })}
        </div>
        )}
      </div>
    </Card>
  )
}

// =============================================================================
// Step 3: Seções
// =============================================================================
function Step3Secoes({ selected, onToggle, error, t }) {
  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-bold text-neutral-100">
          {t('relatorios.wizard.step3.title')}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">{t('relatorios.wizard.step3.subtitle')}</p>
      </div>

      {error && <p className="text-xs font-medium text-tertiary-300">{error}</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {SECTION_KEYS.map((key) => {
          const Icon = SECTION_ICONS[key]
          const checked = selected.has(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key)}
              aria-pressed={checked}
              className={cn(
                'flex items-start gap-3 rounded-xl p-4 text-left transition-all duration-150',
                'border ring-1 ring-inset',
                checked
                  ? 'border-primary-500/60 bg-primary-600/10 ring-primary-500/30 shadow-glow-soft'
                  : 'border-neutral-700/60 bg-neutral-900/40 ring-transparent hover:bg-neutral-800/60'
              )}
            >
              <span className={cn(
                'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset',
                checked ? 'bg-primary-600/30 text-primary-200 ring-primary-500/40' : 'bg-neutral-800 text-text-secondary ring-neutral-700'
              )}>
                <Icon size={16} />
              </span>
              <div className="flex-1">
                <p className={cn('font-semibold', checked ? 'text-neutral-100' : 'text-neutral-200')}>
                  {t(`relatorios.wizard.step3.sections.${key}`)}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                  {t(`relatorios.wizard.step3.sections.${key}Desc`)}
                </p>
              </div>
              <span className={cn(
                'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all',
                checked ? 'bg-primary-600 text-white' : 'border border-neutral-700 bg-transparent text-transparent'
              )}>
                <Check size={13} />
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

// =============================================================================
// Step 4: Preview
// =============================================================================
function Step4Preview({ documento, loading, apiError, onExport, exporting, t }) {
  return (
    <div className="flex flex-col gap-5">
      <Card glass className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-neutral-100">
            {t('relatorios.wizard.step4.title')}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">{t('relatorios.wizard.step4.subtitle')}</p>
        </div>
        <Button
          variant="primary"
          leftIcon={Download}
          onClick={onExport}
          disabled={exporting || loading || !documento}
        >
          {exporting ? t('relatorios.wizard.exporting') : t('relatorios.wizard.exportPdf')}
        </Button>
      </Card>

      <ApiErrorBanner error={apiError} />

      {/* Frame escuro com paginas claras dentro (overflow-x para mobile) */}
      <div className="overflow-x-auto rounded-3xl border border-primary/10 bg-neutral-950/60 p-4 sm:p-6 lg:p-10">
        <div className="min-w-[680px]">
          {loading ? (
            <Skeleton className="mx-auto aspect-[210/297] w-full max-w-[820px]" rounded="rounded-md" />
          ) : (
            <ReportPreview document={documento} />
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Wizard parent
// =============================================================================
export default function NovoRelatorio() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Chegando de "Gerar Relatório" na tela da campanha, o passo 1 já está
  // respondido — repetir a escolha faria o atalho custar um clique a mais.
  const [searchParams] = useSearchParams()
  const campanhaPreSelecionada = searchParams.get('campanha') || ''

  const [step, setStep] = useState(campanhaPreSelecionada ? 2 : 1)
  const [campaignId, setCampaignId] = useState(campanhaPreSelecionada)
  const [period, setPeriod] = useState({ start: '', end: '' })
  const [influencerIds, setInfluencerIds] = useState(new Set())
  const [sections, setSections] = useState(new Set(SECTION_KEYS))
  const [errors, setErrors] = useState({})
  const [title, setTitle] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(null)
  const [toastOpen, setToastOpen] = useState(false)

  const { data: campanhas, loading: campanhasLoading, error: campanhasError } =
    useApi(listCampaigns, [])

  // Métricas dos participantes só existem no benchmarking da campanha.
  const { data: bench, loading: benchLoading } = useApi(
    () => getCampaignBenchmarking(campaignId),
    [campaignId],
    { enabled: Boolean(campaignId) }
  )
  const participants = bench?.rows || []

  const orderedSections = useMemo(
    () => SECTION_KEYS.filter((k) => sections.has(k)),
    [sections]
  )

  // O documento vem pronto do back-end — mesma fonte que gera o PDF.
  const { data: documento, loading: docLoading, error: docError } = useApi(
    () => previewReport({
      campaignId,
      title: title || t('relatorios.wizard.defaultTitle'),
      periodStart: period.start,
      periodEnd: period.end,
      sections: orderedSections,
    }),
    [campaignId, title, period.start, period.end, orderedSections.join(',')],
    { enabled: step === 4 && Boolean(campaignId) }
  )

  // Quando troca de campanha, pré-seleciona todos participantes + período
  const onSelectCampaign = (id) => {
    setCampaignId(id)
    const c = (campanhas || []).find((x) => x.id === id)
    if (c) {
      setPeriod({ start: c.startDate, end: c.endDate })
      setInfluencerIds(new Set(c.participations.map((p) => p.influenciadorId)))
      setTitle(`${t('relatorios.wizard.defaultTitle')} — ${c.name}`)
    }
    setErrors({})
  }

  const onExport = async () => {
    setExporting(true)
    setExportError(null)
    try {
      const relatorio = await createReport({
        campaignId,
        title: title || t('relatorios.wizard.defaultTitle'),
        periodStart: period.start,
        periodEnd: period.end,
        sections: orderedSections,
      })
      await downloadReport(relatorio.id, relatorio.name)
      setToastOpen(true)
    } catch (err) {
      setExportError(err)
    } finally {
      setExporting(false)
    }
  }

  const toggleInfluencer = (id) => {
    const next = new Set(influencerIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setInfluencerIds(next)
    setErrors((p) => ({ ...p, creators: undefined }))
  }

  const toggleSection = (key) => {
    const next = new Set(sections)
    next.has(key) ? next.delete(key) : next.add(key)
    setSections(next)
    setErrors((p) => ({ ...p, sections: undefined }))
  }

  const validate = () => {
    const e = {}
    if (step === 1 && !campaignId)        e.campaign = t('relatorios.wizard.errors.selectCampaign')
    if (step === 2 && influencerIds.size === 0) e.creators = t('relatorios.wizard.errors.selectCreators')
    if (step === 3 && sections.size === 0)      e.sections = t('relatorios.wizard.errors.selectSection')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onNext = () => { if (validate()) setStep((s) => Math.min(TOTAL_STEPS, s + 1)) }
  const onBack = () => setStep((s) => Math.max(1, s - 1))

  const stepperItems = [
    { key: 'step1', label: t('relatorios.wizard.step1.label') },
    { key: 'step2', label: t('relatorios.wizard.step2.label') },
    { key: 'step3', label: t('relatorios.wizard.step3.label') },
    { key: 'step4', label: t('relatorios.wizard.step4.label') },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <Link
          to="/app/relatorios"
          className="inline-flex w-max items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-neutral-100"
        >
          <ArrowLeft size={13} />
          {t('relatorios.wizard.back')}
        </Link>

        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-100 lg:text-4xl">
            {t('relatorios.wizard.title')}
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">{t('relatorios.wizard.subtitle')}</p>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-neutral-800/40 p-4">
          <WizardStepper steps={stepperItems} currentStep={step} />
        </div>
      </header>

      {/* Conteudo */}
      <div>
        {step === 1 && (
          <Step1Campanha
            campanhas={campanhas}
            loading={campanhasLoading}
            apiError={campanhasError}
            campaignId={campaignId}
            onSelect={onSelectCampaign}
            error={errors.campaign}
            t={t}
            locale="pt"
          />
        )}
        {step === 2 && (
          <Step2PeriodoInfluenciadores
            participants={participants}
            loading={benchLoading}
            period={period}
            onPeriodChange={setPeriod}
            selectedIds={influencerIds}
            onToggleId={toggleInfluencer}
            error={errors.creators}
            t={t}
          />
        )}
        {step === 3 && (
          <Step3Secoes
            selected={sections}
            onToggle={toggleSection}
            error={errors.sections}
            t={t}
          />
        )}
        {step === 4 && (
          <Step4Preview
            documento={documento}
            loading={docLoading}
            apiError={docError || exportError}
            onExport={onExport}
            exporting={exporting}
            t={t}
          />
        )}
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={step === 1 ? () => navigate('/app/relatorios') : onBack}
          leftIcon={ArrowLeft}
        >
          {step === 1 ? t('relatorios.wizard.back') : t('relatorios.wizard.previous')}
        </Button>

        {step < TOTAL_STEPS ? (
          <Button variant="primary" onClick={onNext} rightIcon={ArrowRight}>
            {t('relatorios.wizard.next')}
          </Button>
        ) : (
          <Button variant="primary" onClick={onExport} leftIcon={Download} disabled={exporting || !documento}>
            {exporting ? t('relatorios.wizard.exporting') : t('relatorios.wizard.exportPdf')}
          </Button>
        )}
      </div>

      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={t('relatorios.wizard.exported')}
        description={t('relatorios.wizard.exportedDesc')}
        type="success"
      />
    </div>
  )
}
