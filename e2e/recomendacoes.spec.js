import { test, expect } from '@playwright/test'
import { entrarComoAdmin } from './apoio/sessao.js'

const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

/**
 * Aceitar uma recomendação da IA precisa **acontecer**.
 *
 * Antes desta frente a decisão vivia num `useState`: o cartão trocava de
 * aparência e nada mais. Recarregar a página desfazia tudo, e ninguém
 * respondia pelo aceite. Numa ferramenta de auditoria isso não é detalhe de
 * interface — é o registro da decisão, que é parte do produto.
 *
 * O teste mede as duas coisas que faltavam: sobreviver ao F5, e dizer quem
 * decidiu.
 */
async function criadorComRecomendacao(page) {
  const r = await page.request.post(`${API}/auth/dev-login`, { data: {} })
  const token = (await r.json()).data.tokens.access_token
  const cabecalho = { Authorization: `Bearer ${token}` }

  const lista = await page.request.get(`${API}/influencers?per_page=100`, { headers: cabecalho })
  for (const inf of (await lista.json()).data) {
    const a = await page.request.get(`${API}/influencers/${inf.id}/analysis`, { headers: cabecalho })
    const dados = (await a.json()).data
    if (dados?.recommendations?.length) return { id: inf.id, cabecalho, dados }
  }
  return null
}

test('a decisão sobre a recomendação sobrevive ao recarregar', async ({ page }) => {
  await entrarComoAdmin(page)
  const alvo = await criadorComRecomendacao(page)
  test.skip(!alvo, 'o seed não tem criador com recomendação nesta base')

  // Começa limpo: outra execução pode ter deixado decisão gravada.
  for (const rec of alvo.dados.recommendations) {
    if (rec.decision) {
      await page.request.delete(
        `${API}/influencers/${alvo.id}/recommendations/${rec.index}?analysis_id=${alvo.dados.latest_analysis_id}`,
        { headers: alvo.cabecalho }
      )
    }
  }

  await page.goto(`/app/influenciadores/${alvo.id}`)
  await page.getByRole('tab', { name: /diagnóstico|diagnosis/i }).click()

  const aceitar = page.getByRole('button', { name: /^Aceitar$/i }).first()
  await expect(aceitar).toBeVisible({ timeout: 20_000 })
  await aceitar.click()

  // Quem decidiu aparece na hora — e vem do servidor, não de um palpite local.
  await expect(page.getByText(/decidiu em/i).first()).toBeVisible({ timeout: 15_000 })

  // O que importa: recarregar não desfaz.
  await page.reload()
  await page.getByRole('tab', { name: /diagnóstico|diagnosis/i }).click()
  await expect(page.getByText(/decidiu em/i).first()).toBeVisible({ timeout: 20_000 })

  // E chegou mesmo ao banco, não só à tela.
  const depois = await page.request.get(
    `${API}/influencers/${alvo.id}/analysis`, { headers: alvo.cabecalho }
  )
  const recs = (await depois.json()).data.recommendations
  expect(recs.some((r) => r.decision === 'accepted')).toBe(true)

  // Desfazer devolve o par de botões: decidir por engano acontece.
  await page.getByRole('button', { name: /^Desfazer$/i }).first().click()
  await expect(page.getByRole('button', { name: /^Aceitar$/i }).first()).toBeVisible()
})
