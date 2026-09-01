import { test, expect } from '@playwright/test'
import { entrarComoAdmin } from './apoio/sessao.js'

const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

/**
 * Gerir quem está na campanha.
 *
 * Até esta frente os participantes só podiam ser escolhidos no momento da
 * criação: depois disso a lista era imutável, num produto cuja unidade de
 * trabalho é justamente a campanha. Recontratar ou dispensar um criador é a
 * decisão que o sistema existe para apoiar, e não havia caminho para ela.
 *
 * O teste monta uma campanha descartável: mexer nas do seed mudaria o cenário
 * do benchmarking, que outras verificações usam.
 */
async function cenario(page) {
  const r = await page.request.post(`${API}/auth/dev-login`, { data: {} })
  const token = (await r.json()).data.tokens.access_token
  const cabecalho = { Authorization: `Bearer ${token}` }

  const criador = await page.request.post(`${API}/influencers`, {
    headers: cabecalho, data: { display_name: `Part ${Date.now()}` },
  })
  const { data: inf } = await criador.json()

  const campanha = await page.request.post(`${API}/campaigns`, {
    headers: cabecalho,
    data: {
      title: `Campanha ${Date.now()}`, brand_name: 'Marca',
      period_start: '2026-01-01', period_end: '2026-02-01',
    },
  })
  const { data: camp } = await campanha.json()
  return { cabecalho, inf, camp }
}

test('adicionar e remover criador da campanha', async ({ page }) => {
  await entrarComoAdmin(page)
  const { cabecalho, inf, camp } = await cenario(page)

  await page.goto(`/app/campanhas/${camp.id}`)
  await page.getByRole('button', { name: /adicionar criador|add creator/i }).click()

  await page.getByLabel(/^Criador$|^Creator$/i).selectOption(inf.id)
  await page.getByLabel(/cachê|fee/i).fill('1500')
  await page.getByRole('button', { name: /^Adicionar$|^Add$/i }).click()

  await expect(page.locator('[data-toast-live]')).toContainText(inf.display_name, { timeout: 20_000 })

  // Chegou ao banco, com o cachê convertido para centavos.
  const detalhe = await page.request.get(`${API}/campaigns/${camp.id}`, { headers: cabecalho })
  const participantes = (await detalhe.json()).data.participants
  expect(participantes.map((p) => p.influencer_id)).toContain(inf.id)

  // Remover: a confirmação declara que o criador permanece — sair de uma
  // campanha não é deixar de existir.
  await page.getByRole('button', { name: /remover da campanha|remove from campaign/i }).first().click()
  await expect(page.getByText(/O que permanece|What stays/i)).toBeVisible()
  await expect(page.getByText(/criador continua cadastrado|creator stays registered/i)).toBeVisible()

  await page.getByLabel(new RegExp(`Digite ${inf.display_name}`, 'i')).fill(inf.display_name)
  await page.getByRole('button', { name: /^Remover$|^Remove$/i }).click()

  await expect
    .poll(async () => {
      const r = await page.request.get(`${API}/campaigns/${camp.id}`, { headers: cabecalho })
      return (await r.json()).data.participants.length
    }, { timeout: 20_000 })
    .toBe(0)

  // E o criador continua existindo.
  const aindaLa = await page.request.get(`${API}/influencers/${inf.id}`, { headers: cabecalho })
  expect(aindaLa.status()).toBe(200)

  await page.request.delete(`${API}/campaigns/${camp.id}`, { headers: cabecalho })
  await page.request.delete(`${API}/influencers/${inf.id}`, { headers: cabecalho })
})
