import { useTranslation } from 'react-i18next'
import { ArrowUpRight } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Table from '../ui/Table.jsx'
import Badge from '../ui/Badge.jsx'
import { PlatformBadgeList } from '../icons/PlatformIcons.jsx'
import { POSTS_ANALISADOS } from '../../mocks/analise.js'
import { formatFollowers } from '../../lib/format.js'

function formatDate(iso, locale) {
  try {
    return new Date(iso).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: 'short',
    })
  } catch { return iso }
}

export default function PostsAnalisadosTab({ data }) {
  const { t, i18n } = useTranslation()
  const rows = data && data.length ? data : POSTS_ANALISADOS

  const columns = [
    {
      key: 'titulo',
      header: t('influenciador.posts.columns.post'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600/15 text-primary-300 ring-1 ring-inset ring-primary-500/20">
            <ArrowUpRight size={14} />
          </span>
          <span className="font-semibold text-neutral-100">{row.titulo}</span>
        </div>
      ),
    },
    {
      key: 'plataforma',
      header: t('influenciador.posts.columns.platform'),
      render: (row) => <PlatformBadgeList platforms={[row.plataforma]} />,
    },
    {
      key: 'data',
      header: t('influenciador.posts.columns.date'),
      render: (row) => (
        <span className="text-sm text-text-secondary tabular-nums">
          {formatDate(row.data, i18n.language)}
        </span>
      ),
    },
    {
      key: 'alcance',
      header: t('influenciador.posts.columns.reach'),
      align: 'right',
      render: (row) => (
        <span className="font-medium text-neutral-200 tabular-nums">{formatFollowers(row.alcance)}</span>
      ),
    },
    {
      key: 'sentimentScore',
      header: t('influenciador.posts.columns.sentiment'),
      align: 'right',
      render: (row) => {
        const tone =
          row.sentimentScore >= 85 ? 'text-emerald-300'
          : row.sentimentScore >= 70 ? 'text-primary-300'
          : 'text-amber-300'
        return <span className={cn('font-display font-bold tabular-nums', tone)}>{row.sentimentScore}</span>
      },
    },
    {
      key: 'botProbability',
      header: t('influenciador.posts.columns.botRisk'),
      align: 'right',
      render: (row) => {
        const variant = row.botProbability <= 5 ? 'success' : row.botProbability <= 10 ? 'warning' : 'danger'
        return <Badge variant={variant}>{row.botProbability}%</Badge>
      },
    },
  ]

  return (
    <Card glass padding="md">
      <div className="mb-4">
        <CardLabel>{t('influenciador.posts.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('influenciador.posts.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('influenciador.posts.subtitle')}</p>
      </div>
      <Table columns={columns} data={rows} getRowKey={(r) => r.id} className="!border-0" />
    </Card>
  )
}
