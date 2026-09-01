/** Serviço de integrações — OAuth das contas sociais de um criador. */
import { api } from '../lib/api.js'

/**
 * URL de autorização para vincular uma conta ao criador.
 *
 * Devolve a URL em vez de redirecionar: quem navega é o browser, e a chamada
 * precisa do Bearer, que só existe aqui. Lança ApiError com
 * `code === 'platform_not_configured'` quando a plataforma não tem credencial
 * no ambiente — caso comum em desenvolvimento, e que a tela trata como estado,
 * não como falha.
 */
export async function getConnectUrl(influencerId, platform) {
  const res = await api.get(`/integrations/${platform}/connect`, {
    params: { influencer_id: influencerId },
  })
  return res.data.auth_url
}

/**
 * Desliga a coleta de uma conta conectada.
 *
 * `purgarColetado` também apaga as publicações já coletadas daquela conta e os
 * comentários vinculados a elas. O padrão preserva: desligar a coleta não deve
 * apagar o trabalho de análise junto. Devolve quantos posts foram apagados.
 */
export async function disconnectAccount(platform, socialAccountId, { purgarColetado = false } = {}) {
  const res = await api.post(`/integrations/${platform}/disconnect/${socialAccountId}`, {
    purge_collected: purgarColetado,
  })
  return res.data
}

/**
 * Força a coleta das contas conectadas de um criador.
 *
 * Devolve o resultado **por conta**, e o chamador precisa olhar cada um: o
 * back-end responde 200 mesmo quando uma conta falha, com `status` dizendo o
 * que houve — `synced`, `simulated`, `not_connected`, `token_revoked` ou
 * `rate_limited`. Resumir tudo como "sincronizado" transformaria token
 * revogado em sucesso, que é a mesma família de defeito que o projeto persegue.
 */
export async function sincronizarContas(influencerId) {
  const res = await api.post(`/influencers/${influencerId}/sync`)
  return res.data
}
