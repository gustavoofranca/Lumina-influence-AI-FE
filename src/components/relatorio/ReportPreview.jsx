import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import LuminaMark from '../ui/LuminaMark.jsx'

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

function Page({ pageNumber, totalPages, children, t, brand, contentRef }) {
  return (
    <div className={cn(
      'relative mx-auto bg-white text-neutral-900',
      'w-full max-w-[820px] aspect-[210/297]',
      'rounded-md shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]',
      'border border-neutral-300/80',
      'flex flex-col'
    )}>
      <div className="flex items-center justify-between border-b-2 border-violet-600 px-10 py-4">
        <span className="flex items-center gap-2 text-violet-700">
          <LuminaMark tone="black" className="w-9" />
          <span className="font-display text-sm font-bold">Lumina Influence AI</span>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">{brand}</span>
      </div>

      <div ref={contentRef} className="flex-1 overflow-hidden px-10 py-7">{children}</div>

      <div className="flex items-center justify-between border-t border-neutral-200 px-10 py-3 text-[10px] text-neutral-600">
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
        {/* Sem post no período não há médias a resumir — o PDF já mostrava
            estado vazio aqui, e a prévia mostrava a frase com os números. */}
        {s.has_data && s.avg_organic_pct == null
          ? t('relatorios.preview.summaryTextNoSplit', {
              creators: s.influencer_count,
              brand: doc.campaign.brand_name,
              sentiment: s.avg_sentiment_pct_fmt,
              reach: s.total_reach_fmt,
              posts: s.posts_count,
            })
          : s.has_data
          ? t('relatorios.preview.summaryText', {
              creators: s.influencer_count,
              brand: doc.campaign.brand_name,
              organic: s.avg_organic_pct_fmt,
              sentiment: s.avg_sentiment_pct_fmt,
              reach: s.total_reach_fmt,
              posts: s.posts_count,
            })
          : t('relatorios.preview.summaryEmpty', {
              creators: s.influencer_count,
              brand: doc.campaign.brand_name,
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
        {/* Segunda linha, igual ao PDF: engajamento bruto e custo por mil. */}
        {doc.summary?.has_data && (doc.kpis_detalhe || []).map((kpi) => (
          <div key={kpi.label} className="rounded-lg bg-neutral-50 p-3 ring-1 ring-inset ring-neutral-200">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
              {kpi.label}
            </span>
            <span className="mt-1.5 block font-display text-xl font-extrabold tabular-nums text-neutral-900">
              {kpi.value}
            </span>
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
                <td className={cn(TD, 'text-right')}>{inf.organic_pct_fmt}</td>
                <td className={cn(TD, 'text-right')}>{inf.engagement_rate_fmt}</td>
                <td className={cn(TD, 'text-right')}>{inf.sentiment_index_pct_fmt}</td>
                <td className="py-2.5 text-right font-display font-extrabold tabular-nums text-violet-600">
                  {inf.ai_score_fmt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {(doc.posts_tabela || []).length > 0 && (
        <>
          <h3 className="mt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-600">
            {t('relatorios.preview.postsTitle')}
          </h3>
          <table className="mt-2 w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-300">
                <th className={TH}>{t('relatorios.preview.postsCols.date')}</th>
                <th className={TH}>{t('relatorios.preview.postsCols.creator')}</th>
                <th className={TH}>{t('relatorios.preview.postsCols.post')}</th>
                <th className={cn(TH, 'text-right')}>{t('relatorios.preview.postsCols.reach')}</th>
                <th className={cn(TH, 'text-right')}>{t('relatorios.preview.postsCols.likes')}</th>
                <th className={cn(TH, 'text-right')}>{t('relatorios.preview.postsCols.comments')}</th>
                <th className={cn(TH, 'text-right')}>{t('relatorios.preview.postsCols.shares')}</th>
                <th className={cn(TH, 'text-right')}>{t('relatorios.preview.postsCols.saves')}</th>
              </tr>
            </thead>
            <tbody>
              {doc.posts_tabela.map((p, i) => (
                <tr key={`${p.data}-${i}`} className="border-b border-neutral-100">
                  <td className={cn(TD, 'whitespace-nowrap')}>{p.data}</td>
                  <td className={TD}>{p.criador}</td>
                  <td className="py-2.5 pr-3 text-neutral-500">{p.legenda}</td>
                  <td className={cn(TD, 'text-right')}>{p.alcance}</td>
                  <td className={cn(TD, 'text-right')}>{p.curtidas}</td>
                  <td className={cn(TD, 'text-right')}>{p.comentarios}</td>
                  <td className={cn(TD, 'text-right')}>{p.compartilhamentos}</td>
                  <td className="py-2.5 text-right tabular-nums text-neutral-700">{p.salvos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
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

/**
 * Análise de vídeo — o que o modelo ouviu, não só o que concluiu.
 *
 * A transcrição é a única parte do documento em que dá para conferir o trabalho
 * do modelo contra o vídeo: sem ela, as notas de roteiro e coerência precisam
 * ser aceitas no escuro. Por isso ela vem como citação, e não como afirmação do
 * sistema — é fala de outra pessoa, transcrita.
 */
function VideoSection({ doc, t }) {
  const videos = doc.video || []
  return (
    <section>
      <SectionTitle>{t('relatorios.preview.videoTitle')}</SectionTitle>
      {videos.length === 0 ? (
        <EmptySection>
          {/* "Sem vídeo" afirmaria algo sobre o conteúdo do criador. O que
              falta é a análise multimodal, e é isso que a tela diz. */}
          {t('relatorios.preview.noVideoAnalysis')}
        </EmptySection>
      ) : (
        <div className="mt-4 space-y-3">
          {videos.map((v, i) => (
            <div
              key={`${v.display_name}-${i}`}
              className="rounded-lg bg-neutral-50 p-3 ring-1 ring-inset ring-neutral-200"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-neutral-900">
                  {v.display_name}
                  {v.caption && (
                    <span className="text-xs text-neutral-500"> — {v.caption}</span>
                  )}
                </span>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-violet-600">
                  {t('relatorios.preview.scriptScore')} {v.script_score_fmt}
                </span>
              </div>

              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                {t('relatorios.preview.transcriptLabel')}
              </p>
              <blockquote className="mt-1 border-l-2 border-violet-500 pl-3 text-xs italic leading-relaxed text-neutral-700">
                “{v.transcript}
                {v.transcript_truncated ? '…' : ''}”
              </blockquote>

              {v.key_phrases?.length > 0 && (
                <p className="mt-2 text-xs text-neutral-600">
                  <span className="font-semibold">
                    {t('relatorios.preview.keyPhrases')}:
                  </span>{' '}
                  {v.key_phrases.join(' · ')}
                </p>
              )}

              <p className="mt-1 text-[10px] text-neutral-400">
                {v.sentiment_label} · {v.analyzed_at} · {v.model_version}
              </p>
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
  video:           VideoSection,
  recommendations: RecommendationsSection,
}

// Espaço entre blocos na folha, em px — o `gap-7` da renderização.
const GAP_ENTRE_BLOCOS = 28

/**
 * Distribui os blocos em folhas A4 pela altura real de cada um.
 *
 * Eram duas seções fixas por folha, com a capa sozinha na primeira: seção
 * curta (KPIs, trajetória) deixava a folha quase vazia, enquanto o PDF corre
 * em fluxo e sai com bem menos páginas. Aqui os blocos são medidos numa folha
 * invisível do mesmo tamanho e empilhados enquanto couberem. Bloco maior que
 * a folha fica sozinho numa.
 */
function empacotar(alturas, disponivel) {
  const paginas = []
  let atual = []
  let usado = 0
  alturas.forEach((h, idx) => {
    const somado = atual.length ? usado + GAP_ENTRE_BLOCOS + h : h
    if (atual.length && somado > disponivel) {
      paginas.push(atual)
      atual = [idx]
      usado = h
    } else {
      atual.push(idx)
      usado = somado
    }
  })
  if (atual.length) paginas.push(atual)
  return paginas
}

/* -------------------------------------------------------------------------- */
/* ReportPreview                                                              */
/* -------------------------------------------------------------------------- */

export default function ReportPreview({ document: doc }) {
  const { t, i18n } = useTranslation()
  const conteudoMedidor = useRef(null)
  const [paginas, setPaginas] = useState(null)

  const sections = doc?.sections || []
  const blocos = doc ? [
    { key: 'cover', node: <Cover doc={doc} t={t} /> },
    { key: 'summary', node: <ExecutiveSummary doc={doc} t={t} /> },
    ...sections
      .filter((key) => SECTION_COMPONENTS[key])
      .map((key) => {
        const Section = SECTION_COMPONENTS[key]
        return { key, node: <Section doc={doc} t={t} /> }
      }),
  ] : []

  useLayoutEffect(() => {
    const conteudo = conteudoMedidor.current
    if (!conteudo) return undefined
    const medir = () => {
      const estilo = getComputedStyle(conteudo)
      const disponivel = conteudo.clientHeight
        - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom)
      const alturas = [...conteudo.querySelectorAll('[data-bloco]')]
        .map((el) => el.getBoundingClientRect().height)
      setPaginas(empacotar(alturas, disponivel))
    }
    // O observador dispara ao começar a observar e de novo quando a folha muda
    // de largura com a janela — a altura dos blocos acompanha.
    const obs = new ResizeObserver(medir)
    obs.observe(conteudo)
    return () => obs.disconnect()
    // Trocar de idioma muda o comprimento dos textos, e com ele a paginação.
  }, [doc, i18n.language])

  if (!doc) return null

  const brand = doc.campaign.brand_name
  // Até a primeira medida, uma folha por bloco: nunca esconde conteúdo.
  const grupos = paginas && paginas.flat().length === blocos.length
    ? paginas
    : blocos.map((_, i) => [i])

  return (
    <div className="relative space-y-6">
      {/* Folha invisível, do mesmo tamanho das reais, só para medir. */}
      <div aria-hidden="true" className="pointer-events-none invisible absolute inset-x-0 top-0 -z-10 h-0 overflow-visible">
        <Page pageNumber={0} totalPages={0} brand={brand} t={t} contentRef={conteudoMedidor}>
          {blocos.map((b) => <div key={b.key} data-bloco>{b.node}</div>)}
        </Page>
      </div>

      {grupos.map((grupo, idx) => (
        <Page key={idx} pageNumber={idx + 1} totalPages={grupos.length} brand={brand} t={t}>
          <div className="flex flex-col gap-7">
            {grupo.map((i) => <div key={blocos[i].key}>{blocos[i].node}</div>)}
          </div>
        </Page>
      ))}
    </div>
  )
}
