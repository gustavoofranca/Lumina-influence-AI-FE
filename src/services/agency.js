/** Serviço da agência: dados cadastrais, plano e consumo. */
import { api } from '../lib/api.js'

export function adaptAgency(a) {
  return {
    id: a.id,
    name: a.name,
    cnpj: a.cnpj || '',
    planId: a.plan_id,
    plan: a.plan ? adaptPlan(a.plan) : null,
    createdAt: a.created_at,
  }
}

export function adaptPlan(p) {
  return {
    id: p.id,
    name: p.name,
    priceCents: p.price_brl_cents,
    maxInfluencers: p.max_influencers,
    maxAnalysesPerMonth: p.max_analyses_per_month,
    allowBenchmarking: p.allow_benchmarking,
  }
}

/** A listagem devolve só a própria agência (isolamento multi-tenant). */
export async function getAgency() {
  const res = await api.get('/agencies')
  const first = res.data?.[0]
  return first ? adaptAgency(first) : null
}

export async function updateAgency(id, { name, cnpj }) {
  const res = await api.patch(`/agencies/${id}`, { name, cnpj: cnpj || null })
  return adaptAgency(res.data)
}

/** `limit` nulo é "sem teto no plano" — diferente de teto zero. */
function adaptUsageRow(row) {
  return { used: row.used ?? 0, limit: row.limit ?? null }
}

export async function getAgencyUsage(id) {
  const res = await api.get(`/agencies/${id}/usage`)
  return {
    influencers: adaptUsageRow(res.data.influencers),
    analyses: adaptUsageRow(res.data.analyses),
    reports: adaptUsageRow(res.data.reports),
  }
}

export async function listPlans() {
  const res = await api.get('/plans')
  return res.data.map(adaptPlan)
}

/**
 * Contas sociais da agência agrupadas por plataforma.
 *
 * A conexão OAuth é por influenciador (SocialAccount pertence a um criador),
 * não por agência: esta visão resume o que já está conectado, e conectar
 * acontece na tela do influenciador, onde existe esse contexto.
 */
export async function listPlatformConnections() {
  const res = await api.get('/social-accounts', { params: { per_page: 200 } })

  const porPlataforma = new Map()
  for (const sa of res.data) {
    const atual = porPlataforma.get(sa.platform) || {
      platform: sa.platform,
      accounts: 0,
      followers: 0,
      lastSync: null,
    }
    atual.accounts += 1
    atual.followers += sa.follower_count || 0
    if (sa.last_synced_at && (!atual.lastSync || sa.last_synced_at > atual.lastSync)) {
      atual.lastSync = sa.last_synced_at
    }
    porPlataforma.set(sa.platform, atual)
  }
  return [...porPlataforma.values()].sort((a, b) => b.accounts - a.accounts)
}
