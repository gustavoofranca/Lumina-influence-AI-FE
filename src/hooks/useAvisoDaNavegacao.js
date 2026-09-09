import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Aviso que viaja no state de uma navegação e é consumido uma vez.
 *
 * É o padrão da exclusão: a ação acontece numa tela que deixa de existir, e
 * quem precisa avisar que deu certo é a tela seguinte. Sem isso, a ação mais
 * destrutiva do produto termina numa lista silenciosa.
 *
 * ## Por que não limpar com `navigate`
 *
 * A primeira versão fazia `navigate(pathname, { replace: true, state: null })`.
 * Isso funciona quase sempre e falha de vez em quando, que é a pior forma de
 * funcionar: o aviso sumia numa execução a cada suíte completa, sem padrão
 * visível.
 *
 * O motivo é que o valor tinha uma fonte só — `location.state` — e o efeito a
 * apagava logo depois de lida. O `useState` abaixo só a lê **na primeira
 * renderização do componente**. Se o componente for reinicializado depois
 * disso, e há mais de um caminho para isso numa rota carregada sob demanda
 * dentro de um `Suspense`, a segunda leitura encontra o que o efeito já
 * apagou, e o aviso fecha antes de ser visto.
 *
 * `window.history.replaceState` tira o valor do histórico do navegador sem
 * passar pelo roteador: um F5 não repete o aviso, que era o objetivo da
 * limpeza, e o `location` que o React Router guarda em memória continua
 * intacto para qualquer nova leitura. A limpeza deixa de competir com a
 * leitura.
 *
 * O `state` do próprio React Router (`usr`, `key`, `idx`) é preservado — zerar
 * o objeto inteiro faria o roteador perder a posição no histórico, e o botão
 * de voltar do navegador passaria a errar o alvo.
 *
 * @param {string} chave Campo do state que carrega o aviso.
 * @returns {[unknown, () => void]} O valor e a função que o dispensa.
 */
export function useAvisoDaNavegacao(chave) {
  const location = useLocation()
  const [aviso, setAviso] = useState(() => location.state?.[chave] ?? null)

  useEffect(() => {
    if (location.state?.[chave] == null) return
    const atual = window.history.state
    window.history.replaceState({ ...atual, usr: null }, '')
  }, [location, chave])

  return [aviso, () => setAviso(null)]
}
