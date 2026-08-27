/** Serviço do dashboard — busca da API e adapta pro formato que os componentes esperam. */
import { api } from '../lib/api.js'

const PILL_KEY_MAP = {
  high_retention: 'retention',
  positive_sentiment: 'sentiment',
  bot_alert: 'botAlert',
}

function fmtBrlFromCents(cents) {
  if (cents == null) return '—'
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
}

function adaptKpis(k) {
  return [
    { key: 'roi', value: k.roi.value_pct != null ? `${k.roi.value_pct}%` : '—',
      change: k.roi.change ?? undefined, changeType: k.roi.change_type },
    { key: 'engagement', value: k.engagement_rate.value_pct != null ? `${k.engagement_rate.value_pct}%` : '—',
      change: k.engagement_rate.change ?? undefined, changeType: k.engagement_rate.change_type },
    { key: 'cac', value: fmtBrlFromCents(k.cac.value_brl_cents), change: undefined, hint: k.cac.hint },
    { key: 'active', value: String(k.active_influencers.value), change: undefined },
  ]
}

function adaptFeatured(f) {
  if (!f) return null
  return {
    influencerId: f.influencer_id,
    influencerName: f.influencer_name,
    analysisId: (f.analysis_id || '').slice(0, 8),
    transcript: f.transcript || '—',
    brandCoherence: Math.round(f.brand_coherence || 0),
    // O valor vem do back-end: o rótulo traz um {{valor}} e não um número
    // escrito à mão, que seria o mesmo para todos os criadores.
    pills: (f.pills || []).map((p) => ({
      key: PILL_KEY_MAP[p.key] || p.key,
      variant: p.variant,
      valuePct: p.value_pct ?? null,
    })),
  }
}

function adaptTopNetworks(rows) {
  return (rows || []).map((r) => ({
    id: r.influencer_id,
    name: r.display_name,
    niche: r.niche,
    handle: r.handle || '',
    followers: r.followers || 0,
    resonanceScore: Math.round(r.resonance_score || 0),
    viralPotential: r.viral_potential,
    status: r.status === 'active' ? 'active' : r.status === 'paused' ? 'monitoring' : 'risk',
  }))
}

/** GET /dashboard/overview adaptado. */
export async function getOverview({ period = '30d', campaignId } = {}) {
  const res = await api.get('/dashboard/overview', {
    params: { period, campaign_id: campaignId && campaignId !== 'all' ? campaignId : undefined },
  })
  const d = res.data
  return {
    kpis: adaptKpis(d.kpis),
    growth: d.growth_trajectory,             // [{x, organic, paid}]
    featured: adaptFeatured(d.featured_diagnosis),
    topNetworks: adaptTopNetworks(d.top_performing),
  }
}

export async function getNetworkDensity() {
  const res = await api.get('/dashboard/network-density')
  return res.data // { value, total, connected }
}

/** Lista de campanhas pro filtro do dashboard. */
export async function getCampaignOptions() {
  const res = await api.get('/campaigns', { params: { per_page: 100 } })
  return [
    { value: 'all', name: 'Todas as campanhas' },
    ...res.data.map((c) => ({ value: c.id, name: c.title || c.brand_name })),
  ]
}
