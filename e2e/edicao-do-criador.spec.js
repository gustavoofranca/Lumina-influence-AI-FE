import { test, expect } from '@playwright/test'
import { entrarComoAdmin } from './apoio/sessao.js'

const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

/**
 * Nome, nicho e bio do criador apareciam na tela e vinham só do seed: a API
 * aceitava `PATCH` desde a B4 e não havia campo em lugar nenhum. Era a mesma
 * família das outras omissões — dado exibido que ninguém podia corrigir.
 */
test('editar nicho e bio grava e sobrevive ao recarregar', async ({ page }) => {
  await entrarComoAdmin(page)
  const r = await page.request.post(`${API}/auth/dev-login`, { data: {} })
  const token = (await r.json()).data.tokens.access_token
  const cabecalho = { Authorization: `Bearer ${token}` }

  const criado = await page.request.post(`${API}/influencers`, {
    headers: cabecalho, data: { display_name: `Edicao ${Date.now()}` },
  })
  const { data: inf } = await criado.json()

  await page.goto(`/app/influenciadores/${inf.id}`)
  await page.getByRole('button', { name: /^Editar$|^Edit$/i }).click()

  await page.getByLabel(/^Nicho$|^Niche$/i).fill('Beauty & Skincare')
  await page.getByLabel(/^Bio$/i).fill('Criadora de conteúdo sobre cuidados com a pele.')
  await page.getByRole('button', { name: /^Salvar$|^Save$/i }).click()

  await expect(page.locator('[data-toast-live]')).toContainText(
    /atualizados|updated/i, { timeout: 20_000 }
  )

  // Chegou ao banco, e não só ao estado da tela.
  const depois = await page.request.get(`${API}/influencers/${inf.id}`, { headers: cabecalho })
  const dados = (await depois.json()).data
  expect(dados.niche).toBe('Beauty & Skincare')
  expect(dados.bio).toContain('cuidados com a pele')

  await page.reload()
  await expect(page.getByText('Beauty & Skincare').first()).toBeVisible({ timeout: 20_000 })

  await page.request.delete(`${API}/influencers/${inf.id}`, { headers: cabecalho })
})
