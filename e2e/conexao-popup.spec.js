import { test, expect } from '@playwright/test'

import { coletarErros, entrarComoAdmin } from './apoio/sessao.js'

/**
 * Conectar conta social numa janela pequena, sem tirar o painel da aba.
 *
 * A URL do provedor é simulada (`page.route` no `/connect`): o teste é do
 * contrato do front — abrir a janela, receber o aviso pelo canal, fechar,
 * recarregar o cartão — e não pode criar conta de verdade no banco. O que o
 * callback faz com o `state` de popup está no pytest
 * (`tests/test_integrations.py`, "Conexão em janela popup").
 */
const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

async function primeiroCriador(request) {
  const login = await request.post(`${API}/auth/dev-login`, { data: {} })
  const { data } = await login.json()
  const lista = await request.get(`${API}/influencers?per_page=1`, {
    headers: { Authorization: `Bearer ${data.tokens.access_token}` },
  })
  return (await lista.json()).data[0]
}

function linhaDaRede(page, rede) {
  return page.locator('li').filter({ hasText: rede })
}

test('conectar abre janela pequena, o painel fica na aba e recebe o aviso', async ({ page, request, baseURL }) => {
  const erros = coletarErros(page)
  const criador = await primeiroCriador(request)
  await entrarComoAdmin(page)

  let pediuPopup = null
  await page.route('**/api/v1/integrations/instagram/connect**', async (rota) => {
    pediuPopup = new URL(rota.request().url()).searchParams.get('modo')
    const concluida = `${baseURL}/conexao/concluida?plataforma=instagram&influenciador=${criador.id}&popup=1`
    await rota.fulfill({ json: { data: { auth_url: concluida, platform: 'instagram' } } })
  })

  await page.goto(`/app/influenciadores/${criador.id}`)
  await page.getByRole('tab', { name: 'Visão Geral' }).click()
  const urlDoPainel = page.url()

  const [janela] = await Promise.all([
    page.waitForEvent('popup'),
    linhaDaRede(page, 'Instagram').getByRole('button', { name: 'Conectar' }).click(),
  ])
  expect(pediuPopup).toBe('popup')
  await janela.waitForEvent('close')

  // O painel não saiu do lugar e mostrou o aviso de sucesso.
  expect(page.url()).toBe(urlDoPainel)
  await expect(page.getByText('Instagram conectado com sucesso.')).toBeVisible()
  expect(erros).toEqual([])
})

test('recusa na janela vira mensagem no cartão', async ({ page, request, baseURL }) => {
  const criador = await primeiroCriador(request)
  await entrarComoAdmin(page)
  await page.route('**/api/v1/integrations/instagram/connect**', (rota) => rota.fulfill({
    json: { data: {
      auth_url: `${baseURL}/conexao/concluida?plataforma=instagram&influenciador=${criador.id}&popup=1&erro=access_denied`,
      platform: 'instagram',
    } },
  }))

  await page.goto(`/app/influenciadores/${criador.id}`)
  await page.getByRole('tab', { name: 'Visão Geral' }).click()
  const [janela] = await Promise.all([
    page.waitForEvent('popup'),
    linhaDaRede(page, 'Instagram').getByRole('button', { name: 'Conectar' }).click(),
  ])
  await janela.waitForEvent('close')
  await expect(page.getByText(/autorização foi recusada/)).toBeVisible()
})

test('com popup bloqueada, segue na própria aba sem pedir modo popup', async ({ page, request }) => {
  const criador = await primeiroCriador(request)
  await entrarComoAdmin(page)
  await page.addInitScript(() => { window.open = () => null })

  let modo = 'nao-chamou'
  await page.route('**/api/v1/integrations/instagram/connect**', async (rota) => {
    modo = new URL(rota.request().url()).searchParams.get('modo')
    await rota.fulfill({ json: { data: { auth_url: 'about:blank#provedor', platform: 'instagram' } } })
  })

  await page.goto(`/app/influenciadores/${criador.id}`)
  await page.getByRole('tab', { name: 'Visão Geral' }).click()
  await linhaDaRede(page, 'Instagram').getByRole('button', { name: 'Conectar' }).click()

  await expect(page).toHaveURL(/about:blank#provedor/)
  expect(modo).toBeNull()
})
