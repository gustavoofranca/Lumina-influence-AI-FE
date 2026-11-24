import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Hash } from 'lucide-react'

import Input from './Input.jsx'
import { cnpjCru, cnpjTemDigitosValidos, extrairCnpjColado, mascararCnpj } from '../../lib/limites.js'
import { consultarCnpj } from '../../services/auth.js'

/**
 * CNPJ com máscara (numérico e alfanumérico) e consulta à Receita.
 *
 * A consulta só sai quando o CNPJ está completo, com dígito válido e diferente
 * do `original` gravado. Ela só **recusa** situação impeditiva (baixada, inapta,
 * suspensa, nula); "não encontrado" ou serviço fora do ar viram um aviso, e o
 * CNPJ segue pelo dígito — mesma regra da API.
 *
 * `onChange` recebe o valor já mascarado, não o evento.
 */
export default function CnpjInput({ value, onChange, original = null, onConsulta, error, helperText, ...rest }) {
  const { t } = useTranslation()
  const [resultado, setResultado] = useState({ cru: null, valor: null })
  const avisar = useRef(onConsulta)
  useEffect(() => { avisar.current = onConsulta })

  const cru = cnpjCru(value)
  const consultar = cru.length === 14 && cru !== cnpjCru(original) && cnpjTemDigitosValidos(cru)

  useEffect(() => {
    if (!consultar) return undefined
    let vivo = true
    const espera = setTimeout(() => {
      consultarCnpj(cru)
        .then((r) => {
          if (!vivo) return
          setResultado({ cru, valor: r })
          avisar.current?.(r)
        })
        .catch(() => { if (vivo) setResultado({ cru, valor: 'indisponivel' }) })
    }, 400)
    return () => {
      vivo = false
      clearTimeout(espera)
    }
  }, [cru, consultar])

  // Derivado no render: resultado de outro CNPJ (resposta atrasada) não aparece.
  const atual = !consultar ? null : resultado.cru === cru ? resultado.valor : 'consultando'
  let ajuda = helperText ?? null
  let erroDaConsulta = null
  if (atual === 'consultando') ajuda = t('auth.cnpj.checking')
  else if (atual === 'indisponivel' || (atual && !atual.encontrado)) ajuda = t('auth.cnpj.unavailable')
  else if (atual?.impeditiva) erroDaConsulta = t('auth.cnpj.blocked', { situacao: atual.situacao })
  else if (atual) ajuda = t('auth.cnpj.active', { situacao: atual.situacao })

  return (
    <Input
      leftIcon={Hash}
      placeholder="00.000.000/0000-00"
      maxLength={18}
      autoComplete="off"
      autoCapitalize="characters"
      spellCheck={false}
      {...rest}
      value={value}
      onChange={(e) => onChange(mascararCnpj(e.target.value))}
      onPaste={(e) => {
        e.preventDefault()
        onChange(extrairCnpjColado(e.clipboardData.getData('text')))
      }}
      error={error || erroDaConsulta}
      helperText={ajuda}
    />
  )
}
