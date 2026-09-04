import { test, expect } from '@playwright/test'

import { entrarComoAdmin } from './apoio/sessao.js'

/**
 * Estado da conta social vem do campo `connected` do payload, nunca da
 * existência do registro.
 *
 * A distinção não é acadêmica: `disconnect_account` apaga os tokens e
 * **preserva** a SocialAccount, para não levar junto o histórico de posts. Em
 * 27/08 o front tratava como conectada qualquer conta que existisse, então o
 * botão "Desconectar" devolvia 200 e a tela não mudava — havia 28 contas no
 * banco, nenhuma com token.
 */
const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

async function influenciadorComConta(request) {
  const login = await request.post(`${API}/auth/dev-login`, { data: {} })
  const { data } = await login.json()
  const cabecalho = { Authorization: `Bearer ${data.tokens.access_token}` }

  const lista = await request.get(`${API}/influencers?per_page=20`, { headers: cabecalho })
  const { data: influenciadores } = await lista.json()

  for (const inf of influenciadores) {
    const r = await request.get(`${API}/influencers/${inf.id}`, { headers: cabecalho })
    const { data: detalhe } = await r.json()
    if (detalhe.social_accounts?.length) return detalhe
  }
  throw new Error('nenhum criador com conta social no seed')
}

test('conta sem token aparece como não coletando, não como conectada', async ({
  page,
  request,
}) => {
  const criador = await influenciadorComConta(request)
  await entrarComoAdmin(page)

  // Mesmo registro, sem token: é o estado em que o "Desconectar" deixa a conta.
  // O glob precisa tolerar a query (`?enriched=true`): sem isso a rota não casa
  // e o teste passa a medir o payload real.
  await page.route(new RegExp(`/influencers/${criador.id}(\\?|$)`), async (rota) => {
    const resposta = await rota.fetch()
    const corpo = await resposta.json()
    corpo.data.social_accounts = corpo.data.social_accounts.map((c) => ({
      ...c,
      connected: false,
    }))
    await rota.fulfill({ response: resposta, json: corpo })
  })

  await page.goto(`/app/influenciadores/${criador.id}`)
  await page.getByRole('tab', { name: 'Visão Geral' }).click()

  await expect(page.locator('main')).toContainText(/vinculada, sem coleta ativa/i)
  await expect(page.getByRole('button', { name: 'Desconectar' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Conectar' }).first()).toBeVisible()
})

test('conta com token oferece desconectar', async ({ page, request }) => {
  const criador = await influenciadorComConta(request)
  await entrarComoAdmin(page)

  // Mesmo registro do teste acima, com o sinal invertido. O par é o teste: os
  // dois casos partem do MESMO payload e diferem só em `connected`, então o que
  // fica provado é que a tela lê o campo — e não a existência do registro, que
  // é exatamente o defeito de 27/08.
  //
  // Este caso era montado sobre o seed, procurando no banco uma conta com
  // token. Só que `seed_data.py` cria toda SocialAccount sem
  // `access_token_encrypted`, de propósito: nenhuma delas passou por OAuth.
  // Não havia conta conectada para achar, e o teste vinha passando sobre
  // resíduo de estado deixado por conexão manual — verde que dependia de um
  // banco específico, não do comportamento.
  await page.route(new RegExp(`/influencers/${criador.id}(\\?|$)`), async (rota) => {
    const resposta = await rota.fetch()
    const corpo = await resposta.json()
    corpo.data.social_accounts = corpo.data.social_accounts.map((c, i) => ({
      ...c,
      connected: i === 0,
    }))
    await rota.fulfill({ response: resposta, json: corpo })
  })

  await page.goto(`/app/influenciadores/${criador.id}`)
  await page.getByRole('tab', { name: 'Visão Geral' }).click()

  await expect(page.getByRole('button', { name: 'Desconectar' })).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Desconectar' })).toBeVisible()
})
