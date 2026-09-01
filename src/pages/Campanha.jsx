import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Megaphone } from 'lucide-react'

import Button from '../components/ui/Button.jsx'
import ApiErrorBanner from '../components/ui/ApiErrorBanner.jsx'
import CampanhaHeader     from '../components/campanha/CampanhaHeader.jsx'
import ParticipantesGrid  from '../components/campanha/ParticipantesGrid.jsx'
import BenchmarkTable     from '../components/campanha/BenchmarkTable.jsx'
import RadarComparison    from '../components/campanha/RadarComparison.jsx'
import EditarCampanhaModal from '../components/campanha/EditarCampanhaModal.jsx'
import ConfirmacaoDigitada from '../components/ui/ConfirmacaoDigitada.jsx'
import { useApi } from '../hooks/useApi.js'
import { excluirCampanha, getCampaign, getCampaignBenchmarking, updateCampaign }
  from '../services/campaigns.js'

export default function Campanha() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [excluindo, setExcluindo] = useState(false)
  const { data: campanha, loading, error: erroCarregamento,
          refetch: recarregarCampanha } =
    useApi(() => getCampaign(id), [id])
  const { data: bench, loading: benchLoading, error: erroBench,
          refetch: recarregarBench } =
    useApi(() => getCampaignBenchmarking(id), [id])

  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroEdicao, setErroEdicao] = useState(null)

  const salvarEdicao = async (alterados) => {
    setErroEdicao(null)
    setSalvando(true)
    try {
      await updateCampaign(id, alterados)
      // Período e status alteram o benchmarking, não só o cabeçalho.
      await Promise.all([recarregarCampanha(), recarregarBench()])
      setEditando(false)
    } catch (err) {
      setErroEdicao(err.message)
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  // Mesma distinção da tela do criador: erro de carregamento não é 404.
  if (erroCarregamento) {
    return (
      <div className="flex flex-col gap-4">
        <ApiErrorBanner error={erroCarregamento} onRetry={recarregarCampanha} />
        <Link to="/app/campanhas" className="self-start">
          <Button variant="outlined" leftIcon={ArrowLeft}>
            {t('campanhas.detail.back')}
          </Button>
        </Link>
      </div>
    )
  }

  if (!campanha) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-surface text-text-muted">
          <Megaphone size={22} />
        </span>
        <h2 className="font-display text-xl font-bold text-text-primary">
          {t('campanhas.list.empty.title')}
        </h2>
        <Link to="/app/campanhas">
          <Button variant="primary" leftIcon={ArrowLeft}>
            {t('campanhas.detail.back')}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <CampanhaHeader
        campanha={campanha}
        metrics={bench?.totals}
        onEdit={() => setEditando(true)}
        onExcluir={() => setExcluindo(true)}
      />

      <ConfirmacaoDigitada
        open={excluindo}
        onClose={() => setExcluindo(false)}
        titulo={t('campanha.excluir.title')}
        aviso={t('campanha.excluir.warning', { nome: campanha?.name })}
        itens={[
          t('campanha.excluir.items.participations'),
          t('campanha.excluir.items.budget'),
        ]}
        preservados={[
          t('campanha.excluir.kept.posts'),
          t('campanha.excluir.kept.reports'),
        ]}
        palavra={campanha?.name}
        rotuloConfirmar={t('campanha.excluir.confirm')}
        onConfirmar={async () => {
          await excluirCampanha(id)
          // `replace`: voltar pelo histórico cairia na página de uma campanha
          // que não existe mais, e a tela de "não encontrada" pareceria defeito.
          navigate('/app/campanhas', {
            replace: true, state: { excluida: campanha?.name },
          })
        }}
      />

      <EditarCampanhaModal
        open={editando}
        onClose={() => setEditando(false)}
        campanha={campanha}
        onSave={salvarEdicao}
        salvando={salvando}
        erroApi={erroEdicao}
      />

      {/* Benchmarking que falhou nao pode sair como campanha sem participante:
          os tres blocos abaixo leem a mesma chamada, entao o erro os substitui
          de uma vez, com a acao de tentar de novo. */}
      {erroBench ? (
        <ApiErrorBanner error={erroBench} onRetry={recarregarBench} />
      ) : (
        <>
          <ParticipantesGrid participants={bench?.rows} loading={benchLoading} />

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <BenchmarkTable rows={bench?.rows} loading={benchLoading} />
            </div>
            <div>
              <RadarComparison radar={bench?.radar} loading={benchLoading} />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
