/** Formatadores de exibição compartilhados entre telas. */

/** Abrevia contagem de seguidores: 1500000 → "1.5M", 12000 → "12k". */
export const formatFollowers = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

/** Abrevia valor em reais: 1500000 → "R$ 1.5M", 12000 → "R$ 12k". */
export function formatBudget(value, locale = 'pt') {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)     return `R$ ${(value / 1_000).toFixed(0)}k`
  return `R$ ${value}`
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Converte uma data da API em Date no fuso local.
 *
 * `new Date('2026-09-01')` é lido como meia-noite UTC: em UTC-3 isso vira
 * 31/08 às 21h e a tela exibe o dia anterior. Datas sem hora (period_start,
 * period_end) são dia de calendário, não instante — montamos com os
 * componentes locais. Data com hora continua no parse padrão.
 */
export function parseApiDate(iso) {
  const dateOnly = DATE_ONLY.exec(iso)
  if (!dateOnly) return new Date(iso)

  const [, year, month, day] = dateOnly
  return new Date(Number(year), Number(month) - 1, Number(day))
}

/** Intervalo de datas legível no idioma ativo. Cai no ISO cru se a data for inválida. */
export function formatDateRange(startISO, endISO, locale) {
  try {
    const opts = { day: '2-digit', month: 'short', year: '2-digit' }
    const fmt = (iso) =>
      parseApiDate(iso).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', opts)
    return `${fmt(startISO)} → ${fmt(endISO)}`
  } catch {
    return `${startISO} → ${endISO}`
  }
}
