import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, UserX } from 'lucide-react'

import Tabs from '../components/ui/Tabs.jsx'
import Button from '../components/ui/Button.jsx'
import InfluenciadorHeader from '../components/influenciador/InfluenciadorHeader.jsx'
import VisaoGeralTab        from '../components/influenciador/VisaoGeralTab.jsx'
import PostsAnalisadosTab   from '../components/influenciador/PostsAnalisadosTab.jsx'
import DiagnosticoTab       from '../components/influenciador/DiagnosticoTab.jsx'
import HistoricoTab         from '../components/influenciador/HistoricoTab.jsx'
import { useApi } from '../hooks/useApi.js'
import { getInfluencer, getInfluencerAnalysis, getInfluencerAnalysisHistory, getInfluencerPosts }
  from '../services/influencers.js'

export default function Influenciador() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [tab, setTab] = useState('diagnosis')

  const { data: influenciador, loading } = useApi(() => getInfluencer(id), [id])
  const { data: analysis, loading: loadingAnalysis } = useApi(() => getInfluencerAnalysis(id), [id])
  const { data: posts, loading: loadingPosts } = useApi(() => getInfluencerPosts(id), [id])
  const { data: historico, loading: loadingHistorico } =
    useApi(() => getInfluencerAnalysisHistory(id), [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  // Influenciador nao encontrado
  if (!influenciador) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-text-muted">
          <UserX size={22} />
        </span>
        <h2 className="font-display text-xl font-bold text-neutral-100">
          {t('influenciador.notFound.title')}
        </h2>
        <p className="max-w-md text-sm text-text-secondary">{t('influenciador.notFound.subtitle')}</p>
        <Link to="/app/influenciadores">
          <Button variant="primary" leftIcon={ArrowLeft}>
            {t('influenciador.notFound.back')}
          </Button>
        </Link>
      </div>
    )
  }

  const tabItems = [
    { value: 'overview',  label: t('influenciador.tabs.overview') },
    { value: 'posts',     label: t('influenciador.tabs.posts') },
    { value: 'diagnosis', label: t('influenciador.tabs.diagnosis') },
    { value: 'history',   label: t('influenciador.tabs.history') },
  ]

  return (
    <div className="flex flex-col gap-6">
      <InfluenciadorHeader
        influenciador={
          influenciador && {
            ...influenciador,
            // latest_analysis_id vem de /analysis; /influencers/:id nao devolve.
            lastAnalysisId: analysis?.latest_analysis_id?.slice(0, 8) || null,
          }
        }
      />

      {/* Tabs */}
      <Tabs items={tabItems} value={tab} onChange={setTab} />

      {/* Conteudo */}
      <div>
        {tab === 'overview'  && <VisaoGeralTab        influenciador={influenciador} />}
        {tab === 'posts'     && <PostsAnalisadosTab data={posts} loading={loadingPosts} />}
        {tab === 'diagnosis' && <DiagnosticoTab analysis={analysis} loading={loadingAnalysis} />}
        {tab === 'history'   && <HistoricoTab data={historico} loading={loadingHistorico} />}
      </div>
    </div>
  )
}
