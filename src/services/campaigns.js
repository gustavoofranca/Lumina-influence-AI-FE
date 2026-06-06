/** Serviço de campanhas — adapta a API pro formato dos mocks. */
import { api } from '../lib/api.js'

// status do back (draft|active|ended|cancelled) -> status do front (planning|active|completed|paused)
const STATUS_MAP = { draft: 'planning', active: 'active', ended: 'completed', cancelled: 'paused' }
const STATUS_PROGRESS = { active: 64, completed: 100, paused: 35, planning: 0 }

export function adaptCampaign(c, participations = []) {
  const status = STATUS_MAP[c.status] || 'active'
  return {
    id: c.id,
    name: c.title || c.brand_name,
    brand: c.brand_name,
    industry: '',
    startDate: c.period_start,
    endDate: c.period_end,
    budget: Math.round((c.budget_brl_cents || 0) / 100),
    status,
    description: c.title || c.brand_name,
    progress: STATUS_PROGRESS[status] ?? 0,
    participations,
  }
}

export async function listCampaigns() {
  const res = await api.get('/campaigns', { params: { per_page: 100 } })
  return res.data.map((c) => adaptCampaign(c))
}

export async function getCampaign(id) {
  const res = await api.get(`/campaigns/${id}`)
  return adaptCampaign(res.data)
}

/** Benchmarking adaptado pra tabela (rows no formato que o BenchmarkTable espera). */
export async function getCampaignBenchmarking(id) {
  const res = await api.get(`/campaigns/${id}/benchmarking`)
  const d = res.data
  return {
    campaign: adaptCampaign(d.campaign),
    rows: d.influencers.map((r) => ({
      id: r.influencer_id,
      name: r.display_name,
      handle: '',
      totalReach: r.total_reach,
      organicReach: r.organic_pct,
      paidReach: r.paid_pct,
      engagement: r.engagement_rate,
      sentimentScore: Math.round(r.sentiment_index_pct ?? 0),
      resonanceScore: Math.round(r.ai_score ?? 0),
      cost: Math.round((r.cost_brl_cents || 0) / 100),
    })),
  }
}
