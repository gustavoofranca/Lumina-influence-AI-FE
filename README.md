# Lumina Influence AI

> SaaS de auditoria de performance de influenciadores digitais, com IA multimodal (Google Gemini).
> TCC de Engenharia de Software — Gustavo Henrique França.

**Tagline:** *"Pare de queimar verba com métricas de vaidade."*

---

## Status

**Protótipo navegável v1.0 — pronto para banca.**
Todas as 11 etapas concluídas: landing pública, autenticação, dashboard, listagem e análise individual de criadores, campanhas com benchmarking, relatórios em A4 e configurações. Desde a B11 as telas consomem a API real — não há mais dado mockado no projeto.

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

- **Modo escuro sempre** — não há modo claro.
- **Sem `localStorage`/`sessionStorage`** — Context + state em memória. Refresh perde sessão (intencional no protótipo).
- **Sem TypeScript** nesta fase.
- **Sem libs de UI prontas** (Material/Chakra/Antd) — tudo do zero com Tailwind.
- Toda string visível ao usuário passa por `t('chave')` do `react-i18next`.
- Composição de classes Tailwind sempre via `cn()` (`src/lib/cn.js`).
- Ícones são lucide-react (sem importar de outras libs).

---

## Próximos passos (fora do escopo do TCC)

- Backend Flask + PostgreSQL para integração real OAuth com Instagram/TikTok/YouTube
- Integração com Google Gemini API para análises de IA reais
- Exportação real de relatórios em PDF (atualmente exibe toast "em breve")
- Refinamento de responsividade mobile (estrutura preparada com breakpoints `sm:`/`md:`/`lg:`)
- Modelagem de personas e Predictive Layer (deliberadamente fora do escopo do TCC)
