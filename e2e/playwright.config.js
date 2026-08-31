import { defineConfig } from '@playwright/test'

/**
 * Configuração da suíte ponta a ponta.
 *
 * Usa o Chrome já instalado na máquina (`channel: 'chrome'`) em vez de baixar
 * os navegadores do Playwright: são ~200 MB por navegador, e o que interessa
 * aqui é o mesmo motor em que o produto é demonstrado.
 *
 * A stack precisa estar de pé antes (`docker compose up -d` na raiz do
 * workspace) — os testes falam com o front em 5173 e, por ele, com a API em
 * 5000 e o banco no Supabase.
 */
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  // Um processo só: a API roda em servidor de desenvolvimento de processo único
  // e o banco é compartilhado. Paralelizar aqui mede fila, não a interface.
  fullyParallel: false,
  workers: 1,
  // Cada tela faz várias requisições contra o Supabase (~250 ms de ida e volta
  // por consulta); 30 s não cobre o assistente de relatório.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'relatorio' }]],
  use: {
    baseURL: process.env.LUMINA_URL || 'http://localhost:5173',
    channel: 'chrome',
    viewport: { width: 1280, height: 900 },
    locale: 'pt-BR',
    // Sem preferência gravada o produto segue o sistema operacional, e o padrão
    // do Playwright é claro — o que deixaria os testes começando num tema que
    // não é o da demonstração.
    colorScheme: 'dark',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
})
