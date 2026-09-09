import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Flame, Activity, Snowflake } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import Table from '../ui/Table.jsx'
import { formatFollowers } from '../../lib/format.js'

const VIRAL_CONFIG = {
  high:   { icon: Flame,     color: 'text-tint-rose' },
  medium: { icon: Activity,  color: 'text-caution' },
  low:    { icon: Snowflake, color: 'text-tint-sky' },
}

const STATUS_VARIANT = {
  active:     'success',
  monitoring: 'warning',
  risk:       'danger',
}

/**
 * A nota de ressonância, com a barra que a situa numa faixa.
 *
 * A cor aqui diz qualidade, e só isso. Antes eram quatro tons, e um deles era
 * o `accent` — a mesma cor de botão, link e item selecionado. Numa tabela de
 * seis linhas isso punha seis marcas da cor de ação em valores que ninguém
 * clica, e a cor deixava de significar "aqui se age".
 *
 * Três faixas, não quatro: verde, atenção e risco é o que uma pessoa distingue
 * de relance numa coluna. O quarto degrau existia como gradação estética e
 * cobrava uma decisão de leitura que não levava a lugar nenhum.
 *
 * A barra perdeu o degradê da marca pelo mesmo motivo — ela mede, então herda a
 * cor da faixa. O degradê é a assinatura, não uma régua.
 */
const FAIXA = [
  { minimo: 85, barra: 'bg-positive',  texto: 'text-positive' },
  { minimo: 55, barra: 'bg-caution',   texto: 'text-text-primary' },
  { minimo: 0,  barra: 'bg-tint-rose', texto: 'text-tint-rose' },
]

function ScoreCell({ value }) {
  if (value == null) {
    // Sem medição não há barra: uma barra vazia lê como zero medido, e zero é
    // uma afirmação. O travessão diz o que aconteceu — não foi medido.
    return <div className="numerico text-right text-text-muted">—</div>
  }
  const faixa = FAIXA.find((f) => value >= f.minimo)

  return (
    <div className="flex items-center justify-end gap-3">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-bg-elevated/60">
        <div
          className={cn('h-full rounded-full', faixa.barra)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn('numerico font-display text-sm font-bold', faixa.texto)}>
        {value}
      </span>
    </div>
  )
}

export default function TopNetworksTable({ data, loading = false }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rows = loading ? [] : data || []

  const columns = [
    {
      key: 'creator',
      header: t('dashboard.topNetworks.columns.creator'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div className="min-w-0">
            <div className="truncate font-semibold text-text-primary">{row.name}</div>
            <div className="numerico truncate tipo-apoio text-text-muted">
              {row.handle} · {formatFollowers(row.followers)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'resonanceScore',
      header: t('dashboard.topNetworks.columns.score'),
      align: 'right',
      render: (row) => <ScoreCell value={row.resonanceScore} />,
    },
    {
      key: 'viralPotential',
      header: t('dashboard.topNetworks.columns.viralPotential'),
      render: (row) => {
        // A faixa deriva da ressonância. Sem ressonância medida o back-end
        // manda null, e antes o adaptador inventava "medium" aqui.
        const cfg = VIRAL_CONFIG[row.viralPotential]
        if (!cfg) return <span className="text-text-muted">—</span>
        const Icon = cfg.icon
        return (
          <div className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', cfg.color)}>
            <Icon size={13} />
            {t(`dashboard.topNetworks.viral${row.viralPotential.charAt(0).toUpperCase() + row.viralPotential.slice(1)}`)}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: t('dashboard.topNetworks.columns.status'),
      align: 'right',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]}>
          {t(`dashboard.topNetworks.status${row.status.charAt(0).toUpperCase() + row.status.slice(1)}`)}
        </Badge>
      ),
    },
  ]

  return (
    <Card padding="md" className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('dashboard.label')}</CardLabel>
        <CardTitle className="mt-1.5">{t('dashboard.topNetworks.title')}</CardTitle>
        <p className="tipo-corpo mt-1 text-text-secondary">
          {t('dashboard.topNetworks.subtitle')}
        </p>
      </div>

      <Table
        columns={columns}
        data={rows}
        onRowClick={(row) => navigate(`/app/influenciadores/${row.id}`)}
        getRowKey={(row) => row.id}
        emptyState={loading ? t('common.loading') : t('dashboard.topNetworks.empty')}
        className="!border-0"
      />
    </Card>
  )
}
