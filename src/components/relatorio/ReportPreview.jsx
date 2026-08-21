import { useTranslation } from 'react-i18next'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { cn } from '../../lib/cn.js'
import { findCampanha } from '../../mocks/campanhas.js'
import { formatBudget, formatDateRange, formatFollowers } from '../../lib/format.js'
import { findInfluenciador } from '../../mocks/influenciadores.js'
import { GROWTH_SERIES, KPIS } from '../../mocks/dashboard.js'
import { RECOMMENDATIONS } from '../../mocks/analise.js'

/* -------------------------------------------------------------------------- */
/* Page (A4 light)                                                            */
/* -------------------------------------------------------------------------- */

function Page({ pageNumber, totalPages, children, t, brand }) {
  return (
    <div className={cn(
      'relative mx-auto bg-white text-neutral-900',
      'w-full max-w-[820px] aspect-[210/297]',
      'rounded-md shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]',
      'border border-neutral-300/80',
      'flex flex-col'
    )}>
      {/* Header da pagina */}
      <header className="flex items-center justify-between border-b border-neutral-200 px-10 py-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-brand text-white">
            <span className="text-xs font-bold">L</span>
          </span>
          <span className="font-display text-sm font-bold text-neutral-900">Lumina Influence AI</span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
          {brand}
        </span>
      </header>

      {/* Conteudo */}
      <div className="flex-1 overflow-hidden px-10 py-8">
        {children}
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-neutral-200 px-10 py-3 text-[10px] text-neutral-500">
        <span>{t('relatorios.preview.footerNote')}</span>
        <span className="font-semibold text-neutral-700 tabular-nums">
          {t('relatorios.preview.page')} {pageNumber} {t('relatorios.preview.of')} {totalPages}
        </span>
      </footer>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Subseções                                                                  */
/* -------------------------------------------------------------------------- */

function CoverInfo({ campanha, period, generatedBy, t, locale }) {
  return (
    <div className="flex h-full flex-col">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
        {t('relatorios.preview.title')}
      </span>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-neutral-900">
        {campanha?.name}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        {campanha?.description}
      </p>

      <div className="mt-10 grid grid-cols-2 gap-6 border-t border-neutral-200 pt-6 text-sm">
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            {t('relatorios.preview.preparedFor')}
          </span>
          <span className="mt-1 block font-bold text-neutral-900">{campanha?.brand}</span>
          <span className="block text-xs text-neutral-500">{campanha?.industry}</span>
        </div>
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            {t('relatorios.preview.preparedBy')}
          </span>
          <span className="mt-1 block font-bold text-neutral-900">Lumina Influence AI</span>
          <span className="block text-xs text-neutral-500">{generatedBy}</span>
        </div>
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            {t('relatorios.preview.period')}
          </span>
          <span className="mt-1 block font-bold text-neutral-900">
            {formatDateRange(period.start, period.end, locale)}
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            {t('campanhas.detail.header.budget')}
          </span>
          <span className="mt-1 block font-bold text-neutral-900">
            {formatBudget(campanha?.budget || 0)}
          </span>
        </div>
      </div>
    </div>
  )
}

function ExecutiveSummary({ t, campanha, influencers }) {
  const orgAvg = Math.round(influencers.reduce((sum, i) => sum + i.organicReach, 0) / Math.max(1, influencers.length))
  const sentAvg = Math.round(influencers.reduce((sum, i) => sum + i.sentimentScore, 0) / Math.max(1, influencers.length))

  return (
    <div>
      <SectionTitle>{t('relatorios.preview.executiveSummary')}</SectionTitle>
      <p className="mt-3 text-sm leading-relaxed text-neutral-700">
        Esta auditoria cobre <strong>{influencers.length} criadores</strong> selecionados
        para a campanha <strong>{campanha?.name}</strong>. Em média, {orgAvg}% do alcance foi
        orgânico e o sentimento médio dos comentários ficou em {sentAvg}%, dentro do
        patamar saudável esperado para o segmento de {campanha?.industry?.toLowerCase()}.
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <li className="rounded-lg bg-neutral-50 px-3 py-2 ring-1 ring-inset ring-neutral-200">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">Posts auditados</span>
          <span className="mt-1 block font-display text-lg font-bold text-neutral-900">{campanha?.metrics?.posts || 0}</span>
        </li>
        <li className="rounded-lg bg-neutral-50 px-3 py-2 ring-1 ring-inset ring-neutral-200">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">Alcance total</span>
          <span className="mt-1 block font-display text-lg font-bold text-neutral-900">
            {campanha?.metrics?.totalReach > 0 ? formatFollowers(campanha.metrics.totalReach) : '—'}
          </span>
        </li>
      </ul>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 className="border-b-2 border-violet-500 pb-2 font-display text-base font-bold uppercase tracking-wide text-neutral-900">
      {children}
    </h2>
  )
}

function KpisSection({ t }) {
  return (
    <section>
      <SectionTitle>{t('relatorios.preview.kpisTitle')}</SectionTitle>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {KPIS.map((kpi) => (
          <div key={kpi.key} className="rounded-lg bg-neutral-50 p-3 ring-1 ring-inset ring-neutral-200">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
              {t(`dashboard.kpis.${kpi.key}`)}
            </span>
            <span className="mt-1.5 block font-display text-xl font-extrabold tabular-nums text-neutral-900">
              {kpi.value}
            </span>
            {typeof kpi.change === 'number' && (
              <span className={cn(
                'text-[10px] font-semibold tabular-nums',
                kpi.change > 0 ? 'text-emerald-600' : kpi.change < 0 ? 'text-rose-600' : 'text-neutral-500'
              )}>
                {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function GrowthSection({ t }) {
  const data = GROWTH_SERIES['30d']
  return (
    <section>
      <SectionTitle>{t('relatorios.preview.growthTitle')}</SectionTitle>
      <div className="mt-4 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="rep-organic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="rep-paid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0EA5E9" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="x" stroke="#9CA3AF" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey="organic" name={t('dashboard.growth.organic')} stroke="#7C3AED" strokeWidth={2} fill="url(#rep-organic)" />
            <Area type="monotone" dataKey="paid"    name={t('dashboard.growth.paid')}    stroke="#0EA5E9" strokeWidth={2} fill="url(#rep-paid)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center gap-4 text-[11px] text-neutral-600">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500" />{t('dashboard.growth.organic')}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" />{t('dashboard.growth.paid')}</span>
      </div>
    </section>
  )
}

function BenchmarkSection({ t, influencers }) {
  return (
    <section>
      <SectionTitle>{t('relatorios.preview.benchmarkTitle')}</SectionTitle>
      <table className="mt-4 w-full text-left text-xs">
        <thead>
          <tr className="border-b border-neutral-300 text-[9px] font-bold uppercase tracking-[0.1em] text-neutral-500">
            <th className="py-2 pr-3">{t('campanhas.detail.benchmark.columns.creator')}</th>
            <th className="py-2 pr-3 text-right">Followers</th>
            <th className="py-2 pr-3 text-right">{t('campanhas.detail.benchmark.columns.organic')}</th>
            <th className="py-2 pr-3 text-right">{t('campanhas.detail.benchmark.columns.engagement')}</th>
            <th className="py-2 pr-3 text-right">{t('campanhas.detail.benchmark.columns.sentiment')}</th>
            <th className="py-2 text-right">{t('campanhas.detail.benchmark.columns.score')}</th>
          </tr>
        </thead>
        <tbody>
          {influencers.map((inf) => (
            <tr key={inf.id} className="border-b border-neutral-100">
              <td className="py-2.5 pr-3">
                <div className="font-semibold text-neutral-900">{inf.name}</div>
                <div className="text-[10px] text-neutral-500">{inf.handle}</div>
              </td>
              <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-700">{formatFollowers(inf.followers)}</td>
              <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-700">{inf.organicReach}%</td>
              <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-700">{inf.engagement.toFixed(1)}%</td>
              <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-700">{inf.sentimentScore}%</td>
              <td className="py-2.5 text-right">
                <span className="font-display font-extrabold text-violet-600 tabular-nums">{inf.resonanceScore}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function DiagnosticSection({ t, influencers }) {
  return (
    <section>
      <SectionTitle>{t('relatorios.preview.diagnosticTitle')}</SectionTitle>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-700">
        {influencers.slice(0, 2).map((inf) => (
          <div key={inf.id} className="rounded-lg bg-neutral-50 p-3 ring-1 ring-inset ring-neutral-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900">{inf.name} <span className="text-xs text-neutral-500">— {inf.niche}</span></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-violet-600">
                Bot {inf.botProbability}% · Coh. {inf.brandCoherence}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600">
              Análise indica alinhamento {inf.brandCoherence > 85 ? 'forte' : 'parcial'} com a marca,
              sentimento {inf.sentimentScore >= 80 ? 'majoritariamente positivo' : 'misto'} e probabilidade
              de bot {inf.botProbability < 5 ? 'baixa' : 'a monitorar'}.
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function RecommendationsSection({ t }) {
  return (
    <section>
      <SectionTitle>{t('relatorios.preview.recommendationsTitle')}</SectionTitle>
      <ol className="mt-4 space-y-3">
        {RECOMMENDATIONS.map((rec, i) => (
          <li key={rec.id} className="flex gap-3 text-sm">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700 text-xs">
              {i + 1}
            </span>
            <div>
              <p className="font-semibold text-neutral-900">{rec.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">{rec.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* ReportPreview                                                              */
/* -------------------------------------------------------------------------- */

export default function ReportPreview({ campaignId, period, influencerIds, sections, generatedBy = 'Equipe Lumina' }) {
  const { t, i18n } = useTranslation()

  const campanha = findCampanha(campaignId)
  const influencers = (influencerIds || [])
    .map((id) => findInfluenciador(id))
    .filter(Boolean)

  if (!campanha) {
    return (
      <div className="rounded-2xl border border-neutral-700/60 bg-neutral-900/40 p-12 text-center">
        <p className="text-sm text-text-muted">{t('relatorios.wizard.step1.empty')}</p>
      </div>
    )
  }

  // Distribui as secoes em paginas: capa = 1, demais sequenciais
  // Para o TCC: pagina 1 = capa+sumário; pagina 2+ = secoes selecionadas
  const totalPages = 1 + (sections.length > 0 ? Math.ceil(sections.length / 2) : 0)

  // Agrupa secoes em pares para caber 2 por pagina A4
  const pageGroups = []
  for (let i = 0; i < sections.length; i += 2) {
    pageGroups.push(sections.slice(i, i + 2))
  }

  const renderSection = (key) => {
    if (key === 'kpis')            return <KpisSection t={t} />
    if (key === 'growth')          return <GrowthSection t={t} />
    if (key === 'benchmark')       return <BenchmarkSection t={t} influencers={influencers} />
    if (key === 'diagnostic')      return <DiagnosticSection t={t} influencers={influencers} />
    if (key === 'recommendations') return <RecommendationsSection t={t} />
    return null
  }

  return (
    <div className="space-y-6">
      {/* Pagina 1 — Capa + sumário */}
      <Page pageNumber={1} totalPages={totalPages} brand={campanha.brand} t={t}>
        <div className="flex h-full flex-col gap-8">
          <CoverInfo
            campanha={campanha}
            period={period}
            generatedBy={generatedBy}
            t={t}
            locale={i18n.language}
          />
          <ExecutiveSummary t={t} campanha={campanha} influencers={influencers} />
        </div>
      </Page>

      {/* Demais paginas — secoes selecionadas (2 por pagina) */}
      {pageGroups.map((group, idx) => (
        <Page
          key={idx}
          pageNumber={idx + 2}
          totalPages={totalPages}
          brand={campanha.brand}
          t={t}
        >
          <div className="flex h-full flex-col gap-7">
            {group.map((sectionKey) => (
              <div key={sectionKey}>{renderSection(sectionKey)}</div>
            ))}
          </div>
        </Page>
      ))}
    </div>
  )
}
