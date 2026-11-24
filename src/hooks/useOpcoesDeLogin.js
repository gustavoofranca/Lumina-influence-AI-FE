import { useEffect, useState } from 'react'

import { opcoesDeLogin } from '../services/auth.js'

// Uma consulta por carregamento da página: a resposta só muda com a configuração do servidor.
let guardadas = null
// Até a resposta chegar, o botão de demonstração fica escondido: ele não pode
// piscar na tela de produção, onde o atalho não existe.
// A Microsoft também espera a confirmação da API: a credencial dela é opcional
// no servidor, e um botão mostrado antes da hora levaria a pessoa a uma rota que
// responde com erro. Uma resposta sem o campo (API antiga) deixa o botão
// escondido do mesmo jeito, porque `undefined` é falso.
const PADRAO = { dev_login: false, google: true, microsoft: false }

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
