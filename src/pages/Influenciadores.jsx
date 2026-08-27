import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import Button from '../components/ui/Button.jsx'
import InfluenciadoresFilters from '../components/influenciadores/InfluenciadoresFilters.jsx'
import InfluenciadoresTable   from '../components/influenciadores/InfluenciadoresTable.jsx'
import AdicionarInfluenciadorModal from '../components/influenciadores/AdicionarInfluenciadorModal.jsx'
import ApiErrorBanner from '../components/ui/ApiErrorBanner.jsx'
import { useApi } from '../hooks/useApi.js'
import { createInfluencer, listInfluencers } from '../services/influencers.js'

const PAGE_SIZE = 8

const RANGE_BOUNDS = {
  micro: [0,         99_999],
  mid:   [100_000,   499_999],
  macro: [500_000,   999_999],
  mega:  [1_000_000, Infinity],
}

function applyFilters(rows, { search, platforms, statuses, range }) {
  const q = search.trim().toLowerCase()

  return rows.filter((inf) => {
    // Search por nome ou handle
    if (q) {
      const haystack = `${inf.name} ${inf.handle}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }

    // Plataformas (OR — basta uma das selecionadas estar no influenciador)
    if (platforms.size > 0 && !inf.platforms.some((p) => platforms.has(p))) return false

    // Status
    if (statuses.size > 0 && !statuses.has(inf.status)) return false

    // Faixa de seguidores
    if (range !== 'all') {
      const [min, max] = RANGE_BOUNDS[range] || [0, Infinity]
      if (inf.followers < min || inf.followers > max) return false
    }

    return true
  })
}

export default function Influenciadores() {
  const { t } = useTranslation()

  // A busca do topo navega para cá com ?q=<termo>; semear o filtro é o que
  // torna aquele atalho um atalho, e não só uma mudança de tela.
  const [searchParams] = useSearchParams()
  const [search,    setSearch]    = useState(searchParams.get('q') || '')
  const [platforms, setPlatforms] = useState(new Set())
  const [statuses,  setStatuses]  = useState(new Set())
  const [range,     setRange]     = useState('all')
  const [page,      setPage]      = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [criando, setCriando] = useState(false)
  const [erroCriacao, setErroCriacao] = useState(null)

  const togglePlatform = (p) => {
    const next = new Set(platforms)
    next.has(p) ? next.delete(p) : next.add(p)
    setPlatforms(next); setPage(1)
  }

  const toggleStatus = (s) => {
    const next = new Set(statuses)
    next.has(s) ? next.delete(s) : next.add(s)
    setStatuses(next); setPage(1)
  }

  const clearFilters = () => {
    setSearch(''); setPlatforms(new Set()); setStatuses(new Set()); setRange('all'); setPage(1)
  }

  const hasFilters = !!search || platforms.size > 0 || statuses.size > 0 || range !== 'all'

  const { data: influencers, loading, error, refetch } = useApi(() => listInfluencers(), [])

  const filtered = useMemo(
    () => applyFilters(influencers || [], { search, platforms, statuses, range }),
    [influencers, search, platforms, statuses, range]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-100 lg:text-4xl">
            {t('influenciadores.title')}
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">{t('influenciadores.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          {!loading && (
            <span className="text-xs text-text-muted">
              {t('influenciadores.filters.results', { count: filtered.length })}
            </span>
          )}
          <Button variant="primary" leftIcon={Plus} onClick={() => setModalOpen(true)}>
            {t('influenciadores.addNew')}
          </Button>
        </div>
      </header>

      <ApiErrorBanner error={error} onRetry={refetch} />

      {/* Filtros */}
      <InfluenciadoresFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        platforms={platforms}
        onTogglePlatform={togglePlatform}
        statuses={statuses}
        onToggleStatus={toggleStatus}
        range={range}
        onRangeChange={(v) => { setRange(v); setPage(1) }}
        hasFilters={hasFilters}
        onClear={clearFilters}
      />

      {/* Tabela + paginação */}
      {/* Com erro de carregamento a tabela não é renderizada: o estado vazio
          dela diria "nenhum criador", afirmando ausência onde houve falha. */}
      {error ? null : (
        <InfluenciadoresTable
          data={filtered}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={loading}
        />
      )}

      {/* Modal */}
      <AdicionarInfluenciadorModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setErroCriacao(null) }}
        submitting={criando}
        error={erroCriacao}
        onSubmit={async (dados) => {
          setCriando(true)
          setErroCriacao(null)
          try {
            await createInfluencer(dados)
            await refetch()
            setModalOpen(false)
          } catch (err) {
            setErroCriacao(err)
          } finally {
            setCriando(false)
          }
        }}
      />
    </div>
  )
}
