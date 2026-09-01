import { test, expect } from '@playwright/test'
import { entrarComoAdmin, coletarErros } from './apoio/sessao.js'

/**
 * A quarta limitação da bateria, que estava declarada e não fechada: as sete
 * verificações medem o que o navegador **renderiza**, não o que um leitor de
 * tela **anuncia**.
 *
 * O que dá para medir sem um leitor de tela de verdade é a estrutura de que ele
 * depende: título de documento, marco de conteúdo, hierarquia de cabeçalho,
 * nome acessível e região viva. Não cobre entonação nem ordem de leitura real —
 * isso continua declarado como fora de alcance —, mas cobre as ausências que
 * tornam a navegação impossível, que é onde os dois defeitos abaixo moravam.
 */
const PUBLICAS = ['/', '/login', '/privacidade', '/termos', '/exclusao-de-dados']
const INTERNAS = [
  '/app/dashboard', '/app/influenciadores', '/app/campanhas',
  '/app/relatorios', '/app/configuracoes/perfil',
]

/** Nome acessível aproximado, na ordem que a especificação manda consultar. */
function auditarSemantica() {
  const nomeDe = (el) => (
    el.getAttribute('aria-label')?.trim() ||
    (el.getAttribute('aria-labelledby') || '')
      .split(/\s+/).filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent?.trim() || '')
      .join(' ').trim() ||
    (el.labels?.length ? [...el.labels].map((l) => l.textContent.trim()).join(' ') : '') ||
    el.getAttribute('title')?.trim() ||
    (el.getAttribute('alt') ?? '').trim() ||
    el.textContent.trim()
  )

  const visivel = (el) => {
    const e = getComputedStyle(el)
    if (e.visibility === 'hidden' || e.display === 'none') return false
    const c = el.getBoundingClientRect()
    return c.width > 0 && c.height > 0
  }

  const semNome = []
  for (const el of document.querySelectorAll(
    'button, a[href], input:not([type="hidden"]), select, textarea, [role="tab"], [role="button"]'
  )) {
    if (!visivel(el) || el.disabled) continue
    if (!nomeDe(el)) {
      semNome.push({
        tag: el.tagName.toLowerCase(),
        classe: String(el.className.baseVal ?? el.className).slice(0, 70),
      })
    }
  }

  const niveis = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    .filter(visivel)
    .map((h) => Number(h.tagName[1]))
  const saltos = []
  niveis.forEach((nivel, i) => {
    if (i > 0 && nivel > niveis[i - 1] + 1) saltos.push(`h${niveis[i - 1]} → h${nivel}`)
  })

  return {
    titulo: document.title,
    idioma: document.documentElement.lang,
    mains: document.querySelectorAll('main').length,
    h1s: document.querySelectorAll('h1').length,
    saltosDeNivel: saltos,
    semNome,
    regioesVivas: document.querySelectorAll('[aria-live]').length,
    interativosMedidos: document.querySelectorAll('button, a[href], input, [role="tab"]').length,
  }
}

for (const rota of [...PUBLICAS, ...INTERNAS]) {
  test(`semântica de ${rota}`, async ({ page }) => {
    const erros = coletarErros(page)
    if (rota.startsWith('/app')) await entrarComoAdmin(page)
    await page.goto(rota)
    await expect
      .poll(async () => (await page.locator('body').innerText()).length, { timeout: 20_000 })
      .toBeGreaterThan(200)
    await page.waitForTimeout(800)

    const a = await page.evaluate(auditarSemantica)

    // Guarda contra teste vazio, pela mesma razão das outras varreduras.
    expect(a.interativosMedidos, `nada interativo foi medido em ${rota}`).toBeGreaterThan(0)

    // O título é o anúncio de chegada. Sem ele toda tela se apresenta igual, e
    // navegar de uma seção para outra não anuncia nada.
    expect(a.titulo, `título genérico em ${rota}`).not.toBe('Lumina Influence AI')
    expect(a.titulo.length).toBeGreaterThan(3)

    // Um marco de conteúdo: é o atalho que leva direto ao miolo da página.
    expect(a.mains, `esperava exatamente um <main> em ${rota}`).toBe(1)
    expect(a.h1s, `esperava exatamente um <h1> em ${rota}`).toBe(1)
    expect(a.saltosDeNivel, `hierarquia de cabeçalho pulada em ${rota}`).toEqual([])

    // Controle sem nome é anunciado como "botão", e só.
    expect(a.semNome, JSON.stringify(a.semNome, null, 2)).toEqual([])

    expect(erros).toEqual([])
  })
}

test('o aviso de ação concluída é anunciado, e não só desenhado', async ({ page }) => {
  // O Toast é o que confirma as ações destrutivas. Se a região viva nascer
  // junto com a mensagem, o leitor de tela não estava observando aquele nó e o
  // anúncio se perde — apagar dado sem retorno audível.
  await entrarComoAdmin(page)
  // Numa tela que monta o Toast: ele é por página, e o dashboard não anuncia
  // nada. Região viva onde não há anúncio seria ruído estrutural.
  await page.goto('/app/influenciadores')
  await expect
    .poll(async () => (await page.locator('main').innerText()).length, { timeout: 20_000 })
    .toBeGreaterThan(200)

  const viva = page.locator('[data-toast-live]')
  await expect(viva).toHaveAttribute('aria-live', /polite|assertive/)
  await expect(viva).toHaveAttribute('aria-atomic', 'true')

  // Existe antes de haver mensagem: é essa a condição para o anúncio funcionar.
  await expect(viva).toHaveCount(1)
  expect((await viva.innerText()).trim()).toBe('')
})

test('o idioma declarado no documento acompanha o seletor', async ({ page }) => {
  // `lang` errado faz o leitor de tela ler português com fonética inglesa.
  await page.goto('/')
  await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toMatch(/^pt/)
  await page.getByRole('button', { name: /^EN$/i }).click()
  await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toMatch(/^en/)
})
