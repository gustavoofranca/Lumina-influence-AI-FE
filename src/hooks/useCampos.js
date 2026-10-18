import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

/** Id do `<input>` de cada campo — é por ele que o foco vai ao primeiro erro. */
export const idDoCampo = (nome) => `campo-${nome}`

/**
 * Estado, erros e foco de um formulário, no padrão do GOV.UK Design System:
 *
 * - o erro aparece ao **sair** do campo, não a cada tecla;
 * - depois do primeiro erro, o campo revalida enquanto se digita, para a
 *   mensagem sumir assim que a pessoa corrige;
 * - no envio, todos são conferidos e o foco vai para o primeiro errado.
 *
 * `validadores` é `{ campo: (t, valores) => mensagem | null }`; recebe todos
 * os valores porque a senha depende do e-mail e do nome.
 */
export function useCampos(inicial, validadores) {
  const { t } = useTranslation()
  const [campos, setCampos] = useState(inicial)
  const [erros, setErros] = useState({})
  // Os valores mais recentes, já com a última tecla: o estado do React só
  // atualiza no próximo render, e a validação precisa do valor de agora.
  const atuais = useRef(inicial)
  const tocados = useRef(new Set())

  const validar = (nome, valores) => validadores[nome]?.(t, valores) ?? null

  const set = (nome, valor) => {
    atuais.current = { ...atuais.current, [nome]: valor }
    setCampos(atuais.current)
    if (tocados.current.has(nome)) {
      setErros((anteriores) => ({ ...anteriores, [nome]: validar(nome, atuais.current) }))
    } else {
      setErros((anteriores) => (anteriores[nome] ? { ...anteriores, [nome]: undefined } : anteriores))
    }
  }

  const sair = (nome) => {
    tocados.current.add(nome)
    setErros((anteriores) => ({ ...anteriores, [nome]: validar(nome, atuais.current) }))
  }

  const validarTudo = () => {
    const novos = {}
    for (const nome of Object.keys(validadores)) {
      tocados.current.add(nome)
      const mensagem = validar(nome, atuais.current)
      if (mensagem) novos[nome] = mensagem
    }
    setErros(novos)
    const primeiro = Object.keys(validadores).find((nome) => novos[nome])
    if (primeiro) document.getElementById(idDoCampo(primeiro))?.focus()
    return !primeiro
  }

  /** Erros vindos da API (422), já traduzidos para os nomes dos campos. */
  const mostrarErros = (porCampo) => {
    setErros((anteriores) => ({ ...anteriores, ...porCampo }))
    const primeiro = Object.keys(porCampo)[0]
    if (primeiro) document.getElementById(idDoCampo(primeiro))?.focus()
  }

  return { campos, erros, set, sair, validarTudo, mostrarErros }
}
