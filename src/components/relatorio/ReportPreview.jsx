import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'

/**
 * Pré-visualização do relatório.
 *
 * Renderiza o payload de POST /reports/preview, que é o mesmo contexto usado
 * para gerar o PDF. A estrutura espelha o template do arquivo — mesmas seções,
 * mesmas colunas, mesmos números. Se a tela desenhasse dado próprio, o que o
 * usuário confere aqui poderia não ser o que ele baixa.
 */

/* -------------------------------------------------------------------------- */
/* Página (A4 clara)                                                          */
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
      <div className="flex items-center justify-between border-b-2 border-violet-600 px-10 py-4">
        <span className="font-display text-sm font-bold text-violet-700">▲ Lumina Influence AI</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">{brand}</span>
      </div>

      <div className="flex-1 overflow-hidden px-10 py-7">{children}</div>

      <div className="flex items-center justify-between border-t border-neutral-200 px-10 py-3 text-[10px] text-neutral-400">
        <span>{t('relatorios.preview.footerNote')}</span>
        <span>{pageNumber} / {totalPages}</span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Blocos                                                                     */
/* -------------------------------------------------------------------------- */

function SectionTitle({ children }) {
  return (
    <h2 className="border-b-2 border-violet-500 pb-2 font-display text-base font-bold uppercase tracking-wide text-neutral-900">
      {children}
    </h2>
  )
}

function MetaCell({ label, value, hint }) {
  return (
    <div>
      <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </span>
      <span className="mt-1 block font-bold text-neutral-900">{value}</span>
      {hint && <span className="block text-xs text-neutral-500">{hint}</span>}
    </div>
  )
}

function Cover({ doc, t }) {
  const campanha = doc.campaign
  return (
    <div className="flex h-full flex-col">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
        {t('relatorios.preview.title')}
      </span>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-neutral-900">
        {doc.report_title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        {campanha.title || campanha.brand_name}
      </p>

      <div className="mt-10 grid grid-cols-2 gap-6 border-t border-neutral-200 pt-6 text-sm">
        <MetaCell label={t('relatorios.preview.preparedFor')} value={campanha.brand_name} />
        <MetaCell
          label={t('relatorios.preview.preparedBy')}
          value="Lumina Influence AI"
          hint={doc.generated_by}
        />
        <MetaCell
          label={t('relatorios.preview.period')}
          value={`${doc.period_start} → ${doc.period_end}`}
        />
        <MetaCell label={t('campanhas.detail.header.budget')} value={`R$ ${doc.budget_brl}`} />
      </div>
    </div>
  )
}

function ExecutiveSummary({ doc, t }) {
  const s = doc.summary
  return (
    <div>
      <SectionTitle>{t('relatorios.preview.executiveSummary')}</SectionTitle>
      <p className="mt-3 text-sm leading-relaxed text-neutral-700">
        {t('relatorios.preview.summaryText', {
          creators: s.influencer_count,
          brand: doc.campaign.brand_name,
          organic: s.avg_organic_pct,
          sentiment: s.avg_sentiment_pct,
          reach: s.total_reach_fmt,
          posts: s.posts_count,
        })}
      </p>
    </div>
  )
}

function KpisSection({ doc, t }) {
  return (
    <section>
      <SectionTitle>{t('relatorios.preview.kpisTitle')}</SectionTitle>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {doc.kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg bg-neutral-50 p-3 ring-1 ring-inset ring-neutral-200">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
              {kpi.label}
            </span>
            <span className="mt-1.5 block font-display text-xl font-extrabold tabular-nums text-neutral-900">
              {kpi.value}
            </span>
            {typeof kpi.change === 'number' && (
              <span className={cn(
                'text-[10px] font-semibold tabular-nums',
                kpi.change > 0 ? 'text-emerald-600' : kpi.change < 0 ? 'text-rose-600' : 'text-neutral-500'
              )}>
                {kpi.change > 0 ? '+' : ''}{kpi.change}%
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

const TH = 'py-2 pr-3 text-[9px] font-bold uppercase tracking-[0.1em] text-neutral-500'
const TD = 'py-2.5 pr-3 tabular-nums text-neutral-700'

function EmptySection({ children }) {
  return <p className="mt-4 text-xs text-neutral-500">{children}</p>
}

function GrowthSection({ doc, t }) {
  return (
    <section>
      <SectionTitle>{t('relatorios.preview.growthTitle')}</SectionTitle>
      {doc.growth.length === 0 ? (
        <EmptySection>{t('relatorios.preview.noPosts')}</EmptySection>
      ) : (
        <table className="mt-4 w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-300">
              <th className={TH}>{t('relatorios.preview.growthPeriod')}</th>
              <th className={cn(TH, 'text-right')}>{t('dashboard.growth.organic')}</th>
              <th className={cn(TH, 'text-right')}>{t('dashboard.growth.paid')}</th>
            </tr>
          </thead>
          <tbody>
            {doc.growth.map((row) => (
              <tr key={row.x} className="border-b border-neutral-100">
                <td className="py-2.5 pr-3 font-semibold text-neutral-900">{row.x}</td>
                <td className={cn(TD, 'text-right')}>{row.organic_fmt}</td>
                <td className={cn(TD, 'text-right')}>{row.paid_fmt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function BenchmarkSection({ doc, t }) {
  return (
    <section>
      <SectionTitle>{t('relatorios.preview.benchmarkTitle')}</SectionTitle>
      {doc.benchmark.length === 0 ? (
        <EmptySection>{t('campanhas.detail.participants.empty')}</EmptySection>
      ) : (
        <table className="mt-4 w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-300">
              <th className={TH}>{t('campanhas.detail.benchmark.columns.creator')}</th>
              <th className={cn(TH, 'text-right')}>{t('campanhas.detail.benchmark.columns.totalReach')}</th>
              <th className={cn(TH, 'text-right')}>{t('campanhas.detail.benchmark.columns.organic')}</th>
              <th className={cn(TH, 'text-right')}>{t('campanhas.detail.benchmark.columns.engagement')}</th>
              <th className={cn(TH, 'text-right')}>{t('campanhas.detail.benchmark.columns.sentiment')}</th>
              <th className={cn(TH, 'text-right')}>{t('campanhas.detail.benchmark.columns.score')}</th>
            </tr>
          </thead>
          <tbody>
            {doc.benchmark.map((inf) => (
              <tr key={inf.display_name} className="border-b border-neutral-100">
                <td className="py-2.5 pr-3 font-semibold text-neutral-900">{inf.display_name}</td>
                <td className={cn(TD, 'text-right')}>{inf.total_reach_fmt}</td>
                <td className={cn(TD, 'text-right')}>{inf.organic_pct}%</td>
                <td className={cn(TD, 'text-right')}>{inf.engagement_rate}%</td>
                <td className={cn(TD, 'text-right')}>{inf.sentiment_index_pct}%</td>
                <td className="py-2.5 text-right font-display font-extrabold tabular-nums text-violet-600">
                  {inf.ai_score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function DiagnosticSection({ doc, t }) {
  return (
    <section>
      <SectionTitle>{t('relatorios.preview.diagnosticTitle')}</SectionTitle>
      {doc.diagnostic.length === 0 ? (
        <EmptySection>{t('relatorios.preview.noAnalysis')}</EmptySection>
      ) : (
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-700">
          {doc.diagnostic.map((d) => (
            <div key={d.display_name} className="rounded-lg bg-neutral-50 p-3 ring-1 ring-inset ring-neutral-200">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-neutral-900">
                  {d.display_name} <span className="text-xs text-neutral-500">— {d.niche}</span>
                </span>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-violet-600">
                  Bot {d.bot_probability}% · Coh. {d.brand_coherence}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600">{d.note}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function RecommendationsSection({ doc, t }) {
  return (
    <section>
      <SectionTitle>{t('relatorios.preview.recommendationsTitle')}</SectionTitle>
      <ol className="mt-4 space-y-3">
        {doc.recommendations.map((rec, i) => (
          <li key={rec.title} className="flex gap-3 text-sm">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
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

const SECTION_COMPONENTS = {
  kpis:            KpisSection,
  growth:          GrowthSection,
  benchmark:       BenchmarkSection,
  diagnostic:      DiagnosticSection,
  recommendations: RecommendationsSection,
}

// Duas seções por página A4, como no PDF.
const SECTIONS_PER_PAGE = 2

/* -------------------------------------------------------------------------- */
/* ReportPreview                                                              */
/* -------------------------------------------------------------------------- */

export default function ReportPreview({ document: doc }) {
  const { t } = useTranslation()

  if (!doc) return null

  const sections = doc.sections || []
  const pageGroups = []
  for (let i = 0; i < sections.length; i += SECTIONS_PER_PAGE) {
    pageGroups.push(sections.slice(i, i + SECTIONS_PER_PAGE))
  }
  const totalPages = 1 + pageGroups.length
  const brand = doc.campaign.brand_name

  return (
    <div className="space-y-6">
      <Page pageNumber={1} totalPages={totalPages} brand={brand} t={t}>
        <div className="flex h-full flex-col gap-8">
          <Cover doc={doc} t={t} />
          <ExecutiveSummary doc={doc} t={t} />
        </div>
      </Page>

      {pageGroups.map((group, idx) => (
        <Page key={idx} pageNumber={idx + 2} totalPages={totalPages} brand={brand} t={t}>
          <div className="flex h-full flex-col gap-7">
            {group.map((key) => {
              const Section = SECTION_COMPONENTS[key]
              return Section ? <div key={key}><Section doc={doc} t={t} /></div> : null
            })}
          </div>
        </Page>
      ))}
    </div>
  )
}
