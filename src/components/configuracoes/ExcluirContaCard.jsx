import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Trash2 } from 'lucide-react'

import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import Modal from '../ui/Modal.jsx'
import ApiErrorBanner from '../ui/ApiErrorBanner.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import { useApi } from '../../hooks/useApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { deleteOwnAccount, previewAccountDeletion } from '../../services/auth.js'

const CONFIRMACAO = 'EXCLUIR'

/**
 * Zona de perigo do perfil: exclusão definitiva da própria conta.
 *
 * A prévia é consultada **antes** de abrir a confirmação, e não depois, porque
 * a consequência muda conforme quem clica: um membro apaga só a si; o último
 * administrador leva a agência inteira, com criadores, publicações, campanhas
 * e relatórios. Dizer isso depois do fato não é aviso.
 *
 * A prévia vem com números, e não com um "isto apaga tudo": o titular precisa
 * reconhecer o que vai perder para conseguir decidir.
 */
export default function ExcluirContaCard() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState('')
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState(null)

  const { data: previa, loading, error: erroPrevia, refetch } = useApi(previewAccountDeletion, [])

  const levaAgencia = previa?.scope === 'agency'
  const confere = texto.trim().toUpperCase() === CONFIRMACAO

  const abrir = () => {
    setTexto('')
    setErro(null)
    setAberto(true)
  }

  const excluir = async () => {
    if (!confere) return
    setExcluindo(true)
    setErro(null)
    try {
      await deleteOwnAccount()
      // A sessão morreu junto com a conta: qualquer requisição seguinte volta
      // 401. Sair aqui é o que evita a tela quebrada em vez do adeus.
      logout()
    } catch (err) {
      setErro(err)
      setExcluindo(false)
    }
  }

  return (
    <>
      <Card className="flex flex-col gap-4 border border-tertiary-500/30 bg-tertiary-500/[0.04]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-tint-rose">
            <AlertTriangle size={18} />
          </span>
          <div className="flex flex-col gap-1">
            <CardTitle>{t('configuracoes.excluirConta.title')}</CardTitle>
            <p className="text-sm leading-relaxed text-text-secondary">
              {t('configuracoes.excluirConta.subtitle')}
            </p>
          </div>
        </div>

        {/* Sem a prévia carregada não há como avisar o que a exclusão levaria,
            e um botão de exclusão sem esse aviso é pior que nenhum botão. */}
        {erroPrevia ? (
          <ApiErrorBanner error={erroPrevia} onRetry={refetch} />
        ) : loading ? (
          <Skeleton className="h-16 w-full rounded-xl" />
        ) : (
          <>
            <div className="rounded-xl bg-bg-surface p-4 text-sm text-text-secondary">
              {levaAgencia ? (
                <>
                  <p className="font-semibold text-tint-rose">
                    {t('configuracoes.excluirConta.scopeAgency', {
                      agencia: previa.agency?.name || '',
                    })}
                  </p>
                  <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
                    <li>{t('configuracoes.excluirConta.counts.influencers', { count: previa.agency.influencers })}</li>
                    <li>{t('configuracoes.excluirConta.counts.campaigns', { count: previa.agency.campaigns })}</li>
                    <li>{t('configuracoes.excluirConta.counts.reports', { count: previa.agency.reports })}</li>
                    <li>{t('configuracoes.excluirConta.counts.members', { count: previa.agency.members })}</li>
                  </ul>
                </>
              ) : (
                <p>{t('configuracoes.excluirConta.scopeAccount')}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                leftIcon={Trash2}
                onClick={abrir}
                className="!text-tint-rose"
              >
                {t('configuracoes.excluirConta.trigger')}
              </Button>
            </div>
          </>
        )}
      </Card>

      <Modal
        open={aberto}
        onClose={excluindo ? undefined : () => setAberto(false)}
        title={t('configuracoes.excluirConta.title')}
        size="md"
        closeOnOverlayClick={!excluindo}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAberto(false)} disabled={excluindo}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              leftIcon={Trash2}
              loading={excluindo}
              disabled={!confere}
              onClick={excluir}
              className="!bg-tertiary-600 !shadow-none hover:!bg-tertiary-500"
            >
              {t('configuracoes.excluirConta.confirm')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-text-secondary">
            {t(levaAgencia
              ? 'configuracoes.excluirConta.warningAgency'
              : 'configuracoes.excluirConta.warningAccount')}
          </p>
          <p className="text-sm font-semibold text-tint-rose">
            {t('configuracoes.excluirConta.irreversible')}
          </p>

          {erro ? <ApiErrorBanner error={erro} /> : null}

          <Input
            label={t('configuracoes.excluirConta.prompt', { palavra: CONFIRMACAO })}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            disabled={excluindo}
            autoComplete="off"
          />
        </div>
      </Modal>
    </>
  )
}
