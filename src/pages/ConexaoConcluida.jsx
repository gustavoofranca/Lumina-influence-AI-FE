import { useEffect } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { avisarConexao } from '../lib/conexaoPopup.js'

/**
 * Fim da conexão de conta social, dentro da janela pequena.
 *
 * O callback da API manda a janela para cá com `plataforma`, `influenciador` e,
 * se deu errado, `erro`. A página avisa a aba do painel (`lib/conexaoPopup.js`)
 * e se fecha. Pública de propósito: a janela é um contexto de navegação novo, e
 * o que ela carrega aqui não precisa de sessão — quem recarrega o criador é o
 * painel, que tem a dele.
 *
 * Se o navegador recusar o `window.close()`, fica um texto curto dizendo que a
 * janela pode ser fechada. Sem `popup=1` (link antigo, aba comum), segue para a
 * tela do criador como antes.
 */
export default function ConexaoConcluida() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const plataforma = params.get('plataforma')
  const influenciador = params.get('influenciador')
  const erro = params.get('erro')
  const emPopup = params.get('popup') === '1'

  useEffect(() => {
    if (!emPopup) return
    avisarConexao({ plataforma, influenciador, erro })
    window.close()
  }, [emPopup, plataforma, influenciador, erro])

  if (!emPopup) {
    const destino = influenciador
      ? `/app/influenciadores/${influenciador}${erro ? '' : `?conectado=${plataforma}`}`
      : '/app/influenciadores'
    return <Navigate to={destino} replace />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-base px-6 text-center">
      <div className="max-w-sm space-y-3">
        <h1 className="font-display text-xl font-bold text-text-primary">
          {t(erro ? 'conexaoConcluida.erroTitulo' : 'conexaoConcluida.okTitulo')}
        </h1>
        <p className="text-sm text-text-secondary">{t('conexaoConcluida.podeFechar')}</p>
        <Link to="/app/influenciadores" className="text-sm font-semibold text-accent hover:text-accent-strong">
          {t('conexaoConcluida.irAoPainel')}
        </Link>
      </div>
    </main>
  )
}
