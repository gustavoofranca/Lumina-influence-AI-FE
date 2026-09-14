import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import Table from '../ui/Table.jsx'
import { formatFollowers } from '../../lib/format.js'

// Potencial viral em forma, não em matiz: quantos pontos acendem. Quem não
// distingue cor continua lendo, e o rótulo vai ao lado.
const PONTOS_ACESOS = { low: 1, medium: 2, high: 3 }

// Rosa é reservado para risco, e só. Ativo e monitorar são estados, não
// alertas: ficam neutros e o texto diz qual é.
const STATUS_VARIANT = {
  active:     'neutral',
  monitoring: 'neutral',
  risk:       'danger',
}

/**
 * A nota de ressonância, com a barra que a situa.
 *
 * Eram três faixas de cor — verde, âmbar e rosa — para dizer qualidade. Saíram:
 * o painel usa duas cores, a de medido e a de não medido, e rosa é só risco.
 * O comprimento da barra e o número já situam o valor; a cor dizia a mesma coisa
 * pela terceira vez e gastava o rosa numa nota baixa que não é alerta.
 */

function ScoreCell({ value }) {
  if (value == null) {
    // Sem medição não há barra: uma barra vazia lê como zero medido, e zero é
    // uma afirmação. O travessão diz o que aconteceu — não foi medido.
    return <div className="numerico text-right text-text-muted">—</div>
  }
  return (
    <div className="flex items-center justify-end gap-3">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-[color:var(--track)]">
        <div className="h-full rounded-full bg-medido" style={{ width: `${value}%` }} />
      </div>
      <span className="numerico font-display text-sm font-bold text-text-primary">
        {value}
      </span>
    </div>
  )
}

function PotencialViral({ nivel, rotulo }) {
  const acesos = PONTOS_ACESOS[nivel]
  return (
    <div className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary">
      <span aria-hidden className="inline-flex gap-1">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn('h-1.5 w-1.5 rounded-full', n <= acesos ? 'bg-medido' : 'bg-[color:var(--track)]')}
          />
        ))}
      </span>
      {rotulo}
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
        if (!PONTOS_ACESOS[row.viralPotential]) return <span className="text-text-muted">—</span>
        return (
          <PotencialViral
            nivel={row.viralPotential}
            rotulo={t(`dashboard.topNetworks.viral${row.viralPotential.charAt(0).toUpperCase() + row.viralPotential.slice(1)}`)}
          />
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
    <Card className="flex flex-col gap-5 p-[18px]">
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
        // O corpo da tabela é poço: número não fica sobre o vidro do cartão.
        className="poco !border-0"
      />
    </Card>
  )
}
