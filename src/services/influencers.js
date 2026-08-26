/** Serviço de influenciadores — adapta o snake_case da API pro formato dos mocks. */
import { api } from '../lib/api.js'

// status do back (active|paused|archived) -> status visual do front (active|monitoring|risk)
const STATUS_MAP = { active: 'active', paused: 'monitoring', archived: 'risk' }

/** Único lugar que traduz status de influenciador — usado também por campanhas. */
export function adaptInfluencerStatus(status) {
  return STATUS_MAP[status] || 'active'
}

export function adaptInfluencer(i) {
  const m = i.metrics || {}
  const handle = i.social_accounts?.[0]?.handle
  return {
    id: i.id,
    name: i.display_name,
    handle: handle ? `@${handle}` : '',
    niche: i.niche,
    bio: i.bio,
    platforms: i.platforms || [],
    followers: i.total_followers || 0,
    status: STATUS_MAP[i.status] || 'active',
    // métricas (só vêm com enriched=true)
    engagement: m.engagement_rate ?? 0,
    organicReach: m.organic_pct ?? 0,
    paidReach: m.paid_pct ?? 0,
    sentimentScore: m.sentiment_index_pct ?? 0,
    brandCoherence: m.brand_coherence ?? 0,
    botProbability: m.bot_probability ?? 0,
    safetyRating: m.safety_rating ?? '—',
    resonanceScore: Math.round(m.resonance_score ?? 0),
    viralPotential: m.viral_potential ?? 'medium',
    lastAnalysis: m.last_analysis_at ? m.last_analysis_at.slice(0, 10) : null,
    lastAnalysisId: null,
  }
}

export async function listInfluencers({ enriched = true } = {}) {
  const res = await api.get('/influencers', { params: { enriched: enriched ? 'true' : undefined, per_page: 100 } })
  return res.data.map(adaptInfluencer)
}

export async function getInfluencer(id) {
  // enriched=true: a tela de analise mostra engajamento, sentimento e bot,
  // que so vem no objeto metrics. Sem isso o adaptador cai no fallback 0.
  const res = await api.get(`/influencers/${id}`, { params: { enriched: 'true' } })
  return adaptInfluencer(res.data)
}

export async function getInfluencerAnalysis(id) {
  const res = await api.get(`/influencers/${id}/analysis`)
  return res.data
}

const PLATAFORMA_LABEL = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' }

export function adaptAnalysisHistory(a) {
  const plataforma = PLATAFORMA_LABEL[a.platform] || a.platform || '—'
  const formato = a.post_type ? ` · ${a.post_type}` : ''
  return {
    id: a.analysis_id.slice(0, 8),
    data: a.analyzed_at,
    escopo: `${plataforma}${formato}`,
    brandCoherence: Math.round(a.brand_coherence ?? 0),
    sentimentScore: Math.round(a.sentiment_index_pct ?? 0),
  }
}

export async function getInfluencerAnalysisHistory(id) {
  const res = await api.get(`/influencers/${id}/analyses`)
  return res.data.map(adaptAnalysisHistory)
}

export function adaptPost(p) {
  // sentiment_score vem em -1..1; o front mostra 0-100
  const sent = p.sentiment_score != null ? Math.round((p.sentiment_score + 1) / 2 * 100) : 0
  return {
    id: p.id,
    titulo: p.caption || p.post_type,
    data: p.posted_at,
    plataforma: p.platform,
    alcance: p.reach_total,
    sentimentScore: sent,
    botProbability: p.bot_probability != null ? Math.round(p.bot_probability) : 0,
  }
}

export async function getInfluencerPosts(id, limit = 20) {
  const res = await api.get(`/influencers/${id}/posts`, { params: { limit } })
  return res.data.map(adaptPost)
}

/** Adapta diagnostic_kpis da API pros 4 KPIs da tela de diagnóstico. */
export function adaptDiagnosticKpis(dk) {
  if (!dk) return null
  const round = (v) => (v != null ? Math.round(v) : '—')
  return [
    { key: 'brandCoherence', value: String(round(dk.brand_coherence)), suffix: '/100' },
    { key: 'sentimentIndex', value: String(round(dk.sentiment_index_pct)), suffix: '%' },
    { key: 'safetyRating', value: dk.safety_rating || '—', hint: dk.safety_rating === 'A' ? 'Top tier' : undefined },
    { key: 'botProbability', value: String(round(dk.bot_probability)), suffix: '%' },
  ]
}

// A API nomeia as dimensões em snake_case; as chaves de tradução são camelCase.
const NEURAL_KEY_MAP = {
  script_accuracy:  'scriptAccuracy',
  tone_matching:    'toneMatching',
  demographic_sync: 'demographicSync',
}

const CLUSTER_KEY_MAP = {
  technical_enthusiasm: 'technical',
  purchase_intent:      'purchase',
  neutral:              'neutral',
  value_skepticism:     'skepticism',
}

export function adaptAudienceIntegrity(a) {
  if (!a) return null
  const totals = a.totals || {}
  return {
    organic:    a.organic ?? 0,
    suspicious: a.suspicious ?? 0,
    bots:       a.bots ?? 0,
    totals: {
      verifiedHumans: totals.verified_humans ?? 0,
      suspicious:     totals.suspicious ?? 0,
      bots:           totals.bots ?? 0,
    },
  }
}

export function adaptNeuralConfidence(rows) {
  return (rows || []).map((r) => ({
    key: NEURAL_KEY_MAP[r.key] || r.key,
    value: Math.round(r.value ?? 0),
  }))
}

export function adaptSentimentClusters(rows) {
  return (rows || []).map((r) => ({
    key: CLUSTER_KEY_MAP[r.key] || r.key,
    value: Math.round(r.value ?? 0),
  }))
}

export function adaptRecommendations(rows) {
  return (rows || []).map((r, i) => ({
    id: `rec-${i + 1}`,
    priority: r.priority,
    title: r.title,
    description: r.description,
  }))
}

/**
 * Nuvem de palavras. A API devolve peso absoluto (contagem), e o componente
 * dimensiona a pílula numa escala 0-1 — daí a normalização pelo maior peso.
 * O sentimento por palavra não é classificado pelo back-end, então todas saem
 * como neutras em vez de receberem uma cor que afirmaria algo não medido.
 */
export function adaptKeywords(rows) {
  const list = rows || []
  const max = Math.max(1, ...list.map((k) => k.weight ?? 0))
  return list.map((k) => ({
    word: k.word,
    weight: (k.weight ?? 0) / max,
    sentiment: 'neutral',
  }))
}
