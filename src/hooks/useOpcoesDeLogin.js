import { useEffect, useState } from 'react'

import { opcoesDeLogin } from '../services/auth.js'

// Uma consulta por carregamento da página: a resposta só muda com a configuração do servidor.
let guardadas = null
// Até a resposta chegar, o botão de demonstração fica escondido: ele não pode
// piscar na tela de produção, onde o atalho não existe.
const PADRAO = { dev_login: false, google: true }

export function useOpcoesDeLogin() {
  const [opcoes, setOpcoes] = useState(guardadas ?? PADRAO)

  useEffect(() => {
    if (guardadas) return undefined
    let vivo = true
    opcoesDeLogin()
      .then((o) => {
        guardadas = o
        if (vivo) setOpcoes(o)
      })
      .catch(() => {})
    return () => { vivo = false }
  }, [])

  return opcoes
}
