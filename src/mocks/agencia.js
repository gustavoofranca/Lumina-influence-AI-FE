/**
 * Mock central da agencia (Etapa 10).
 * Dados exibidos nas paginas de Configuracoes > Agencia e Plano.
 */

export const AGENCIA = {
  name:        'Lumina Influence Agency',
  tradeName:   'Lumina',
  cnpj:        '12.345.678/0001-90',
  website:     'https://lumina-agency.com.br',
  industry:    'Marketing de Influência',
  description: 'Agência boutique focada em auditoria de performance e ROI real para influenciadores digitais. Trabalhamos com marcas de tecnologia, beleza e fitness.',
  address:     'Av. Paulista, 1000 — Bela Vista, São Paulo — SP',
  founded:     '2024',
}

export const PLANO_ATUAL = {
  key:        'agency',
  name:       'Plano Agência',
  price:      'R$ 1.297',
  period:     '/mês',
  renewsOn:   '2026-06-08',
  features: [
    'Até 50 influenciadores monitorados',
    '500 análises IA/mês',
    'Benchmarking entre criadores',
    'Exportação de relatórios PDF',
    'Suporte prioritário',
    'Dashboard em tempo real',
  ],
  usage: {
    influencers: { used: 23, limit: 50 },
    analyses:    { used: 312, limit: 500 },
    reports:     { used: 14, limit: 50 },
  },
}

// Plataformas conectadas via OAuth (ou nao)
export const INTEGRACOES = [
  {
    platform: 'instagram',
    accountHandle: '@luminaagency',
    connected: true,
    lastSync: '2026-05-08T10:24:00Z',
    scopes: ['profile', 'media', 'insights'],
  },
  {
    platform: 'tiktok',
    accountHandle: '@lumina_audit',
    connected: true,
    lastSync: '2026-05-08T09:18:00Z',
    scopes: ['profile', 'video.list', 'metrics'],
  },
  {
    platform: 'youtube',
    accountHandle: null,
    connected: false,
    lastSync: null,
    scopes: [],
  },
]

// Fusos horarios suportados
