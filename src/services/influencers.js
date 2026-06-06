/** Serviço de influenciadores — adapta o snake_case da API pro formato dos mocks. */
import { api } from '../lib/api.js'

// status do back (active|paused|archived) -> status visual do front (active|monitoring|risk)
const STATUS_MAP = { active: 'active', paused: 'monitoring', archived: 'risk' }

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
  const res = await api.get(`/influencers/${id}`)
  return adaptInfluencer(res.data)
}

export async function getInfluencerAnalysis(id) {
  const res = await api.get(`/influencers/${id}/analysis`)
  return res.data
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
