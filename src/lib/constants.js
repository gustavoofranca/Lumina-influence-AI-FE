/** Constantes de UI e de domínio que não vêm da API. */

/** Períodos do filtro do dashboard. `labelKey` resolve em `dashboard.filters.*`. */
export const PERIOD_OPTIONS = [
  { value: '7d',  labelKey: 'period7d' },
  { value: '30d', labelKey: 'period30d' },
  { value: '90d', labelKey: 'period90d' },
]

/** Fusos oferecidos nas preferências da agência. */
export const TIMEZONES = [
  { value: 'America/Sao_Paulo',    label: '(GMT-3) São Paulo' },
  { value: 'America/Manaus',       label: '(GMT-4) Manaus' },
  { value: 'America/Rio_Branco',   label: '(GMT-5) Rio Branco' },
  { value: 'America/New_York',     label: '(GMT-5) New York' },
  { value: 'Europe/London',        label: '(GMT+0) London' },
  { value: 'Europe/Lisbon',        label: '(GMT+0) Lisbon' },
  { value: 'Asia/Tokyo',           label: '(GMT+9) Tokyo' },
]

/** Papéis de usuário, na ordem de exibição. Espelha UserRole no back-end. */
export const ROLE_KEYS = ['admin', 'member', 'viewer']

/** Seções que um relatório pode incluir. Espelha as seções aceitas pelo back-end. */
export const SECTION_KEYS = ['kpis', 'growth', 'benchmark', 'diagnostic', 'recommendations']
