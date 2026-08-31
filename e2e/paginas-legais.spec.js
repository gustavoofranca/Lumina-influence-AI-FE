import { test, expect } from '@playwright/test'
import { coletarErros } from './apoio/sessao.js'

/**
 * As três páginas públicas que o App Review da Meta abre antes de olhar o app.
 *
 * O que se mede aqui não é aparência: é que a URL existe, que o texto chegou
 * (a política vem inteira do i18n — chave errada renderiza a chave, não o
 * texto), que o inglês existe, e que o rodapé leva até elas. Antes disso os
 * três links apontavam para '#'.
 */
const PAGINAS = [
  { rota: '/privacidade',       titulo: 'Política de Privacidade', en: 'Privacy Policy' },
  { rota: '/termos',            titulo: 'Termos de Uso',           en: 'Terms of Service' },
  { rota: '/exclusao-de-dados', titulo: 'Exclusão de dados',       en: 'Data deletion' },
]

for (const { rota, titulo, en } of PAGINAS) {
  test(`${rota} publica o documento em português`, async ({ page }) => {
    const erros = coletarErros(page)
    await page.goto(rota)

    await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible()

    // Chave de i18n ausente vaza como o próprio caminho da chave. Procurar só
    // por "legal." acusaria falso: "obrigação legal." e "prazo legal" são texto
    // legítimo do documento. O que não pode aparecer é o caminho completo.
    const corpo = await page.locator('main').innerText()
    expect(corpo).not.toMatch(/legal\.(privacy|terms|deletion)/)
    expect(corpo.length).toBeGreaterThan(1500)

    expect(erros).toEqual([])
  })

  test(`${rota} existe em inglês, o idioma que o revisor lê`, async ({ page }) => {
    await page.goto(rota)
    await page.getByRole('button', { name: /EN/i }).click()
    await expect(page.getByRole('heading', { level: 1, name: en })).toBeVisible()
  })
}

test('o rodapé da landing leva às três páginas em vez de "#"', async ({ page }) => {
  await page.goto('/')
  for (const { rota } of PAGINAS) {
    await expect(page.locator(`footer a[href="${rota}"]`)).toBeVisible()
  }
  // O link de contato precisa de um endereço real, não de uma âncora morta.
  await expect(page.locator('footer a[href^="mailto:"]')).toBeVisible()
})
