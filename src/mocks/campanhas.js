/**
 * Mock central de campanhas (Etapa 8).
 * Cada participacao referencia um influenciador do mock central.
 */

export const CAMPANHAS = [
  {
    id: 'cmp-001',
    name: 'Verão 2026 — Tech Lifestyle',
    brand: 'NovaTech Pro',
    industry: 'Tecnologia',
    startDate: '2026-04-01',
    endDate:   '2026-06-30',
    budget:    240000,
    status: 'active',
    description: 'Lançamento da nova linha de gadgets premium da NovaTech, com foco em criadores de tecnologia e produtividade.',
    progress: 64,
    metrics: { posts: 32, totalReach: 4_800_000, avgSentiment: 86 },
    participations: [
      { influenciadorId: 'inf-001', cost: 78000, posts: 12 },
      { influenciadorId: 'inf-005', cost: 56000, posts:  8 },
      { influenciadorId: 'inf-011', cost: 38000, posts:  7 },
      { influenciadorId: 'inf-014', cost: 28000, posts:  5 },
    ],
  },
  {
    id: 'cmp-002',
    name: 'Black Friday Beauty',
    brand: 'Lumière Cosméticos',
    industry: 'Beleza',
    startDate: '2026-10-15',
    endDate:   '2026-12-05',
    budget:    180000,
    status: 'planning',
    description: 'Campanha agressiva de Black Friday focada em conversão direta com microinfluenciadoras de beleza.',
    progress: 0,
    metrics: { posts: 0, totalReach: 0, avgSentiment: 0 },
    participations: [
      { influenciadorId: 'inf-004', cost: 45000, posts: 0 },
      { influenciadorId: 'inf-008', cost: 62000, posts: 0 },
      { influenciadorId: 'inf-010', cost: 73000, posts: 0 },
    ],
  },
  {
    id: 'cmp-003',
    name: 'Fitness Challenge Q2',
    brand: 'PulseTrain',
    industry: 'Fitness',
    startDate: '2026-04-01',
    endDate:   '2026-05-15',
    budget:    95000,
    status: 'active',
    description: 'Desafio de 6 semanas com criadores de fitness e bem-estar para impulsionar a comunidade do app.',
    progress: 78,
    metrics: { posts: 24, totalReach: 2_100_000, avgSentiment: 82 },
    participations: [
      { influenciadorId: 'inf-002', cost: 38000, posts: 9 },
      { influenciadorId: 'inf-012', cost: 22000, posts: 8 },
      { influenciadorId: 'inf-013', cost: 35000, posts: 7 },
    ],
  },
  {
    id: 'cmp-004',
    name: 'Lançamento Pro Series',
    brand: 'AutoVerse',
    industry: 'Automotivo',
    startDate: '2026-02-01',
    endDate:   '2026-03-31',
    budget:    320000,
    status: 'completed',
    description: 'Apresentação do novo SUV elétrico através de 4 criadores especializados em automóveis e estilo de vida.',
    progress: 100,
    metrics: { posts: 28, totalReach: 6_400_000, avgSentiment: 79 },
    participations: [
      { influenciadorId: 'inf-007', cost: 95000, posts:  9 },
      { influenciadorId: 'inf-003', cost: 92000, posts: 11 },
      { influenciadorId: 'inf-005', cost: 78000, posts:  4 },
      { influenciadorId: 'inf-006', cost: 55000, posts:  4 },
    ],
  },
  {
    id: 'cmp-005',
    name: 'Influencer Spotlight',
    brand: 'Aurora Brands',
    industry: 'Moda',
    startDate: '2026-03-15',
    endDate:   '2026-05-10',
    budget:    140000,
    status: 'paused',
    description: 'Campanha multi-marca pausada após reavaliação estratégica do orçamento de Q2.',
    progress: 35,
    metrics: { posts: 9, totalReach: 1_300_000, avgSentiment: 71 },
    participations: [
      { influenciadorId: 'inf-009', cost: 48000, posts: 4 },
      { influenciadorId: 'inf-010', cost: 56000, posts: 3 },
      { influenciadorId: 'inf-015', cost: 36000, posts: 2 },
    ],
  },
]

export const findCampanha = (id) => CAMPANHAS.find((c) => c.id === id)

/* === Helpers === */
