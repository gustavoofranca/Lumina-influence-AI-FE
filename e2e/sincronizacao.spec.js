import { test, expect } from '@playwright/test'
import { entrarComoAdmin } from './apoio/sessao.js'

const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

/**
 * Pedir a coleta agora.
 *
 * Antes, conectar uma conta e não ver dado chegar era o comportamento normal: a
 * coleta só acontecia no agendador, de 6 em 6 horas, e nada na tela dizia isso.
 * O endpoint existia desde a B7 e a interface nunca o chamou.
 *
 * O que se mede aqui não é "apareceu um toast": é que o resumo **distingue os
 * casos**. O back-end responde 200 mesmo quando uma conta falha, e um "pronto"
 * único transformaria token revogado em sucesso.
 */
async function primeiroCriador(page) {
  const r = await page.request.post(`${API}/auth/dev-login`, { data: {} })
  const token = (await r.json()).data.tokens.access_token
  const lista = await page.request.get(`${API}/influencers?per_page=1`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return (await lista.json()).data?.[0]?.id
}

test('sincronizar relata o resultado de cada conta', async ({ page }) => {
  await entrarComoAdmin(page)
  const id = await primeiroCriador(page)
  test.skip(!id, 'o seed não tem criador nesta base')

  await page.goto(`/app/influenciadores/${id}`)
  await page.getByRole('tab', { name: /visão geral|overview/i }).click()

  const botao = page.getByRole('button', { name: /sincronizar agora|sync now/i })
  await expect(botao).toBeVisible({ timeout: 20_000 })

  // Sincroniza o teste com a **resposta**, e não com o relógio: o aviso some
  // sozinho em 3,5 s, e uma asserção que só faz polling disputa com o
  // auto-fechar — passava sozinha e falhava na suíte inteira, onde a chamada
  // demora mais. Esperar a resposta põe as duas coisas na mesma linha do tempo.
  const [resposta] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/sync') && r.request().method() === 'POST',
                         { timeout: 60_000 }),
    botao.click(),
  ])
  expect(resposta.status()).toBe(200)

  // O aviso precisa nomear a rede e dizer o que aconteceu com ela — não um
  // "pronto" que serve para qualquer desfecho.
  const aviso = page.locator('[data-toast-live]')
  await expect(aviso).toContainText(
    /Instagram|TikTok|YouTube|Nenhuma conta vinculada/i, { timeout: 10_000 }
  )
  expect((await aviso.innerText()).length).toBeGreaterThan(15)
})

test('o resultado da sincronização é anunciado, não só desenhado', async ({ page }) => {
  await entrarComoAdmin(page)
  const id = await primeiroCriador(page)
  test.skip(!id, 'o seed não tem criador nesta base')

  await page.goto(`/app/influenciadores/${id}`)
  // A região viva existe antes de haver mensagem — é a condição para o leitor
  // de tela anunciar a chegada dela.
  const viva = page.locator('[data-toast-live]')
  await expect(viva).toHaveAttribute('aria-live', /polite|assertive/)
})
