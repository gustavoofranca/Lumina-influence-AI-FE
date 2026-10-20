import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { destinoAposLogin, rotaDoSegundoFator, useAuth } from '../context/AuthContext.jsx'

/**
 * Leva uma resposta de login adiante: aplica a sessão e entra, ou, se falta o
 * segundo fator, vai para a tela dele.
 *
 * O ticket viaja no `history.state` da navegação, nunca na URL: assim não fica
 * no histórico do navegador, em log de servidor nem no cabeçalho Referer.
 */
export function useSeguirEntrada() {
  const navigate = useNavigate()
  const { aplicarSessao } = useAuth()

  return useCallback((dados) => {
    const rota = rotaDoSegundoFator(dados)
    if (rota) {
      navigate(rota, { replace: true, state: { ticket: dados.mfa_ticket } })
      return
    }
    aplicarSessao(dados)
    navigate(destinoAposLogin(dados.user, dados.agency), { replace: true })
  }, [aplicarSessao, navigate])
}
