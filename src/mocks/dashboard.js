/**
 * Mocks remanescentes de séries do dashboard.
 *
 * O Dashboard já consome a API — o que sobra aqui alimenta apenas o preview de
 * relatório e a aba de visão geral do influenciador, telas ainda não integradas.
 * Sai junto com elas.
 */

export const KPIS = [
  { key: 'roi',        value: '428%',     change:  12.4, changeType: 'positive' },
  { key: 'engagement', value: '8.92%',    change:  -0.5, changeType: 'negative' },
  { key: 'cac',        value: 'R$ 14,20', change: undefined, hint: 'Optimal range' },
  { key: 'active',     value: '23',       change:   8.0, changeType: 'positive' },
]

// Crescimento — series de alcance organico vs trafego pago
export const GROWTH_SERIES = {
  '7d': [
    { x: 'Seg', organic:  68000, paid: 22000 },
    { x: 'Ter', organic:  74000, paid: 25000 },
    { x: 'Qua', organic:  82000, paid: 28000 },
    { x: 'Qui', organic:  79000, paid: 31000 },
    { x: 'Sex', organic:  91000, paid: 35000 },
    { x: 'Sáb', organic: 104000, paid: 38000 },
    { x: 'Dom', organic: 118000, paid: 41000 },
  ],
  '30d': [
    { x: 'S1', organic: 420000, paid: 140000 },
    { x: 'S2', organic: 480000, paid: 165000 },
    { x: 'S3', organic: 540000, paid: 180000 },
    { x: 'S4', organic: 620000, paid: 210000 },
  ],
  '90d': [
    { x: 'Mar', organic: 1240000, paid:  450000 },
    { x: 'Abr', organic: 1680000, paid:  580000 },
    { x: 'Mai', organic: 2150000, paid:  720000 },
  ],
}
