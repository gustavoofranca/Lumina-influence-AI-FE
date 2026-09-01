/** Serviço de campanhas — adapta a API pro formato que os componentes esperam. */
import { api } from '../lib/api.js'
import { adaptInfluencerStatus } from './influencers.js'
import { medida, medidaArredondada, parseApiDate } from '../lib/format.js'

// status do back (draft|active|ended|cancelled) -> status do front (planning|active|completed|paused)
const STATUS_MAP = { draft: 'planning', active: 'active', ended: 'completed', cancelled: 'paused' }

/**
 * Progresso da campanha pela fração do período já decorrida.
 * A API não guarda progresso de entregáveis — derivar do calendário é o único
 * número honesto disponível. Campanha em planejamento não começou: 0.
 */
function periodProgress(startDate, endDate, status) {
  if (status === 'planning' || !startDate || !endDate) return 0

  const start = parseApiDate(startDate).getTime()
  const end   = parseApiDate(endDate).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0

  const elapsed = Date.now() - start
  return Math.max(0, Math.min(100, Math.round((elapsed / (end - start)) * 100)))
}

/** Participante como a API devolve na listagem/detalhe: só identidade. */
function adaptParticipant(p) {
  return { influenciadorId: p.influencer_id, name: p.display_name }
}

export function adaptCampaign(c) {
  const status = STATUS_MAP[c.status] || 'active'
  return {
    id: c.id,
    name: c.title || c.brand_name,
    brand: c.brand_name,
    startDate: c.period_start,
    endDate: c.period_end,
    budget: Math.round((c.budget_brl_cents || 0) / 100),
    status,
    progress: periodProgress(c.period_start, c.period_end, status),
    participations: (c.participants || []).map(adaptParticipant),
  }
}

// front (planning|active|completed|paused) -> back (draft|active|ended|cancelled)
const STATUS_PARA_API = { planning: 'draft', active: 'active', completed: 'ended', paused: 'cancelled' }

/**
 * Atualiza a campanha. Envia só o que mudou: o schema do back-end recusa campo
 * desconhecido (`extra="forbid"`) e trata ausência como "não mexer".
 */
export async function updateCampaign(id, campos) {
  const corpo = {}
  if (campos.brand !== undefined)     corpo.brand_name = campos.brand
  if (campos.name !== undefined)      corpo.title = campos.name
  if (campos.startDate !== undefined) corpo.period_start = campos.startDate
  if (campos.endDate !== undefined)   corpo.period_end = campos.endDate
  if (campos.budget !== undefined)    corpo.budget_brl_cents = Math.round(campos.budget * 100)
  if (campos.status !== undefined)    corpo.status = STATUS_PARA_API[campos.status] || campos.status
  const res = await api.patch(`/campaigns/${id}`, corpo)
  return adaptCampaign(res.data)
}

export async function listCampaigns() {
  const res = await api.get('/campaigns', { params: { per_page: 100 } })
  return res.data.map(adaptCampaign)
}

/**
 * Cria a campanha e os vínculos com os criadores numa chamada só.
 * `participants` carrega o cachê em centavos — o back-end grava em
 * campaign_influencers.fee_brl_cents.
 */
export async function createCampaign({ name, brand, startDate, endDate, budget, participants }) {
  const res = await api.post('/campaigns', {
    brand_name: brand,
    title: name,
    period_start: startDate,
    period_end: endDate,
    budget_brl_cents: Math.round(Number(budget) * 100),
    participants: participants.map((p) => ({
      influencer_id: p.id,
      fee_brl_cents: p.feeCents,
    })),
  })
  return adaptCampaign(res.data)
}

export async function getCampaign(id) {
  const res = await api.get(`/campaigns/${id}`)
  return adaptCampaign(res.data)
}

/** Uma linha de benchmarking: métrica + identidade do participante. */
function adaptBenchmarkRow(r) {
  return {
    id:             r.influencer_id,
    name:           r.display_name,
    handle:         r.handle || '',
    niche:          r.niche || '',
    status:         adaptInfluencerStatus(r.status),
    platforms:      r.platforms || [],
    // Soma sem parcela é zero de verdade; razão e score sem base são nulos
    // (ADR-003 do back-end). A distinção é o que separa "medimos e deu zero"
    // de "não medimos".
    followers:      r.followers ?? 0,
    totalReach:     r.total_reach ?? 0,
    posts:          r.posts_count ?? 0,
    organicReach:   medida(r.organic_pct),
    paidReach:      medida(r.paid_pct),
    engagement:     medida(r.engagement_rate),
    sentimentScore: medidaArredondada(r.sentiment_index_pct),
    brandCoherence: medidaArredondada(r.brand_coherence),
    botProbability: medidaArredondada(r.bot_probability),
    resonanceScore: medidaArredondada(r.ai_score),
    deliverables:   r.deliverables || '',
    cost:           Math.round((r.cost_brl_cents || 0) / 100),
  }
}

/**
 * Pivota o radar da API (uma série por influenciador) pro formato do gráfico
 * (uma linha por eixo). As dimensões vêm da própria resposta — não invente
 * eixo que o back-end não mede.
 */
export function adaptRadar(radar) {
  const dimensions = radar?.dimensions || []
  const series     = radar?.series || []
  if (!dimensions.length || !series.length) return { data: [], entities: [] }

  const data = dimensions.map((dimension, i) => {
    const row = { axis: dimension }
    // Dimensão não medida vira null e o radar abre uma lacuna, em vez de
    // desenhar um vértice na origem como se fosse nota zero.
    series.forEach((s) => { row[s.influencer_id] = s.values?.[i] ?? null })
    return row
  })

  return {
    data,
    entities: series.map((s) => ({ key: s.influencer_id, label: s.name })),
  }
}

/**
 * Totais da campanha somados das linhas de benchmarking.
 * A API não tem endpoint de agregado por campanha — a soma dos participantes
 * é o mesmo número, calculado sobre o dado que ela já devolve.
 */
export function sumTotals(rows) {
  if (!rows.length) return { posts: 0, totalReach: 0, avgSentiment: 0 }

  const sentiment = rows.reduce((acc, r) => acc + r.sentimentScore, 0) / rows.length
  return {
    posts:        rows.reduce((acc, r) => acc + r.posts, 0),
    totalReach:   rows.reduce((acc, r) => acc + r.totalReach, 0),
    avgSentiment: Math.round(sentiment),
  }
}

export async function getCampaignBenchmarking(id) {
  const res = await api.get(`/campaigns/${id}/benchmarking`)
  const rows = res.data.influencers.map(adaptBenchmarkRow)
  return {
    rows,
    radar:  adaptRadar(res.data.radar),
    totals: sumTotals(rows),
  }
}

/**
 * Exclui a campanha.
 *
 * O cascade leva as participações — quem estava nela —, mas **não** os posts
 * nem os relatórios: os dois têm `SET NULL` e sobrevivem desvinculados. Vale
 * dizer isso na confirmação: falar só do que se perde faz o usuário imaginar
 * o pior, e aqui o pior é falso.
 */
export async function excluirCampanha(id) {
  await api.delete(`/campaigns/${id}`)
}
