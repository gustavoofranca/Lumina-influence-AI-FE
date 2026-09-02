# Lumina Influence AI

> SaaS de auditoria de performance de influenciadores digitais, com IA multimodal (Google Gemini).
> TCC de Engenharia de Software — Gustavo Henrique França.

**Tagline:** *"Pare de queimar verba com métricas de vaidade."*

---

## Status

**Aplicação integrada — pronta para banca.**

As onze etapas de front-end estão concluídas: landing pública, autenticação,
dashboard, listagem e análise individual de criadores, campanhas com
benchmarking, relatórios em A4 e configurações. Desde a B11 **as telas consomem
a API real** — não há dado fictício no front-end.

O que o usuário faz na tela chega ao banco: conectar e sincronizar contas
sociais, rodar análise do Gemini sobre conteúdo real, decidir sobre as
recomendações da IA (com autoria e data), gerir participantes de campanha,
editar e excluir criador, campanha e a própria conta.

O que ainda vem do seed é dado de **demonstração**, e está rotulado como tal na
interface — ver *Limites conhecidos*, abaixo.

---

## Stack

- **Vite** + **React 18** (JS, sem TypeScript)
- **Tailwind CSS v3** com paleta customizada
- **React Router** v6
- **react-i18next** (pt-BR padrão, en como fallback)
- **Lucide React** (ícones), **Recharts** (gráficos)
- **clsx** + **tailwind-merge** via helper `cn()`

---

## Comandos

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento (http://localhost:5173)
npm run dev

# Build de produção em ./dist
npm run build

# Preview local do build
npm run preview
```

Para a banca: rode `npm run dev` e abra `http://localhost:5173` no Chrome em janela maximizada (a UI é desktop-first).

---

## Fluxo de demonstração sugerido

1. **`/`** — Landing pública: rolar pelas 7 seções (Hero com card flutuante "IA Detectou", Comparativo Caos vs Inteligência, 3 Pilares, Planos)
2. Clicar em **Começar agora** → **`/cadastro`** → preencher qualquer dado → entrar
3. **`/app/dashboard`** — Visão geral com KPIs, Growth Trajectory, Diagnóstico em destaque, Top Networks, Network Density
4. Sidebar → **Influenciadores** — filtrar por plataforma/status/faixa, abrir Marina Costa (a tela mais densa do produto)
5. Tab **Diagnóstico IA** — Sentiment Heatmap (24H/7D), Audience Integrity, Video Audit, Neural Confidence, Transcript com timestamps, Recomendações (aceitar/ignorar)
6. Sidebar → **Campanhas** → abrir "Verão 2026" — header completo, benchmarking de criadores, radar de performance multidimensional
7. Sidebar → **Relatórios** → **Novo Relatório** → wizard 4 passos → preview A4 em "papel"
8. Sidebar → **Configurações** — perfil, agência, integrações conectadas, equipe, plano com uso
9. Topbar → avatar → **Sair**
10. **404**: tentar `/qualquer-coisa` → tela de erro customizada

---

## Estrutura de pastas

```
src/
├── components/
│   ├── ui/             # design system (Button, Card, Badge, Modal, etc.)
│   ├── icons/          # PlatformIcons (Instagram/TikTok/YouTube)
│   ├── charts/         # AreaStackedChart, DonutChart, RadarChart
│   ├── layout/         # Sidebar, Topbar, RouteTransition
│   ├── auth/           # ProtectedRoute
│   ├── landing/        # 7 seções da landing pública
│   ├── dashboard/      # KpiGrid, GrowthCard, etc.
│   ├── influenciadores/ # listagem (filtros, tabela, modal)
│   ├── influenciador/  # análise individual + tabs + sub-cards do diagnóstico
│   ├── campanhas/      # CampanhaCard
│   ├── campanha/       # detalhe + wizard de nova campanha
│   ├── relatorio/      # ReportPreview (A4 light)
│   └── configuracoes/  # 6 seções de configurações
├── pages/              # telas roteadas
├── layouts/            # AppLayout, AuthLayout
├── context/            # AuthContext
├── hooks/              # useApi (loading/erro/dados), useScrollReveal
├── services/           # um módulo por recurso da API (auth, dashboard, influencers, campaigns, reports, agency, team)
├── lib/                # api.js (cliente HTTP + Bearer + refresh), cn(), constants, format
├── i18n/
│   ├── index.js        # configuração do react-i18next
│   └── locales/        # pt.json, en.json
├── App.jsx             # rotas + AnimatedRoutes
├── main.jsx            # entry-point
└── index.css           # tokens CSS + Tailwind layers + animações (float, fade-in, scroll reveal)
```

---

## Rotas

| Rota                              | Descrição                                  |
|-----------------------------------|--------------------------------------------|
| `/`                               | Landing pública                            |
| `/login` `/cadastro` `/recuperar-senha` | Autenticação                          |
| `/app/dashboard`                  | Visão geral                                |
| `/app/influenciadores`            | Listagem com filtros                       |
| `/app/influenciadores/:id`        | Análise individual (4 tabs)                |
| `/app/campanhas`                  | Listagem em cards                          |
| `/app/campanhas/nova`             | Wizard de criação (3 passos)               |
| `/app/campanhas/:id`              | Detalhe + benchmarking + radar             |
| `/app/relatorios`                 | Listagem                                   |
| `/app/relatorios/novo`            | Wizard + preview A4 (4 passos)             |
| `/app/configuracoes/:tab`         | 6 sub-páginas (perfil, agencia, integracoes, equipe, plano, preferencias) |
| `/design-system`                  | Showcase interno de componentes            |
| `*`                               | 404 customizado                            |

---

## Paleta oficial (resumo)

| Token       | Hex       | Uso                                            |
| ----------- | --------- | ---------------------------------------------- |
| `primary`   | `#7C3AED` | Violeta — CTAs, destaques, links ativos        |
| `secondary` | `#0EA5E9` | Cyan — dados positivos, gráficos               |
| `tertiary`  | `#F43F5E` | Rosa coral — alertas, perigo, bot detection    |
| `neutral`   | `#0F172A` | Azul-marinho profundo — background base do app |

Escala completa (50–900/950) e tokens semânticos (`bg-base`, `bg-surface`, `text-primary` etc.) em [`tailwind.config.js`](./tailwind.config.js).

**Tipografia:**
- **Plus Jakarta Sans** (`font-display`) — headlines, display (600/700/800)
- **Inter** (`font-sans`) — body, labels, UI (400/500/600/700)

---

## Convenções

- **Dois temas.** O escuro é o padrão; o claro deriva dele por uma regra única
  (o fundo do escuro vira a tinta) e a preferência persiste. Ambos verificados
  em contraste AA por teste automatizado.
- **Access token em `sessionStorage`, nunca em `localStorage`.** A sessão
  sobrevive ao F5 e morre com a aba — decisão registrada na
  [ADR-001](../Lumina-Influence-AI-BE/docs/adr/0001-jwt-stateless-sem-revogacao.md)
  e travada por teste ponta a ponta. `localStorage` continua vedado: o token não
  é revogável, e persistir entre sessões do navegador alargaria a janela dele.
- **Sem TypeScript** nesta fase.
- **Sem libs de UI prontas** (Material/Chakra/Antd) — tudo do zero com Tailwind.
- Toda string visível ao usuário passa por `t('chave')` do `react-i18next`.
- Composição de classes Tailwind sempre via `cn()` (`src/lib/cn.js`).
- Ícones são lucide-react (sem importar de outras libs).

---

## Testes

Suíte ponta a ponta em Playwright, em [`e2e/`](./e2e/), com `package.json`
próprio. Roda contra a aplicação em funcionamento:

```bash
cd e2e && npm install && npm test
```

Cobre a renderização de todas as rotas, login e persistência de sessão, estado
de erro (que nunca deve aparecer como estado vazio), conta social, relatório,
tema, idioma, foco e navegação por teclado, as páginas legais, os três caminhos
de exclusão de dados, contraste WCAG AA nos dois temas — incluindo os rótulos
em SVG — e a semântica que o leitor de tela recebe.

## Limites conhecidos

- **Instagram e TikTok** respondem `platform_not_configured`: exigem HTTPS
  público e App Review aprovado. O YouTube está conectado por OAuth real. Ver
  [`docs/meta-app-review.md`](../Lumina-Influence-AI-BE/docs/meta-app-review.md).
- **A divisão entre alcance orgânico e pago vem do seed** — nenhuma das
  plataformas concede essa métrica sem programa comercial
  ([ADR-005](../Lumina-Influence-AI-BE/docs/adr/0005-alcance-organico-e-pago-vem-do-seed.md)).
- **ROI e CAC são proxies declarados**, não números financeiros medidos
  ([ADR-002](../Lumina-Influence-AI-BE/docs/adr/0002-kpis-financeiros-como-proxies.md)).

## Fora do escopo do TCC

- Modelagem de personas e Predictive Layer (decisão deliberada)
- Refinamento fino de responsividade abaixo de 390px
