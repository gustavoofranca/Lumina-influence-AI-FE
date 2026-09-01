import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, UserX } from 'lucide-react'

import Tabs from '../components/ui/Tabs.jsx'
import Button from '../components/ui/Button.jsx'
import Toast from '../components/ui/Toast.jsx'
import ApiErrorBanner from '../components/ui/ApiErrorBanner.jsx'
import { PLATFORM_META } from '../components/icons/PlatformIcons.jsx'
import InfluenciadorHeader from '../components/influenciador/InfluenciadorHeader.jsx'
import VisaoGeralTab        from '../components/influenciador/VisaoGeralTab.jsx'
import PostsAnalisadosTab   from '../components/influenciador/PostsAnalisadosTab.jsx'
import DiagnosticoTab       from '../components/influenciador/DiagnosticoTab.jsx'
import HistoricoTab         from '../components/influenciador/HistoricoTab.jsx'
import ExcluirCriadorModal from '../components/influenciador/ExcluirCriadorModal.jsx'
import { useApi } from '../hooks/useApi.js'
import { analyzePost, getInfluencer, getInfluencerAnalysis, getInfluencerAnalysisHistory, getInfluencerPosts }
  from '../services/influencers.js'

export default function Influenciador() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalExcluir, setModalExcluir] = useState(false)
  // Desconectar pode ter apagado o histórico; o cartão devolve a frase que
  // descreve o que de fato aconteceu, e não um "pronto" genérico.
  const [avisoContas, setAvisoContas] = useState(null)

  // O callback do OAuth devolve o navegador com ?conectado=<plataforma>. Abrir
  // direto na Visão Geral coloca o cartão de contas à vista de quem acabou de
  // vincular — cair no Diagnóstico faria a ação parecer não ter surtido efeito.
  const recemConectada = searchParams.get('conectado')
  const [tab, setTab] = useState(recemConectada ? 'overview' : 'diagnosis')
  const [avisoConexao, setAvisoConexao] = useState(recemConectada)

  // Some com o parâmetro para que um F5 não repita o aviso.
  useEffect(() => {
    if (!recemConectada) return
    const limpo = new URLSearchParams(searchParams)
    limpo.delete('conectado')
    setSearchParams(limpo, { replace: true })
  }, [recemConectada, searchParams, setSearchParams])

  const { data: influenciador, loading, error: erroCarregamento,
          refetch: recarregarInfluenciador } =
    useApi(() => getInfluencer(id), [id])
  const { data: analysis, loading: loadingAnalysis, error: erroAnalysis,
          refetch: recarregarAnalise } =
    useApi(() => getInfluencerAnalysis(id), [id])
  const { data: posts, loading: loadingPosts, error: erroPosts,
          refetch: recarregarPosts } =
    useApi(() => getInfluencerPosts(id), [id])
  const [reanalisando, setReanalisando] = useState(false)
  const [erroAnalise, setErroAnalise] = useState(null)

  const { data: historico, loading: loadingHistorico, error: erroHistorico,
          refetch: recarregarHistorico } =
    useApi(() => getInfluencerAnalysisHistory(id), [id])

  /**
   * Reanalisa o post mais recente do criador com o modelo real.
   *
   * Chamada síncrona e cara: ~25s no banco local, ~50s no gerenciado, e
   * consome uma das 20 requisições diárias do free tier. Por isso a cota
   * estourada ganha mensagem própria — dizer "erro ao analisar" mandaria o
   * usuário tentar de novo numa situação em que só o dia seguinte resolve.
   */
  const reanalisar = async () => {
    const alvo = posts?.[0]
    if (!alvo) return
    setErroAnalise(null)
    setReanalisando(true)
    try {
      await analyzePost(alvo.id)
      // O cabeçalho mostra "última análise" a partir do influenciador, não da
      // análise — sem recarregá-lo, a data continuava a antiga.
      await Promise.all([
        recarregarInfluenciador(),
        recarregarAnalise(),
        recarregarPosts(),
        recarregarHistorico(),
      ])
      setTab('diagnosis')
    } catch (err) {
      setErroAnalise(
        err.code === 'gemini_quota_exceeded'
          ? t('influenciador.header.quotaExceeded')
          : err.message
      )
    } finally {
      setReanalisando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  // Falha de carregamento não é ausência de recurso: dizer "não encontrado"
  // num erro de rede manda o usuário procurar um problema que não existe.
  if (erroCarregamento) {
    return (
      <div className="flex flex-col gap-4">
        <ApiErrorBanner error={erroCarregamento} onRetry={recarregarInfluenciador} />
        <Link to="/app/influenciadores" className="self-start">
          <Button variant="outlined" leftIcon={ArrowLeft}>
            {t('influenciador.notFound.back')}
          </Button>
        </Link>
      </div>
    )
  }

  // Influenciador nao encontrado
  if (!influenciador) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-surface text-text-muted">
          <UserX size={22} />
        </span>
        <h2 className="font-display text-xl font-bold text-text-primary">
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

  // Cada aba tem sua propria chamada, e falha de carregamento nao pode sair como
  // estado vazio: dizer "nenhuma analise no historico" quando a requisicao voltou
  // 500 e afirmar sobre o criador um fato que ninguem mediu — na tela que existe
  // para auditar. O banner substitui o conteudo da aba em vez de aparecer acima
  // dele, senao o estado vazio continua na tela contradizendo o erro.
  const falhaDaAba = {
    posts: { erro: erroPosts, recarregar: recarregarPosts },
    diagnosis: { erro: erroAnalysis, recarregar: recarregarAnalise },
    history: { erro: erroHistorico, recarregar: recarregarHistorico },
  }[tab]

  const tabItems = [
    { value: 'overview',  label: t('influenciador.tabs.overview') },
    { value: 'posts',     label: t('influenciador.tabs.posts') },
    { value: 'diagnosis', label: t('influenciador.tabs.diagnosis') },
    { value: 'history',   label: t('influenciador.tabs.history') },
  ]

  return (
    <div className="flex flex-col gap-6">
      <InfluenciadorHeader
        onRerun={reanalisar}
        onExcluir={() => setModalExcluir(true)}
        reanalisando={reanalisando}
        podeReanalisar={Boolean(posts?.length)}
        influenciador={
          influenciador && {
            ...influenciador,
            // latest_analysis_id vem de /analysis; /influencers/:id nao devolve.
            lastAnalysisId: analysis?.latest_analysis_id?.slice(0, 8) || null,
          }
        }
      />

      {erroAnalise && (
        <p className="rounded-xl border border-tertiary-500/30 bg-tertiary-500/10 px-4 py-3 text-sm text-tint-rose">
          {erroAnalise}
        </p>
      )}

      <ExcluirCriadorModal
        open={modalExcluir}
        onClose={() => setModalExcluir(false)}
        influenciador={influenciador}
        onExcluido={() => {
          // `replace` de propósito: voltar pelo histórico cairia na página de um
          // criador que não existe mais, e a tela de "não encontrado" pareceria
          // defeito em vez de consequência.
          navigate('/app/influenciadores', {
            replace: true,
            state: { excluido: influenciador?.name },
          })
        }}
      />

      {/* Tabs */}
      <Tabs items={tabItems} value={tab} onChange={setTab} />

      {/* Conteudo */}
      <div>
        {falhaDaAba?.erro ? (
          <ApiErrorBanner error={falhaDaAba.erro} onRetry={falhaDaAba.recarregar} />
        ) : (
          <>
            {tab === 'overview'  && (
              <VisaoGeralTab
                influenciador={influenciador}
                growth={analysis?.growth_trajectory}
                onContasChange={async (mensagem) => {
                  await recarregarInfluenciador()
                  // Também recarrega os posts: purgar o histórico esvazia a aba,
                  // e deixá-la com o conteúdo antigo mostraria dado apagado.
                  await recarregarPosts()
                  if (mensagem) setAvisoContas(mensagem)
                }}
              />
            )}
            {tab === 'posts'     && <PostsAnalisadosTab data={posts} loading={loadingPosts} />}
            {tab === 'diagnosis' && <DiagnosticoTab analysis={analysis} loading={loadingAnalysis} />}
            {tab === 'history'   && <HistoricoTab data={historico} loading={loadingHistorico} />}
          </>
        )}
      </div>

      <Toast
        open={Boolean(avisoContas)}
        onClose={() => setAvisoContas(null)}
        type="success"
        message={avisoContas || ''}
      />

      <Toast
        open={Boolean(avisoConexao)}
        onClose={() => setAvisoConexao(null)}
        type="success"
        message={t('influenciador.conexoes.connected', {
          plataforma: PLATFORM_META[avisoConexao]?.name || avisoConexao,
        })}
      />
    </div>
  )
}
