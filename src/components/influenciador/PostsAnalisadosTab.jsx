import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Table from '../ui/Table.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import { PlatformBadgeList } from '../icons/PlatformIcons.jsx'

function formatDate(iso, locale) {
  try {
    return new Date(iso).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  } catch { return iso }
}

const POSTS_POR_PAGINA = 50

/**
 * Ordena pela coluna escolhida. Sem valor (post ainda não analisado não tem
 * sentimento nem risco de bot) vai sempre para o fim, nos dois sentidos: no
 * crescente, tratar ausência como menor poria "—" no topo como se fosse o pior
 * resultado medido.
 */
function ordenar(lista, { key, dir }) {
  const valor = (row) => {
    const v = row[key]
    if (v == null || v === '') return null
    if (key === 'data') return new Date(v).getTime()
    return typeof v === 'string' ? v.toLocaleLowerCase() : v
  }
  const sinal = dir === 'asc' ? 1 : -1
  return [...lista].sort((a, b) => {
    const va = valor(a)
    const vb = valor(b)
    if (va == null && vb == null) return 0
    if (va == null) return 1
    if (vb == null) return -1
    if (typeof va === 'string') return va.localeCompare(vb, 'pt-BR') * sinal
    return (va - vb) * sinal
  })
}

/** Mesmo desenho da paginação da lista de criadores. */
function Paginacao({ page, totalPages, onPageChange }) {
  const { t } = useTranslation()
  if (totalPages <= 1) return null

  const seta = cn(
    'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
    'text-text-secondary disabled:opacity-40',
    'enabled:hover:bg-bg-surface enabled:hover:text-text-primary'
  )
  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-3">
      <span className="text-xs text-text-muted">
        {t('influenciadores.pagination.page', { page, total: totalPages })}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} className={seta}>
          <ChevronLeft size={14} />
          {t('influenciadores.pagination.previous')}
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const num = i + 1
            const active = num === page
            return (
              <button
                key={num}
                type="button"
                onClick={() => onPageChange(num)}
                className={cn(
                  'h-8 w-8 rounded-lg text-xs font-semibold transition-colors',
                  active
                    ? 'bg-primary-600 text-white shadow-glow-soft'
                    : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {num}
              </button>
            )
          })}
        </div>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className={seta}>
          {t('influenciadores.pagination.next')}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

/**
 * Posts coletados do criador, com análise por publicação.
 *
 * "Refazer diagnóstico" no cabeçalho analisa sempre o post mais recente, que
 * muitas vezes é o que menos tem a dizer — um Reel sem comentário nenhum. Aqui
 * quem opera escolhe o post, e a coluna de comentários mostra onde há material:
 * sentimento e probabilidade de bot são medidos sobre eles.
 *
 * Uma análise por vez, de propósito. Cada clique é uma chamada síncrona ao
 * Gemini e consome cota; permitir disparos paralelos transformaria um clique
 * ansioso em várias requisições cobradas.
 */
export default function PostsAnalisadosTab({ data, loading = false, onAnalisar, analisandoId = null }) {
  const { t, i18n } = useTranslation()
  const [pagina, setPage] = useState(1)
  // Padrão é o que a API já entrega: mais recente primeiro.
  const [sort, setSort] = useState({ key: 'data', dir: 'desc' })
  const todos = ordenar(loading ? [] : data || [], sort)
  const totalPages = Math.max(1, Math.ceil(todos.length / POSTS_POR_PAGINA))
  // Uma nova coleta pode encolher a lista; a página atual não pode sobrar.
  const page = Math.min(pagina, totalPages)
  const rows = todos.slice((page - 1) * POSTS_POR_PAGINA, page * POSTS_POR_PAGINA)

  // Primeiro clique: maior primeiro (o que se procura numa auditoria); o
  // segundo inverte. Trocar a ordem volta à página 1, onde está o topo dela.
  const trocarOrdem = (key) => {
    setSort((s) => (s.key === key
      ? { key, dir: s.dir === 'desc' ? 'asc' : 'desc' }
      : { key, dir: key === 'titulo' || key === 'plataforma' ? 'asc' : 'desc' }))
    setPage(1)
  }

  const columns = [
    {
      key: 'titulo',
      sortable: true,
      header: t('influenciador.posts.columns.post'),
      // O botão de análise fica aqui, e não numa coluna própria: com sete
      // colunas a tabela passava da largura do cartão e o botão saía cortado.
      render: (row) => (
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600/15 text-accent ring-1 ring-inset ring-primary-500/20">
            <ArrowUpRight size={14} />
          </span>
          <div className="flex min-w-0 flex-col items-start gap-2">
          {/* Legenda de Instagram passa fácil de dez linhas: sem o corte, ela
              empurrava a tabela e o botão de análise saía da tela. O texto
              inteiro fica no título, ao passar o mouse. */}
          <span
            className="line-clamp-2 max-w-[15rem] font-semibold text-text-primary"
            title={row.titulo}
          >
            {row.titulo}
          </span>
          {onAnalisar && (
            <Button
              variant={row.sentimentScore != null ? 'outlined' : 'secondary'}
              size="sm"
              leftIcon={Sparkles}
              loading={analisandoId === row.id}
              disabled={analisandoId != null}
              onClick={() => onAnalisar(row)}
              title={t('influenciador.posts.analyzeHint')}
              className="whitespace-nowrap"
            >
              {analisandoId === row.id
                ? t('influenciador.posts.analyzing')
                : t(row.sentimentScore != null
                  ? 'influenciador.posts.reanalyze'
                  : 'influenciador.posts.analyze')}
            </Button>
          )}
          </div>
        </div>
      ),
    },
    {
      key: 'plataforma',
      sortable: true,
      header: t('influenciador.posts.columns.platform'),
      render: (row) => <PlatformBadgeList platforms={[row.plataforma]} />,
    },
    {
      key: 'data',
      sortable: true,
      header: t('influenciador.posts.columns.date'),
      render: (row) => (
        <span className="whitespace-nowrap text-sm text-text-secondary tabular-nums">
          {formatDate(row.data, i18n.language)}
        </span>
      ),
    },
    {
      key: 'alcance',
      sortable: true,
      header: t('influenciador.posts.columns.reach'),
      align: 'right',
      render: (row) => (
        <span className="font-medium text-text-primary tabular-nums">
          {/* Número inteiro, não "1k": abreviado sem decimal, 1.305 e 1.967
              viravam "1k" e "2k", e a tabela parecia cheia de posts de mil. */}
          {row.alcance == null ? '—' : row.alcance.toLocaleString(i18n.language === 'pt' ? 'pt-BR' : 'en-US')}
        </span>
      ),
    },
    {
      key: 'comentarios',
      sortable: true,
      header: t('influenciador.posts.columns.comments'),
      align: 'right',
      render: (row) => (
        <span className="tabular-nums text-text-secondary">
          {row.comentarios == null ? '—' : row.comentarios}
        </span>
      ),
    },
    {
      key: 'sentimentScore',
      sortable: true,
      header: t('influenciador.posts.columns.sentiment'),
      align: 'right',
      render: (row) => {
        // Post ainda não analisado não recebe cor: verde ou âmbar já seria um
        // veredito sobre um conteúdo que o modelo não leu.
        if (row.sentimentScore == null) {
          return <span className="tabular-nums text-text-muted">—</span>
        }
        const tone =
          row.sentimentScore >= 85 ? 'text-positive'
          : row.sentimentScore >= 70 ? 'text-accent'
          : 'text-caution'
        return <span className={cn('font-display font-bold tabular-nums', tone)}>{row.sentimentScore}</span>
      },
    },
    {
      key: 'botProbability',
      sortable: true,
      header: t('influenciador.posts.columns.botRisk'),
      align: 'right',
      render: (row) => {
        if (row.botProbability == null) {
          return <span className="tabular-nums text-text-muted">—</span>
        }
        const variant = row.botProbability <= 5 ? 'success' : row.botProbability <= 10 ? 'warning' : 'danger'
        return <Badge variant={variant}>{row.botProbability}%</Badge>
      },
    },
  ]


  return (
    <Card padding="md">
      <div className="mb-4">
        <CardLabel>{t('influenciador.posts.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('influenciador.posts.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('influenciador.posts.subtitle')}</p>
      </div>
      <Table
        columns={columns}
        data={rows}
        getRowKey={(r) => r.id}
        sort={sort}
        onSortChange={trocarOrdem}
        className="!border-0"
        emptyState={loading ? t('common.loading') : t('influenciador.posts.empty')}
      />
      <Paginacao page={page} totalPages={totalPages} onPageChange={setPage} />
    </Card>
  )
}
