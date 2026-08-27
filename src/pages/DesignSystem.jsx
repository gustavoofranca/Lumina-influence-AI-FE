import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bot,
  CircleHelp,
  Download,
  Layers,
  Mail,
  Plus,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  Wand2,
  Zap,
} from 'lucide-react'

import { cn } from '../lib/cn.js'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardLabel,
  CardTitle,
  IconButton,
  Input,
  KpiCard,
  LanguageSwitcher,
  Modal,
  ProgressBar,
  Search,
  Skeleton,
  SkeletonText,
  StatusIndicator,
  Table,
  Tabs,
  Tooltip,
} from '../components/ui/index.js'

/* -------------------------------------------------------------- */
/* Helpers de layout                                              */
/* -------------------------------------------------------------- */

function Section({ id, title, description, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <header className="mb-5 max-w-3xl">
        <CardLabel>{title}</CardLabel>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
      </header>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

function ShowcaseRow({ children, className = '' }) {
  return <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>
}

/* -------------------------------------------------------------- */
/* Mocks locais para demos                                        */
/* -------------------------------------------------------------- */

const TABLE_COLUMNS = (t) => [
  {
    key: 'creator',
    header: t('ds.table.creator'),
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} size="sm" />
        <div>
          <div className="font-semibold text-text-primary">{row.name}</div>
          <div className="text-xs text-text-muted">{row.handle}</div>
        </div>
      </div>
    ),
  },
  { key: 'platform', header: t('ds.table.platform') },
  {
    key: 'score',
    header: t('ds.table.score'),
    align: 'right',
    render: (row) => (
      <span className={cn('font-display font-bold', row.score >= 80 ? 'text-emerald-300' : row.score >= 60 ? 'text-amber-300' : 'text-tertiary-300')}>
        {row.score}
      </span>
    ),
  },
  {
    key: 'status',
    header: t('ds.table.status'),
    align: 'right',
    render: (row) => <Badge variant={row.statusVariant}>{row.status}</Badge>,
  },
]

const TABLE_DATA = [
  { id: 1, name: 'Marina Costa',     handle: '@marinacosta',     platform: 'Instagram',  score: 92, status: 'organic',  statusVariant: 'organic' },
  { id: 2, name: 'Pedro Almeida',    handle: '@pedrooalmeida',   platform: 'TikTok',     score: 78, status: 'paid',     statusVariant: 'paid' },
  { id: 3, name: 'Lucas Henrique',   handle: '@lucash',          platform: 'YouTube',    score: 64, status: 'warning',  statusVariant: 'warning' },
  { id: 4, name: 'Ana Paula Souza',  handle: '@anapsouza',       platform: 'Instagram',  score: 41, status: 'bot risk', statusVariant: 'danger' },
]

/* -------------------------------------------------------------- */
/* Pagina                                                          */
/* -------------------------------------------------------------- */

export default function DesignSystem() {
  const { t } = useTranslation()

  const [tabUnderline, setTabUnderline] = useState('overview')
  const [tabPills, setTabPills]         = useState('diagnosis')
  const [search, setSearch]             = useState('')
  const [modalOpen, setModalOpen]       = useState(false)

  const tabsItems = [
    { value: 'overview',  label: t('ds.tabs.overview'),  icon: Layers,  count: 4 },
    { value: 'posts',     label: t('ds.tabs.posts'),     count: 12 },
    { value: 'diagnosis', label: t('ds.tabs.diagnosis'), icon: Bot },
    { value: 'history',   label: t('ds.tabs.history') },
  ]

  return (
    <main className="relative min-h-screen bg-bg-base pb-24">
      {/* Glow decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(60% 50% at 100% 0%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(40% 30% at 0% 10%, rgba(14,165,233,0.12) 0%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        {/* === Header === */}
        <header className="mb-12 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <ArrowLeft size={14} />
              {t('ds.back')}
            </Link>
            <div className="flex items-center gap-2">
              <StatusIndicator label={t('status.neuralCore')} color="primary" />
              <LanguageSwitcher />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-400" />
              <span className="text-label">{t('ds.label')}</span>
            </div>
            <h1 className="text-h1 text-gradient-brand">{t('ds.title')}</h1>
            <p className="max-w-2xl text-base leading-relaxed text-text-secondary">
              {t('ds.subtitle')}
            </p>
          </div>
        </header>

        <div className="space-y-16">
          {/* ====== BUTTONS ====== */}
          <Section
            id="buttons"
            title={t('ds.sections.buttons')}
            description={t('ds.sections.buttonsDesc')}
          >
            <Card glass>
              <ShowcaseRow>
                <Button variant="primary"  leftIcon={Plus}>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="inverted" rightIcon={ArrowRight}>Inverted</Button>
                <Button variant="outlined">Outlined</Button>
              </ShowcaseRow>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <CardLabel>sm</CardLabel>
                  <ShowcaseRow className="mt-3">
                    <Button size="sm" variant="primary">Primary</Button>
                    <Button size="sm" variant="outlined" leftIcon={Download}>Export</Button>
                  </ShowcaseRow>
                </div>
                <div>
                  <CardLabel>md (default)</CardLabel>
                  <ShowcaseRow className="mt-3">
                    <Button variant="primary" leftIcon={Wand2}>Re-run</Button>
                    <Button variant="secondary" loading>Loading</Button>
                  </ShowcaseRow>
                </div>
                <div>
                  <CardLabel>lg</CardLabel>
                  <ShowcaseRow className="mt-3">
                    <Button size="lg" variant="primary" rightIcon={ArrowRight}>Comecar agora</Button>
                  </ShowcaseRow>
                </div>
              </div>

              <div className="mt-6">
                <CardLabel>fullWidth + disabled</CardLabel>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Button fullWidth variant="primary">Full width primary</Button>
                  <Button fullWidth variant="outlined" disabled>Disabled outlined</Button>
                </div>
              </div>
            </Card>
          </Section>

          {/* ====== ICON BUTTONS ====== */}
          <Section
            id="iconButtons"
            title={t('ds.sections.iconButtons')}
            description={t('ds.sections.iconButtonsDesc')}
          >
            <Card glass>
              <ShowcaseRow>
                <IconButton icon={Bell}        variant="primary"   label="Notificacoes" badge={3} />
                <IconButton icon={CircleHelp}  variant="secondary" label="Ajuda" />
                <IconButton icon={Bot}         variant="tertiary"  label="Diagnostico" />
                <IconButton icon={Settings}    variant="ghost"     label="Configuracoes" />
              </ShowcaseRow>
              <div className="mt-6 flex flex-wrap items-end gap-6">
                <div>
                  <CardLabel>sm</CardLabel>
                  <ShowcaseRow className="mt-3">
                    <IconButton size="sm" icon={Bell} variant="ghost" label="sm" />
                  </ShowcaseRow>
                </div>
                <div>
                  <CardLabel>md</CardLabel>
                  <ShowcaseRow className="mt-3">
                    <IconButton size="md" icon={Bell} variant="ghost" label="md" />
                  </ShowcaseRow>
                </div>
                <div>
                  <CardLabel>lg</CardLabel>
                  <ShowcaseRow className="mt-3">
                    <IconButton size="lg" icon={Bell} variant="ghost" label="lg" />
                  </ShowcaseRow>
                </div>
              </div>
            </Card>
          </Section>

          {/* ====== INPUTS ====== */}
          <Section
            id="inputs"
            title={t('ds.sections.inputs')}
            description={t('ds.sections.inputsDesc')}
          >
            <Card glass>
              <div className="grid gap-5 md:grid-cols-2">
                <Input label={t('common.email')}    placeholder="voce@agencia.com" leftIcon={Mail} />
                <Input
                  label={t('common.password')}
                  type="password"
                  placeholder="••••••••"
                  helperText="Mínimo 8 caracteres."
                />
                <Input label={t('common.name')}     placeholder="Marina Costa" />
                <Input
                  label={t('common.email')}
                  defaultValue="email-invalido"
                  error="Formato de e-mail inválido."
                />
              </div>
            </Card>
          </Section>

          {/* ====== SEARCH ====== */}
          <Section
            id="search"
            title={t('ds.sections.search')}
            description={t('ds.sections.searchDesc')}
          >
            <Card glass>
              <div className="grid gap-4 md:grid-cols-2">
                <Search
                  placeholder={t('ds.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search
                  placeholder={t('common.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  label={t('common.search')}
                />
              </div>
            </Card>
          </Section>

          {/* ====== CARDS ====== */}
          <Section
            id="cards"
            title={t('ds.sections.cards')}
            description={t('ds.sections.cardsDesc')}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardLabel>default</CardLabel>
                <CardTitle className="mt-2">Card padrão</CardTitle>
                <p className="mt-3 text-sm text-text-secondary">
                  Background sólido (neutral-800) e borda violeta sutil.
                </p>
              </Card>
              <Card glass>
                <CardLabel>glass</CardLabel>
                <CardTitle className="mt-2">Glassmorphism</CardTitle>
                <p className="mt-3 text-sm text-text-secondary">
                  Translúcido com blur e borda violeta a 10%.
                </p>
              </Card>
              <Card glass hoverable>
                <CardLabel>glass + hoverable</CardLabel>
                <CardTitle className="mt-2">Hover micro-elevação</CardTitle>
                <p className="mt-3 text-sm text-text-secondary">
                  Passe o mouse para ver glow e lift.
                </p>
              </Card>
            </div>
          </Section>

          {/* ====== KPIS ====== */}
          <Section
            id="kpis"
            title={t('ds.sections.kpis')}
            description={t('ds.sections.kpisDesc')}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label={t('ds.kpis.roi')}
                value="428%"
                change={12.4}
                icon={TrendingUp}
                progress={86}
              />
              <KpiCard
                label={t('ds.kpis.engagement')}
                value="8.92%"
                change={-0.5}
                icon={Zap}
                progress={42}
                progressVariant="danger"
              />
              <KpiCard
                label={t('ds.kpis.cac')}
                value="R$ 14,20"
                change={0}
                changeType="neutral"
                hint="Optimal range"
                icon={Wand2}
              />
              <KpiCard
                label={t('ds.kpis.active')}
                value="23"
                icon={Users}
                progress={67}
              />
            </div>
          </Section>

          {/* ====== BADGES ====== */}
          <Section
            id="badges"
            title={t('ds.sections.badges')}
            description={t('ds.sections.badgesDesc')}
          >
            <Card glass>
              <ShowcaseRow>
                <Badge variant="organic">organic</Badge>
                <Badge variant="paid">paid</Badge>
                <Badge variant="success">+12% growth</Badge>
                <Badge variant="warning">monitorar</Badge>
                <Badge variant="danger" icon={Bot}>bot detected</Badge>
                <Badge variant="info">live sync</Badge>
                <Badge variant="neutral" uppercase={false}>analise #PX-9921</Badge>
              </ShowcaseRow>
              <div className="mt-5">
                <CardLabel>tamanhos</CardLabel>
                <ShowcaseRow className="mt-3">
                  <Badge variant="organic" size="sm">sm</Badge>
                  <Badge variant="organic" size="md">md</Badge>
                  <Badge variant="organic" size="lg">lg</Badge>
                </ShowcaseRow>
              </div>
            </Card>
          </Section>

          {/* ====== AVATARS ====== */}
          <Section
            id="avatars"
            title={t('ds.sections.avatars')}
            description={t('ds.sections.avatarsDesc')}
          >
            <Card glass>
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar size="sm" name="Marina Costa" />
                  <CardLabel>sm</CardLabel>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar size="md" name="Pedro Almeida" status="online" />
                  <CardLabel>md · online</CardLabel>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar size="lg" name="Lucas Henrique" />
                  <CardLabel>lg</CardLabel>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar size="xl" name="Ana Paula Souza" status="offline" />
                  <CardLabel>xl · offline</CardLabel>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar size="lg" name="Foto Quebrada" src="https://invalida.example/foto.jpg" />
                  <CardLabel>fallback</CardLabel>
                </div>
              </div>
            </Card>
          </Section>

          {/* ====== MODAL + TOOLTIP ====== */}
          <Section
            id="modal-tooltip"
            title={`${t('ds.sections.modal')} · ${t('ds.sections.tooltip')}`}
            description={`${t('ds.sections.modalDesc')} ${t('ds.sections.tooltipDesc')}`}
          >
            <Card glass>
              <ShowcaseRow>
                <Button variant="primary" leftIcon={Plus} onClick={() => setModalOpen(true)}>
                  {t('ds.openModal')}
                </Button>

                <Tooltip label="Glow primary é a assinatura visual">
                  <Button variant="outlined">Hover me (top)</Button>
                </Tooltip>
                <Tooltip label="Tooltip à direita" position="right">
                  <IconButton icon={CircleHelp} variant="ghost" label="ajuda" />
                </Tooltip>
                <Tooltip label="Tooltip embaixo" position="bottom">
                  <Button variant="secondary">Bottom</Button>
                </Tooltip>
              </ShowcaseRow>
            </Card>

            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title={t('ds.modalTitle')}
              footer={
                <>
                  <Button variant="secondary" onClick={() => setModalOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button variant="primary" leftIcon={Plus} onClick={() => setModalOpen(false)}>
                    {t('ds.modalConfirm')}
                  </Button>
                </>
              }
            >
              <p className="text-sm leading-relaxed text-text-secondary">{t('ds.modalBody')}</p>
            </Modal>
          </Section>

          {/* ====== TABS ====== */}
          <Section
            id="tabs"
            title={t('ds.sections.tabs')}
            description={t('ds.sections.tabsDesc')}
          >
            <Card glass>
              <CardLabel>underline</CardLabel>
              <div className="mt-3">
                <Tabs items={tabsItems} value={tabUnderline} onChange={setTabUnderline} />
              </div>
              <div className="mt-6">
                <CardLabel>pills</CardLabel>
                <div className="mt-3">
                  <Tabs items={tabsItems} value={tabPills} onChange={setTabPills} variant="pills" />
                </div>
              </div>
            </Card>
          </Section>

          {/* ====== TABLE ====== */}
          <Section
            id="table"
            title={t('ds.sections.table')}
            description={t('ds.sections.tableDesc')}
          >
            <Card glass padding="none">
              <Table
                columns={TABLE_COLUMNS(t)}
                data={TABLE_DATA}
                onRowClick={() => {}}
                emptyState={t('ds.tableEmpty')}
              />
            </Card>
          </Section>

          {/* ====== SKELETON ====== */}
          <Section
            id="skeleton"
            title={t('ds.sections.skeleton')}
            description={t('ds.sections.skeletonDesc')}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Card glass>
                <Skeleton className="h-32 w-full" rounded="rounded-xl" />
                <div className="mt-4">
                  <SkeletonText lines={3} />
                </div>
              </Card>
              <Card glass>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12" rounded="rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-3 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <Skeleton className="h-16" rounded="rounded-xl" />
                  <Skeleton className="h-16" rounded="rounded-xl" />
                  <Skeleton className="h-16" rounded="rounded-xl" />
                </div>
              </Card>
            </div>
          </Section>

          {/* ====== STATUS + LANG ====== */}
          <Section
            id="status"
            title={t('ds.sections.status')}
            description={t('ds.sections.statusDesc')}
          >
            <Card glass>
              <ShowcaseRow className="gap-6">
                <StatusIndicator label={t('status.systemActive')} color="success" />
                <StatusIndicator label={t('status.liveSync')}     color="info" />
                <StatusIndicator label="MONITORANDO"               color="warning" />
                <StatusIndicator label="ALERTA"                    color="danger" />
                <StatusIndicator label="OFFLINE"                   color="neutral" pulse={false} />
              </ShowcaseRow>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <LanguageSwitcher />
                <LanguageSwitcher variant="icon" />
              </div>
            </Card>
          </Section>

          {/* ====== PROGRESS ====== */}
          <Section
            id="progress"
            title={t('ds.sections.progress')}
            description={t('ds.sections.progressDesc')}
          >
            <Card glass>
              <div className="space-y-5">
                <ProgressBar label="BRAND COHERENCE SCORE" value={92} showValue />
                <ProgressBar label="BOT PROBABILITY"        value={68} showValue variant="danger" />
                <ProgressBar label="SCRIPT ACCURACY"        value={80} showValue variant="success" />
                <ProgressBar label="DEMOGRAPHIC SYNC"       value={45} showValue variant="warning" />
                <ProgressBar value={30} size="sm" />
                <ProgressBar value={60} size="lg" />
              </div>
            </Card>
          </Section>
        </div>

        <footer className="mt-16 flex items-center justify-between border-t border-primary/10 pt-6">
          <StatusIndicator label={t('status.operational')} />
          <span className="text-xs text-text-muted">{t('app.description')}</span>
        </footer>
      </div>
    </main>
  )
}
