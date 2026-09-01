import { test, expect } from '@playwright/test'
import { entrarComoAdmin, coletarErros } from './apoio/sessao.js'

const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

/**
 * Os dois caminhos de exclusão pedidos pelo titular.
 *
 * Nenhum deles é executado até o fim aqui: a exclusão da conta apagaria a
 * agência do seed, e o purge apagaria as publicações que as outras 44
 * verificações usam. O que se mede é o que precede o irreversível — o aviso
 * correto, a guarda de confirmação e a escolha explícita — porque é aí que
 * mora o risco de alguém apagar sem querer.
 *
 * A execução de verdade está travada no back-end, sobre agência descartável,
 * em `tests/test_exclusao_do_titular.py`.
 */
test('desconectar oferece a escolha e não apaga nada sem ela', async ({ page }) => {
  const erros = coletarErros(page)
  await entrarComoAdmin(page)

  // Um criador com conta conectada — o botão de desconectar só existe aí.
  const r = await page.request.get(`${API}/influencers?per_page=100`, {
    headers: { Authorization: `Bearer ${await tokenDe(page)}` },
  })
  const { data } = await r.json()
  const comConta = data.find((i) => (i.social_accounts || []).some((sa) => sa.connected))
  test.skip(!comConta, 'o seed não tem criador com conta conectada nesta base')

  await page.goto(`/app/influenciadores/${comConta.id}`)
  // A tela abre em Diagnóstico; o cartão de contas mora na Visão Geral.
  await page.getByRole('tab', { name: 'Visão Geral' }).click()
  await page.getByRole('button', { name: 'Desconectar' }).first().click()

  const caixa = page.getByRole('checkbox')
  // Desmarcada por padrão: ação destrutiva não pode ser o caminho de menor
  // resistência.
  await expect(caixa).not.toBeChecked()
  await expect(page.getByRole('button', { name: 'Desconectar', exact: true }).last()).toBeVisible()

  // Marcar troca o rótulo do botão: o usuário precisa ver que a ação mudou.
  await caixa.check()
  await expect(page.getByRole('button', { name: 'Desconectar e apagar' })).toBeVisible()

  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  expect(erros).toEqual([])
})

test('a exclusão da conta avisa o que leva junto antes de pedir confirmação', async ({ page }) => {
  const erros = coletarErros(page)
  await entrarComoAdmin(page)
  await page.goto('/app/configuracoes/perfil')

  const cartao = page.getByText('Excluir minha conta').first()
  await expect(cartao).toBeVisible()

  // O aviso precisa declarar o escopo antes do botão existir — qual dos dois
  // depende de haver outro admin na agência, e o teste não fixa isso: fixar
  // faria a suíte depender da composição do seed, não do comportamento.
  const aviso = page.getByText(
    /único administrador|remove a sua conta e o seu acesso/i
  )
  await expect(aviso).toBeVisible()

  // Se for o caso da agência, os números precisam estar lá: "isto apaga tudo"
  // não dá ao titular como reconhecer o que perde.
  if (await page.getByText(/único administrador/i).isVisible()) {
    await expect(page.getByText(/criadores? cadastrados?/i)).toBeVisible()
  }

  await page.getByRole('button', { name: 'Excluir minha conta' }).click()

  const confirmar = page.getByRole('button', { name: 'Excluir definitivamente' })
  await expect(confirmar).toBeDisabled()

  await page.getByLabel('Digite EXCLUIR para confirmar').fill('excluir tudo')
  await expect(confirmar).toBeDisabled()

  await page.getByLabel('Digite EXCLUIR para confirmar').fill('EXCLUIR')
  await expect(confirmar).toBeEnabled()

  // Sai sem confirmar. A sessão precisa continuar de pé.
  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page).toHaveURL(/configuracoes\/perfil/)
  expect(erros).toEqual([])
})

async function tokenDe(page) {
  const r = await page.request.post(`${API}/auth/dev-login`, { data: {} })
  return (await r.json()).data.tokens.access_token
}
