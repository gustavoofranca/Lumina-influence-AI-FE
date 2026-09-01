/** Serviço de influenciadores — adapta o snake_case da API pro formato dos mocks. */
import { api } from '../lib/api.js'
import { medida, medidaArredondada } from '../lib/format.js'

// status do back (active|paused|archived) -> status visual do front (active|monitoring|risk)
const STATUS_MAP = { active: 'active', paused: 'monitoring', archived: 'risk' }

/** Único lugar que traduz status de influenciador — usado também por campanhas. */
export function adaptInfluencerStatus(status) {
  return STATUS_MAP[status] || 'active'
}

export function adaptInfluencer(i) {
  const m = i.metrics || {}
  // A conta de maior audiência responde pelo criador. Pegar a primeira da lista
  // fazia o @ do cabeçalho mudar de acordo com a ordem em que o banco devolveu
  // as contas: reconectar o YouTube trocou "@anapsouza" por "@G".
  const principal = (i.social_accounts || []).reduce(
    (maior, sa) => ((sa.follower_count ?? 0) > (maior?.follower_count ?? -1) ? sa : maior),
    null
  )
  const handle = principal?.handle
  return {
    id: i.id,
    name: i.display_name,
    handle: handle ? `@${handle}` : '',
    niche: i.niche,
    bio: i.bio,
    platforms: i.platforms || [],
    // Uma entrada por conta vinculada — a tela de conexões precisa do id de
    // cada SocialAccount para desvincular, não só da lista de plataformas.
    socialAccounts: (i.social_accounts || []).map((sa) => ({
      id: sa.id,
      platform: sa.platform,
      handle: sa.handle,
      followers: sa.follower_count ?? 0,
      lastSync: sa.last_synced_at || null,
      // A conta sobrevive à desconexão para preservar os posts: existir não é
      // estar conectada, e só o back-end sabe se ainda há token.
      connected: sa.connected === true,
    })),
    followers: i.total_followers || 0,
    status: STATUS_MAP[i.status] || 'active',
    // métricas (só vêm com enriched=true)
    engagement: medida(m.engagement_rate),
    organicReach: medida(m.organic_pct),
    paidReach: medida(m.paid_pct),
    sentimentScore: medida(m.sentiment_index_pct),
    brandCoherence: medida(m.brand_coherence),
    botProbability: medida(m.bot_probability),
    safetyRating: m.safety_rating ?? '—',
    resonanceScore: medidaArredondada(m.resonance_score),
    viralPotential: medida(m.viral_potential),
    // Instante completo, sem .slice(0,10): truncar para "2026-08-27" faz
    // `new Date` ler meia-noite UTC, que em UTC-3 exibe o dia anterior.
    lastAnalysis: m.last_analysis_at || null,
    lastAnalysisId: null,
  }
}

export async function listInfluencers({ enriched = true } = {}) {
  const res = await api.get('/influencers', { params: { enriched: enriched ? 'true' : undefined, per_page: 100 } })
  return res.data.map(adaptInfluencer)
}

export async function createInfluencer({ name, handle, platforms = [] }) {
  const res = await api.post('/influencers', { display_name: name })
  const criado = res.data

  // A API modela conta social como recurso proprio: o influenciador nasce
  // primeiro e cada rede e vinculada em seguida. Sequencial de proposito, para
  // que a primeira falha interrompa e seja reportada em vez de deixar metade
  // das contas criadas sem ninguem saber.
  const semArroba = (handle || '').trim().replace(/^@/, '')
  if (semArroba) {
    for (const plataforma of platforms) {
      await api.post('/social-accounts', {
        influencer_id: criado.id,
        platform: plataforma,
        handle: semArroba,
      })
    }
  }
  return adaptInfluencer(criado)
}

export async function getInfluencer(id) {
  // enriched=true: a tela de analise mostra engajamento, sentimento e bot,
  // que so vem no objeto metrics. Sem isso o adaptador cai no fallback 0.
  const res = await api.get(`/influencers/${id}`, { params: { enriched: 'true' } })
  return adaptInfluencer(res.data)
}

/**
 * Exclusão definitiva do criador.
 *
 * O back-end faz delete físico com cascade: leva junto as contas sociais, os
 * posts coletados, os comentários e as análises geradas. Não há soft delete e
 * não há como desfazer — daí a confirmação digitada na interface.
 *
 * É também o caminho que a página pública de exclusão de dados promete ao
 * titular; mudar este contrato exige revisar aquele texto.
 */
export async function deleteInfluencer(id) {
  await api.delete(`/influencers/${id}`)
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
    brandCoherence: medidaArredondada(a.brand_coherence),
    sentimentScore: medidaArredondada(a.sentiment_index_pct),
  }
}

export async function getInfluencerAnalysisHistory(id) {
  const res = await api.get(`/influencers/${id}/analyses`)
  return res.data.map(adaptAnalysisHistory)
}

export function adaptPost(p) {
  // sentiment_score vem em -1..1; o front mostra 0-100. Post ainda não
  // analisado não tem sentimento nem probabilidade de bot: null, não zero —
  // zero aqui seria "sentimento péssimo" e "nenhum bot", duas afirmações.
  const sent = p.sentiment_score == null ? null : Math.round((p.sentiment_score + 1) / 2 * 100)
  return {
    id: p.id,
    titulo: p.caption || p.post_type,
    data: p.posted_at,
    plataforma: p.platform,
    alcance: p.reach_total,
    sentimentScore: sent,
    botProbability: medidaArredondada(p.bot_probability),
  }
}

/**
 * Dispara uma nova análise de IA no post indicado.
 *
 * Síncrona e cara: leva ~25s no banco local e ~50s no gerenciado, e consome
 * uma das 20 requisições diárias do free tier do Gemini. Um 429 com
 * `code === 'gemini_quota_exceeded'` significa cota do dia esgotada — esperar
 * não resolve, só o dia seguinte.
 */
export async function analyzePost(postId) {
  const res = await api.post(`/posts/${postId}/analyze`)
  return res.data
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
  // Sem análise o back-end devolve null e o cartão mostra estado vazio: a
  // composição da audiência não é derivável de nada (ADR-003).
  if (!a) return null
  const totals = a.totals || {}
  return {
    organic:    a.organic,
    suspicious: a.suspicious,
    bots:       a.bots,
    totals: {
      verifiedHumans: totals.verified_humans ?? 0,
      suspicious:     totals.suspicious ?? 0,
      bots:           totals.bots ?? 0,
    },
  }
}

export function adaptNeuralConfidence(rows) {
  // O back-end já omite a dimensão não medida; lista vazia aciona o estado
  // vazio do cartão, em vez de três barras zeradas.
  return (rows || []).map((r) => ({
    key: NEURAL_KEY_MAP[r.key] || r.key,
    value: medidaArredondada(r.value),
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
