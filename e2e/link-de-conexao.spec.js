import { test, expect } from '@playwright/test'

import { entrarComoAdmin } from './apoio/sessao.js'

/**
 * Link de conexão: a agência gera, o criador abre sem sessão.
 *
 * A API é simulada no que cria conta (`/connect-link` responde de verdade; a
 * autorização em si não é seguida) — o contrato do back está no pytest
 * (`tests/test_integrations.py`, "Link de conexão para o criador").
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

test('a agência gera o link e o criador vê a página pública sem login', async ({ page, browser, request }) => {
  const criador = await primeiroCriador(request)
  await entrarComoAdmin(page)
  await page.goto(`/app/influenciadores/${criador.id}`)
  await page.getByRole('tab', { name: 'Visão Geral' }).click()

  const linha = page.locator('li').filter({ hasText: 'Instagram' })
  await linha.getByRole('button', { name: 'Link' }).click()
  const campo = page.getByLabel('Endereço do link de conexão')
  await expect(campo).toHaveValue(/\/conectar\/.+/)
  const url = await campo.inputValue()
  await expect(page.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /wa\.me/)

  // Outro navegador, sem sessão nenhuma: é o celular do criador.
  const contexto = await browser.newContext()
  const criadorPagina = await contexto.newPage()
  await criadorPagina.goto(url)
  await expect(criadorPagina.getByRole('heading', { name: 'Conectar seu Instagram' })).toBeVisible()
  await expect(criadorPagina.getByText(criador.display_name, { exact: false })).toBeVisible()
  await expect(criadorPagina.getByRole('button', { name: 'Continuar no Instagram' })).toBeVisible()
  await contexto.close()
})

test('link adulterado mostra erro claro', async ({ page }) => {
  await page.goto('/conectar/nao-e-um-token')
  await expect(page.getByRole('heading', { name: 'Este link não é válido' })).toBeVisible()
})

test('a volta da rede mostra a página de pronto', async ({ page }) => {
  await page.goto('/conectar/concluido?plataforma=instagram')
  await expect(page.getByRole('heading', { name: 'Pronto! Seu Instagram foi conectado' })).toBeVisible()
  await page.goto('/conectar/concluido?plataforma=instagram&erro=access_denied')
  await expect(page.getByRole('heading', { name: 'Você não autorizou o acesso' })).toBeVisible()
})
