# Testes ponta a ponta

Suíte Playwright sobre a interface em funcionamento. Cobre os cinco fluxos que
o plano listou — login, conta social, relatório, tema e idioma — mais a
varredura de rotas, que é a automação da verificação 1 da bateria pré-entrega.

## Antes de rodar

1. **A stack precisa estar de pé:** `docker compose up -d` na raiz do workspace
   (front em 5173, API em 5000, banco no Supabase).
2. **O seed precisa estar aplicado:** os testes entram pelo `dev-login`, que usa
   o admin seedado, e leem criadores e campanhas reais.

Não é preciso baixar navegador: a configuração usa o **Chrome já instalado**
(`channel: 'chrome'`).

## Rodar

```bash
cd Lumina-Influence-AI-FE/e2e
npm install          # só na primeira vez
npm test             # suíte inteira
npm run test:headed  # acompanhando no navegador
npm run report       # abre o relatório HTML da última execução
```

Apontar para outro ambiente: `LUMINA_URL=http://outro:5173 npm test`
(e `LUMINA_API` para a API).

## O que cada arquivo cobre

| Arquivo | O que trava |
|---|---|
| `rotas.spec.js` | toda rota renderiza com texto e console limpo — pega tela em branco por import faltante, que build e teste unitário não pegam |
| `login.spec.js` | entrada pelo atalho de desenvolvimento, rota protegida sem sessão, e a ADR-001: sessão sobrevive ao F5, não à aba nova |
| `estado-de-erro.spec.js` | falha de carregamento aparece como erro com "tentar de novo", **nunca** como "nenhuma análise" ou campanha sem participante |
| `conta-social.spec.js` | o estado "conectada" vem do campo `connected`, não da existência do registro |
| `relatorio.spec.js` | assistente do zero à pré-visualização, e a validação que barra o avanço sem campanha |
| `tema-e-idioma.spec.js` | as duas preferências sobrevivem a recarregar e a navegar por URL |

## Decisões de método

- **Um processo só** (`workers: 1`): a API roda em servidor de desenvolvimento
  de processo único e o banco é compartilhado. Paralelizar mediria fila.
- **Espere o texto, não o relógio.** Medir logo após o `goto` lê o DOM antes do
  primeiro render e acusa tela em branco onde não há — foi o que aconteceu com
  `/cadastro` na primeira execução. Todo teste de renderização usa
  `expect.poll`.
- **A aba do produto é `role="tab"`, não `button`.** Procurar por `button`
  espera para sempre.
- **Nada de exportar PDF nem criar campanha:** a suíte roda contra o banco de
  demonstração e não deve sujá-lo. O assistente de relatório para na
  pré-visualização.
